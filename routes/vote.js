// Importing necessary modules
const express = require("express");
const router = express.Router(); // Creating an Express router
const conn = require("../db/dbConnection"); // Importing database connection module

// Route to handle upvoting a project
router.post("/:project_id/:student_id", async (req, res) => {
    // Extracting project ID and student ID from request parameters
    const projectId = req.params.project_id;
    const studentId = req.params.student_id;
    // Generating timestamp for the vote
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  
    try {
      // Checking if the student exists in the database
      const studentExistsResult = await conn.query(
        "SELECT COUNT(*) AS count FROM students WHERE student_id = ?",
        [studentId]
      );
  
      console.log("Student exists result:", studentExistsResult);
  
      // If student does not exist, return 404 error
      if (
        !studentExistsResult ||
        !studentExistsResult[0] ||
        !studentExistsResult[0].count
      ) {
        console.error("Student not found");
        return res.status(404).json({ error: "Student not found" });
      }
  
      // Checking if the project exists in the database
      const projectExistsResult = await conn.query(
        "SELECT COUNT(*) AS count FROM projects WHERE project_id = ?",
        [projectId]
      );
  
      console.log("Project exists result:", projectExistsResult);
  
      // If project does not exist, return 404 error
      if (
        !projectExistsResult ||
        !projectExistsResult[0] ||
        !projectExistsResult[0].count
      ) {
        console.error("Project not found");
        return res.status(404).json({ error: "Project not found" });
      }
  
      // Checking if the vote already exists for this project and student
      const voteExistsResult = await conn.query(
        "SELECT COUNT(*) AS count FROM votes WHERE project_id = ? AND student_id = ?",
        [projectId, studentId]
      );
  
      // If a vote already exists, remove the vote and decrement total votes count
      if (voteExistsResult && voteExistsResult[0] && voteExistsResult[0].count) {
        await conn.query(
          "DELETE FROM votes WHERE project_id = ? AND student_id = ?",
          [projectId, studentId]
        );
  
        await conn.query(
          "UPDATE projects SET total_votes = total_votes - 1 WHERE project_id = ?",
          [projectId]
        );
  
        console.log(" Vote removed successfully");
        return res
          .status(200)
          .json({ voteStatus: false, message: "Vote removed successfully" });
      } else {
        // If a vote does not exist, add the vote and increment total votes count
        await conn.query(
          "INSERT INTO votes (project_id, student_id, timestamp) VALUES (?, ?, ?)",
          [projectId, studentId, timestamp]
        );
  
        await conn.query(
          "UPDATE projects SET total_votes = total_votes + 1 WHERE project_id = ?",
          [projectId]
        );
  
        console.log("Vote added successfully");
        return res
          .status(201)
          .json({ voteStatus: true, message: "Vote added successfully" });
      }
    } catch (err) {
      // Catching any errors that occur during database operations
      console.error("Error adding/removing vote:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });
  

module.exports = router; // Exporting the router for use in other modules
