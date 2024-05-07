const express = require("express");
const router = express.Router();
const conn = require("../db/dbConnection");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
// POST /search
router.post('/search', async (req, res) => {
  const { title, department, year, semester } = req.body;

  try {
    let sql = "SELECT * FROM projects WHERE 1=1";

    const params = [];
    if (title) {
      sql += " AND title LIKE ?";
      params.push(`%${title}%`);
    }
    if (department) {
      sql += " AND department_name = ?";
      params.push(department);
    }
    if (year) {
      sql += " AND graduation_year = ?";
      params.push(year);
    }
    if (semester) {
      sql += " AND graduation_term = ?";
      params.push(semester);
    }

    // Execute the query
    conn.query(sql, params, (err, results) => {
      if (err) {
        console.error("Error searching projects:", err);
        res.status(500).json({ error: "Failed to search projects" });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error("Error searching projects:", error);
    res.status(500).json({ error: "Failed to search projects" });
  }
});

// filter by department
router.post('/Filter-Dep', (req, res) => {
    const { department } = req.body;

    // Construct the SQL query based on the department filter
    let sql = 'SELECT * FROM projects WHERE department_name = ?';

    // Execute the query
    conn.query(sql, [department], (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(results);
    });
});

//filter by semster
router.post('/Filter-semster', (req, res) => {
    const { semester } = req.body;

    // Construct the SQL query based on the semester filter
    let sql = 'SELECT * FROM projects WHERE graduation_term = ?';

    // Execute the query
    conn.query(sql, [semester], (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(results);
    });
});




module.exports = router;  
