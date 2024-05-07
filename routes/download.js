
const express = require("express");
const router = express.Router();
const conn = require("../db/dbConnection");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);



//DOWNLOEAD PROJECT FILE
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