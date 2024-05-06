const router = require("express").Router();
const conn = require("../db/dbConnection");
const { body, validationResult } = require("express-validator");
const util = require("util");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const saltRounds = 10;


// Get a list of pending projects

router.get('/pending-projects', (req, res) => {
  conn.query('SELECT * FROM Projects WHERE approval_status = "pending"', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching pending projects' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get a list of accepted projects

router.get('/approved-projects', (req, res) => {
  conn.query('SELECT * FROM projects WHERE approval_status = "Approved"', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching accepted projects' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get a list of rejected projects

router.get('/rejected-projects', (req, res) => {
  conn.query('SELECT * FROM Projects WHERE approval_status = "Rejected"', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching rejected projects' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Function to insert a new professor into the Professors table

function insertProfessor(name, email, password, department, token) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO professor (professor_name, professor_email, professor_password, professor_department, professor_token) VALUES (?, ?, ?, ?, ?)';
    conn.query(sql, [name, email, password, department, token], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

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

// Delete a comment by comment_id

router.delete('/comments/:comment_id', (req, res) => {
  const commentId = req.params.comment_id;

  conn.query('DELETE FROM Comments WHERE comment_id = ?', [commentId], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error deleting comment' });
    } else {
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Comment deleted successfully' });
      } else {
        res.status(404).json({ error: 'Comment not found' });
      }
    }
  });
});

// Delete a student account by student_id

router.delete('/delete-student/:student_id', (req, res) => {
  const studentId = req.params.student_id;

  conn.query('DELETE FROM Students WHERE student_id = ?', [studentId], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error deleting student account' });
    } else {
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Student account deleted successfully' });
      } else {
        res.status(404).json({ error: 'Student account not found' });
      }
    }
  });
});

module.exports = router;
