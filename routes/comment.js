const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const util = require("util");
const conn = require("../db/dbConnection");


// POST request to add a comment

router.post('/add-comment/:project_id', async (req, res) => {
  const { commenter_id, comment_text } = req.body;
  const project_id = req.params.project_id;

  try {
      const result = await insertComment(project_id, commenter_id, comment_text);

      const studentRows = await conn.query(
          "SELECT student_id FROM project_students WHERE project_id = ?",
          [project_id]
      );
      const students = studentRows.map(row => row.student_id);

      const notificationMessage = `User with id ${commenter_id} has added a comment to your project.`;
      await Promise.all(students.map(student => createNotification(student, commenter_id, project_id, 'comment', notificationMessage)));

      res.status(201).json({ message: 'Comment added successfully', comment_id: result.insertId });
  } catch (err) {
      console.error('Error adding comment:', err);
      res.status(500).json({ error: 'Server error while adding comment' });
  }
});

// Function to insert a comment into the Comments table

function insertComment(project_id, commenter_id, comment_text) {
  return new Promise((resolve, reject) => {
      const query = 'SELECT student_name FROM students WHERE student_id = ?';

      conn.query(query, [commenter_id], (err, results) => {
          if (err) {
              reject(err);
          } else {
              const commenter_name = results[0] ? results[0].student_name : null;

              const sql = 'INSERT INTO comments (project_id, commenter_id, commenter_name, comment_text) VALUES (?, ?, ?, ?)';
              const values = [project_id, commenter_id, commenter_name, comment_text];

              conn.query(sql, values, (err, result) => {
                  if (err) {
                      reject(err);
                  } else {
                      resolve(result);
                  }
              });
          }
      });
  });
}

async function createNotification(recipientId, senderId, projectId, notificationType, message) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO notifications (recipient_id, sender_id, project_id, notification_type, notification_message, read_status) VALUES (?, ?, ?, ?, ?, 'unread')";
    conn.query(sql, [recipientId, senderId, projectId, notificationType, message], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// GET request to SHOW all comments by project_id

router.get("/show-comments/:project_id", async (req, res) => {
  const { project_id } = req.params;

  try {
    const sql = 'SELECT * FROM comments WHERE project_id = ?';

    conn.query(sql, [project_id], (err, results) => {
      if (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ error: "Server error" });
      } else {
        res.status(200).json({ comments: results });
      }
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET request to delete a comment by comment_id

router.delete("/delete-comment/:comment_id", async (req, res) => {
  const { comment_id } = req.params;

  try {
    const sql = 'DELETE FROM comments WHERE comment_id = ?';

    conn.query(sql, [comment_id], (err, result) => {
      if (err) {
        console.error("Error deleting comment:", err);
        res.status(500).json({ error: "Server error" });
      } else {
        if (result.affectedRows > 0) {
          res.status(200).json({ message: "Comment deleted successfully" });
        } else {
          res.status(404).json({ error: "Comment not found" });
        }
      }
    });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
