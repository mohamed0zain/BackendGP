const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const util = require("util");
const conn = require("../db/dbConnection");


// add a bookmark for a project
router.post("/add-bookmark/:project_id/:student_id", async (req, res) => {
  const { student_id, project_id } = req.params;

  try {
      const bookmarkExists = await checkBookmarkExists(student_id, project_id);

      if (bookmarkExists) {
          await removeBookmark(student_id, project_id);
          return res.status(200).json({ message: "Bookmark removed successfully" });
      } else {
          const projectDetails = await getProjectDetails(project_id);

          if (!projectDetails) {
              return res.status(404).json({ error: "Project not found" });
          }

          const { title, department_name, total_votes } = projectDetails;

          await insertBookmark(student_id, project_id, title, department_name, total_votes);

          return res.status(201).json({ message: "Bookmark added successfully" });
      }
  } catch (error) {
      console.error("Error adding/removing bookmark:", error);
      res.status(500).json({ error: "Failed to add/remove bookmark" });
  }
});

// Function to check if a bookmark exists for the given student and project
function checkBookmarkExists(student_id, project_id) {
  return new Promise((resolve, reject) => {
      const sql = "SELECT COUNT(*) AS count FROM Bookmarks WHERE student_id = ? AND project_id = ?";
      conn.query(sql, [student_id, project_id], (err, result) => {
          if (err) reject(err);
          else resolve(result[0].count > 0);
      });
  });
}

// Function to remove a bookmark from the Bookmarks table
function removeBookmark(student_id, project_id) {
  return new Promise((resolve, reject) => {
      const sql = "DELETE FROM Bookmarks WHERE student_id = ? AND project_id = ?";
      conn.query(sql, [student_id, project_id], (err, result) => {
          if (err) reject(err);
          else resolve();
      });
  });
}



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
    const sql = 
    `SELECT bookmarks.bookmark_id, bookmarks.project_id, projects.title, projects.department_name, projects.total_votes, projects.supervisor_name, projects.graduation_term, projects.graduation_year, projects.github_link
      FROM bookmarks
      INNER JOIN projects ON bookmarks.project_id = projects.project_id
      WHERE bookmarks.student_id = ?;`

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


module.exports = router;
