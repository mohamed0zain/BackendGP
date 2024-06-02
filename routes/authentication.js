const router = require("express").Router();
const conn = require("../db/dbConnection");
const { body, param, validationResult } = require("express-validator");
const util = require("util");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require('nodemailer');



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
      const student = await query(
        "SELECT * FROM students WHERE student_id = ?",
        [req.body.student_id]
      );

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
        // Generate a new token
        const newToken = crypto.randomBytes(16).toString("hex");
        // Update the student_token in the database
        await query(
          "UPDATE students SET student_token = ? WHERE student_id = ?",
          [newToken, req.body.student_id]
        );

        // Remove the password from the response
        delete student[0].student_password;

        // Send the updated student data along with the new token
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

// Change Password for Student
router.put(
  "/:student_id/change-password",
  body("old_password")
    .isLength({ min: 8, max: 12 })
    .withMessage("Old password should be between (8-12) characters"),
  body("new_password")
    .isLength({ min: 8, max: 12 })
    .withMessage("New password should be between (8-12) characters")
    .custom(async (value, { req }) => {
      const oldPassword = req.body.old_password;

      // Check if the old password is the same as the new password
      if (value === oldPassword) {
        throw new Error("New password must be different from the old one");
      }

      return true;
    }),
  async (req, res) => {
    try {
      const studentId = req.params.student_id;
      const { old_password, new_password } = req.body;

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if old password matches the one stored in the database
      const student = await conn.query("SELECT * FROM students WHERE student_id = ?", [studentId]);
      if (student.length === 0) {
        return res.status(404).json({
          error: "Student not found"
        });
      }

      const checkOldPassword = await bcrypt.compare(old_password, student[0].student_password);
      if (!checkOldPassword) {
        return res.status(400).json({
          error: "Old password is incorrect"
        });
      }

      // Update student's password with the new one
      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      await conn.query("UPDATE students SET student_password = ? WHERE student_id = ?", [hashedNewPassword, studentId]);

      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      console.error("Error changing password for student:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);


// Change Email for Student
router.put(
  "/:student_id/change-email",
  param("student_id").isInt().withMessage("Please enter a valid student ID (integer)"),
  body("current_email").isEmail().withMessage("Please enter a valid current email"),
  body("new_email")
    .isEmail().withMessage("Please enter a valid new email")
    .custom(async (value, { req }) => {
      const studentId = req.params.student_id;
      const currentEmail = req.body.current_email;

      // Check if the new email is different from the current one
      if (value === currentEmail) {
        throw new Error("New email must be different from the current one");
      }

      // Check if the new email ends with "@fci.helwan.edu.eg"
      if (!value.endsWith("@fci.helwan.edu.eg")) {
        throw new Error("Email domain must be '@fci.helwan.edu.eg'");
      }

      // Check if the new email is already registered for another student
      const existingEmail = await conn.query(
        "SELECT * FROM students WHERE student_email = ? AND student_id != ?",
        [value, studentId]
      );
      if (existingEmail.length > 0) {
        throw new Error("Student with the same email already exists");
      }

      return true;
    }),
  async (req, res) => {
    try {
      const { student_id } = req.params;
      const { new_email, current_email } = req.body;

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if student exists and if the provided current email matches
      const student = await conn.query("SELECT * FROM students WHERE student_id = ? AND student_email = ?", [student_id, current_email]);
      if (student.length === 0) {
        return res.status(404).json({
          error: "Student not found or current email does not match"
        });
      }

      // Update student's email with the new one
      await conn.query("UPDATE students SET student_email = ? WHERE student_id = ?", [new_email, student_id]);

      res.status(200).json({ message: "Email updated successfully" });
    } catch (err) {
      console.error("Error changing email for student:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);



// Request Password Reset for a student
router.post(
  '/request-password-reset',
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email!')
    .custom((value) => {
      if (!value.endsWith('@fci.helwan.edu.eg')) {
        throw new Error("Email domain must be '@fci.helwan.edu.eg'");
      }
      return true;
    }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(conn.query).bind(conn);
      const email = req.body.email;

      // Check if email exists in the database
      const user = await query('SELECT * FROM students WHERE student_email = ?', [email]);
      if (user.length === 0) {
        return res.status(404).json({ error: 'No account found with that email address.' });
      }

      // Generate a password reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpiration = Date.now() + 3600000; // 1 hour from now

      // Store the token in the database
      await query('UPDATE students SET reset_password_token = ?, reset_password_expires = ? WHERE student_email = ?', [resetToken, resetTokenExpiration, email]);

      // Return the token in the response
      res.status(200).json({ message: 'Password reset token generated successfully!', resetToken });

    } catch (err) {
      console.error('Error requesting password reset:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);


// Reset Password
router.post(
  '/reset-password/:token',
  body('password')
    .isLength({ min: 8, max: 12 })
    .withMessage('Password should be between 8 to 12 characters'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(conn.query).bind(conn);
      const resetToken = req.params.token;
      const newPassword = req.body.password;

      // Find the user by the reset token and check if the token is still valid
      const user = await query('SELECT * FROM students WHERE reset_password_token = ? AND reset_password_expires > ?', [resetToken, Date.now()]);
      if (user.length === 0) {
        return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and clear the reset token and expiration
      await query('UPDATE students SET student_password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = ?', [hashedPassword, resetToken]);

      res.status(200).json({ message: 'Password has been reset successfully!' });
    } catch (err) {
      console.error('Error resetting password:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);



module.exports = router;
