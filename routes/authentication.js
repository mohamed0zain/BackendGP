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

      const studentData = {
        student_id: req.body.student_id,
        student_name: req.body.student_name,
        student_email: req.body.email,
        student_password: await bcrypt.hash(req.body.password, 10),
        student_department: req.body.student_department,
        student_project_id: null,
        student_token: crypto.randomBytes(16).toString("hex"),
      };


      await conn.query("INSERT INTO students SET ? ", studentData);
      delete studentData.student_password;
      res.status(201).json(studentData);
    } catch (err) {
      console.error("Error registering student:", err);

      if (err.sqlMessage && err.sqlMessage.includes("Duplicate entry")) {
        return res.status(409).json({
          error: "Duplicate entry for Student ID or Email",
        });
      }

      res.status(500).json({ error: "Server error" });
    }
  }
);

// Login professor

router.post(
  "/professor-login",
  body("professor_email")
    .isEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 8, max: 12 })
    .withMessage("Password should be between 8 to 12 characters"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(conn.query).bind(conn);
      const professor = await query(
        "SELECT * FROM professor WHERE professor_email = ?",
        [req.body.professor_email]
      );
      if (professor.length === 0) {
        return res.status(404).json({
          errors: [{ msg: "Professor email or password not found!" }],
        });
      }

      const checkPassword = await bcrypt.compare(
        req.body.password,
        professor[0].professor_password
      );
      if (checkPassword) {
        delete professor[0].professor_password;
        const newToken = crypto.randomBytes(16).toString("hex");
        professor[0].professor_token = newToken;

        res.status(200).json(professor[0]);
      } else {
        res.status(404).json({
          errors: [{ msg: "Professor email or password not found!" }],
        });
      }
    } catch (err) {
      console.error("Error logging in professor:", err);
      res.status(500).json({ err: "Server error" });
    }
  }
);

// Register professor

router.post(
  "/professor-register",
  body("professor_email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value) => {
      if (!value.endsWith("@fci.helwan.edu.eg")) {
        throw new Error("Email domain must be '@fci.helwan.edu.eg'");
      }
      return true;
    }),
  body("password")
    .isLength({ min: 8, max: 12 })
    .withMessage("Password should be between 8 to 12 characters"),
  body("professor_department")
    .isString()
    .withMessage("Please enter a valid department"),
  body("professor_id")
    .isInt()
    .withMessage("Please enter a valid professor ID (integer)"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const professorData = {
        professor_id: req.body.professor_id,
        professor_name: req.body.professor_name,
        professor_email: req.body.professor_email,
        professor_password: await bcrypt.hash(req.body.password, 10),
        professor_department: req.body.professor_department,
        professor_token: crypto.randomBytes(16).toString("hex"),
      };

      await conn.query("INSERT INTO professor SET ?", professorData);
      delete professorData.professor_password;
      res.status(201).json(professorData);
    } catch (err) {
      console.error("Error registering professor:", err);

      if (err.sqlMessage && err.sqlMessage.includes("Duplicate entry")) {
        return res.status(409).json({
          error: "Duplicate entry for Professor ID or Email",
        });
      }

      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
