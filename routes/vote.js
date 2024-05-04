const express = require("express");
const router = express.Router();
const conn = require("../db/dbConnection");

router.post("/:id", async (req, res) => {
    const projectId = req.params.id;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' '); // Convert to MySQL datetime format

    try {
        // Check if the project exists
        const projectExistsResult = await conn.query(
            "SELECT COUNT(*) AS count FROM projects WHERE project_id = ?",
            [projectId]
        );

        console.log("Project exists result:", projectExistsResult);

        if (!projectExistsResult || !projectExistsResult[0] || !projectExistsResult[0].count) {
            // Project doesn't exist, return error response
            console.error("Project not found");
            return res.status(404).json({ error: "Project not found" });
        }

        // Project exists, proceed with adding the vote

        // Insert new vote into the database
        await conn.query(
            "INSERT INTO votes (project_id, timestamp) VALUES (?, ?)",
            [projectId, timestamp]
        );

        // Update total_votes in Projects table
        await conn.query(
            "UPDATE projects SET total_votes = total_votes + 1 WHERE project_id = ?",
            [projectId]
        );

        console.log("Vote added successfully");
        res.status(201).json({ message: "Vote added successfully" });
    } catch (err) {
        console.error("Error adding vote:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
