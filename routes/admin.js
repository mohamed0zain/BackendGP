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

router.get('/accepted-projects', (req, res) => {
  conn.query('SELECT * FROM Projects WHERE approval_status = "accepted"', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching accepted projects' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get a list of rejected projects

router.get('/rejected-projects', (req, res) => {
  conn.query('SELECT * FROM Projects WHERE approval_status = "rejected"', (err, results) => {
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

// Create a new professor
router.post("/create-professor", async (req, res) => {
  const { name, email, password, department } = req.body;

  try {
    const token = crypto.randomBytes(16).toString("hex");

    const hashedPassword = await hashPassword(password);

    await insertProfessor(name, email, hashedPassword, department, token);

    res.status(201).json({ message: "Professor created successfully", token });
  } catch (error) {
    console.error("Error creating professor:", error);
    res.status(500).json({ error: "Server error while creating professor" });
  }
});

// Function to hash a password

async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw error;
  }
}

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
