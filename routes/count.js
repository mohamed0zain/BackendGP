const express = require("express");
const router = express.Router();
const conn = require("../db/dbConnection");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);




// Count project accepted
router.get('/accepted-project-count', (req, res) => {
    // Construct the SQL query to count the number of accepted projects
    const sql = 'SELECT COUNT(*) AS acceptedProjectCount FROM projects WHERE approval_status = "Approved"';
  
    // Execute the query
    conn.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        const acceptedProjectCount = results[0].acceptedProjectCount;
        res.json({ acceptedProjectCount });
    });
  });


// Count professors
router.get('/count-professors', (req, res) => {
    // Construct SQL query to count professors
    const sql = 'SELECT COUNT(*) AS professorCount FROM professor';
  
    // Execute the query
    conn.query(sql, (err, result) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Server error' });
      }
  
      // Extract the count from the result
      const professorCount = result[0].professorCount;
  
      // Send the count as a response
      res.json({ professorCount });
    });
  });
  
// Count department
router.get('/department-count', (req, res) => {
    // Query to fetch the enum values from the department_name column
    const query = "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'department_name'";
    conn.query(query, (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Column not found' });
        }

        const enumValues = result[0].COLUMN_TYPE.match(/'[^']+'/g);
        const departmentCount = enumValues ? enumValues.length : 0;

        res.json({ count: departmentCount });
    });
});

router.get('/professor-project-count/:professor_id', (req, res) => {
    const professorId = req.params.professor_id;
    
    // Construct the SQL query to count the projects for the specific professor
    const sql = 'SELECT COUNT(*) AS projectCount FROM projects WHERE professor_id = ?';
    
    // Execute the query
    conn.query(sql, [professorId], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        const projectCount = result[0].projectCount;
        res.json({ projectCount });
    });
});


  module.exports = router;  