const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const util = require("util");
const conn = require("../db/dbConnection");


// add a bookmark for a project
router.post("/add-bookmark/:project_id/:student_id", async (req, res) => {
  const { student_id } = req.params; 
  const { project_id } = req.params;

  try {
      const projectDetails = await getProjectDetails(project_id);

      if (!projectDetails) {
          return res.status(404).json({ error: "Project not found" });
      }

      const { title, department_name, total_votes } = projectDetails;

      await insertBookmark(student_id, project_id, title, department_name, total_votes);

      res.status(201).json({ message: "Bookmark added successfully" });
  } catch (error) {
      console.error("Error adding bookmark:", error);
      res.status(500).json({ error: "Failed to add bookmark" });
  }
});


// Function to get project details

function getProjectDetails(project_id) {
  return new Promise((resolve, reject) => {
      const sql = "SELECT title, department_name, total_votes FROM Projects WHERE project_id = ?";
      conn.query(sql, [project_id], (err, result) => {
          if (err) reject(err);
          else if (result.length === 0) resolve(null); 
          else resolve(result[0]);
      });
  });
}

// Function to insert a bookmark into the Bookmarks table

function insertBookmark(student_id, project_id, title, department_name, total_votes) {
  return new Promise((resolve, reject) => {
      const sql = "INSERT INTO Bookmarks (student_id, project_id, title, department_name, total_votes) VALUES (?, ?, ?, ?, ?)";
      conn.query(sql, [student_id, project_id, title, department_name, total_votes], (err, result) => {
          if (err) reject(err);
          else resolve();
      });
  });
}

// Get all the bookmarks associated with this student_id

router.get("/show-bookmarks/:student_id", async (req, res) => {
  const studentId = req.params.student_id;

  try {
    const sql = `
      SELECT bookmarks.bookmark_id, projects.title, projects.department_name, projects.total_votes
      FROM bookmarks
      INNER JOIN projects ON bookmarks.project_id = projects.project_id
      WHERE bookmarks.student_id = ?
    `;
    conn.query(sql, [studentId], (err, result) => {
      if (err) {
        console.error("Error retrieving bookmarks:", err);
        res.status(500).json({ error: "Server error" });
      } else {
        res.status(200).json(result);
      }
    });
  } catch (err) {
    console.error("Error retrieving bookmarks:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// Delete a bookmark by a bookmark_id

router.delete("/delete-bookmarks/:bookmark_id", async (req, res) => {
  const bookmarkId = req.params.bookmark_id;

  try {
    const sql = "DELETE FROM bookmarks WHERE bookmark_id = ?";
    conn.query(sql, [bookmarkId], (err, result) => {
      if (err) {
        console.error("Error deleting bookmark:", err);
        res.status(500).json({ error: "Server error" });
      } else {
        if (result.affectedRows > 0) {
          res.status(200).json({ message: "Bookmark deleted successfully" });
        } else {
          res.status(404).json({ error: "Bookmark not found" });
        }
      }
    });
  } catch (err) {
    console.error("Error deleting bookmark:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
