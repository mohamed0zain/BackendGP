const router = require("express").Router();
const conn = require("../db/dbConnection");
const { body, validationResult } = require("express-validator");
const util = require("util");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Login student

router.post(
  "/student-login",
  body("student_id")
    .isInt()
    .withMessage("Please enter a valid student ID (integer)"),
  body("password")
    .isLength({ min: 8, max: 12 })
    .withMessage("Password should be between (8-12) characters"),
  async (req, res) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(conn.query).bind(conn);
      const student = await query("select * from students where student_id = ?", [
        req.body.student_id,
      ]);
      if (student.length === 0) {
        res.status(404).json({
          errors: [
            {
              msg: "Student ID or password not found!",
            },
          ],
        });
        return;
      }

      const checkPassword = await bcrypt.compare(
        req.body.password,
        student[0].student_password
      );
      if (checkPassword) {
        delete student[0].student_password;
        const newToken = crypto.randomBytes(16).toString("hex");
        student[0].student_token = newToken;


        res.status(200).json(student[0]);
      } else {
        res.status(404).json({
          errors: [
            {
              msg: "Student ID or password not found!",
            },
          ],
        });
      }
    } catch (err) {
      console.error("Error logging in student:", err);
      res.status(500).json({ err: "Server error" });
    }
  }
);

// Register student

router.post(
  "/student-register",
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email!")
    .custom((value) => {
      if (!value.endsWith("@fci.helwan.edu.eg")) {
        throw new Error("Email domain must be '@fci.helwan.edu.eg'");
      }
      return true;
    }),
  body("student_id")
    .isNumeric()
    .withMessage("Please enter a valid student ID"),
  body("student_name")
    .isString()
    .withMessage("Please enter a valid name")
    .isLength({ min: 10, max: 20 })
    .withMessage("Name should be between (10-20) characters"),
  body("password")
    .isLength({ min: 8, max: 12 })
    .withMessage("Password should be between (8-12) characters"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { student_id, email } = req.body;

      // Check if student ID already exists
      const existingStudentId = await conn.query(
        "SELECT * FROM students WHERE student_id = ?",
        [student_id]
      );
      if (existingStudentId.length > 0) {
        return res.status(409).json({
          error: "Student with the same ID already exists"
        });
      }

      // Check if email already exists
      const existingEmail = await conn.query(
        "SELECT * FROM students WHERE student_email = ?",
        [email]
      );
      if (existingEmail.length > 0) {
        return res.status(409).json({
          error: "Student with the same email already exists"
        });
      }

      const studentData = {
        student_id,
        student_name: req.body.student_name,
        student_email: email,
        student_password: await bcrypt.hash(req.body.password, 10),
        student_department: req.body.student_department,
        student_project_id: null,
        student_token: crypto.randomBytes(16).toString("hex")
      };

      await conn.query("INSERT INTO students SET ? ", studentData);
      delete studentData.student_password;
      res.status(201).json(studentData);
    } catch (err) {
      console.error("Error registering student:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);






module.exports = router;
