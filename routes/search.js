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




//downloads

router.get('/download/:project_id', async (req, res) => {
    const projectId = req.params.project_id;

    try {
        // Retrieve the file path from the database for the given project ID
        const filePath = await getProjectFilesPath(projectId);

        if (!filePath) {
            return res.status(404).json({ error: 'Project not found or project files path not available' });
        }

        // Set the file path for download
        const absoluteFilePath = path.join(__dirname, '..', filePath); // Assuming the files are stored in a directory named 'project_files'

        // Send the file to the client for download
        res.download(absoluteFilePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).json({ error: 'Failed to download project file' });
            }
        });
    } catch (error) {
        console.error('Error downloading project file:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Function to get project files path from the database
function getProjectFilesPath(projectId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT project_files_path FROM projects WHERE project_id = ?';
        conn.query(sql, [projectId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                if (result.length > 0) {
                    resolve(result[0].project_files_path);
                } else {
                    resolve(null); // Project not found or project files path not available
                }
            }
        });
    });
}





module.exports = router;
