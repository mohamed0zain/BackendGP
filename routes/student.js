const express = require("express");
const router = express.Router();
const util = require("util");
const conn = require("../db/dbConnection");
const isStudent = require("../middleware/isStudent");

// view grades of a student
router.get("/:student_id/grades", isStudent ,async (req, res) => {
    try {
        const studentId = req.params.student_id;

        const query = util.promisify(conn.query).bind(conn);
        const grades = await query(
            "SELECT project_id, semester_work_grade, final_work_grade, max_semester_work_grade, max_final_work_grade, overall_grade, max_overall_grade FROM project_students WHERE student_id = ?",
            [studentId]
        );

        if (grades.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.status(200).json(grades);
    } catch (err) {
        console.error("Error fetching grades of student:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// get project belongs to the student
router.get('/:student_id', (req, res) => {
    const studentId = req.params.student_id;
  
    // Query to find the project ID associated with the student ID
    const findProjectQuery = 'SELECT project_id FROM project_students WHERE student_id = ?';
  
    // Query to fetch project details using the project ID
    const fetchProjectDetailsQuery = 'SELECT * FROM projects WHERE project_id = ?';
  
    // Execute the first query to find the project ID
    conn.query(findProjectQuery, [studentId], (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Server error' });
      }
  
      if (results.length === 0) {
        // If no project is found for the student, return a message
        return res.status(404).json({ message: 'No project found for the student' });
      }
  
      // Get the project ID from the query results
      const projectId = results[0].project_id;
  
      // Execute the second query to fetch project details using the project ID
      conn.query(fetchProjectDetailsQuery, [projectId], (err, results) => {
        if (err) {
          console.error('Error executing SQL query:', err);
          return res.status(500).json({ error: 'Server error' });
        }
  
        if (results.length === 0) {
          // If no project details are found, return a message
          return res.status(404).json({ message: 'Project details not found' });
        }
  
        // Return the project details
        res.json(results[0]);
      });
    });
  });

module.exports = router;
