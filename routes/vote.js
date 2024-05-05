const express = require("express");
const router = express.Router();
const conn = require("../db/dbConnection");

router.post("/:project_id/:student_id", async (req, res) => {
    const projectId = req.params.project_id;
    const studentId = req.params.student_id;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' '); // Convert to MySQL datetime format

    try {
        // Check if the student exists
        const studentExistsResult = await conn.query(
            "SELECT COUNT(*) AS count FROM students WHERE student_id = ?",
            [studentId]
        );

        console.log("Student exists result:", studentExistsResult);

        if (!studentExistsResult || !studentExistsResult[0] || !studentExistsResult[0].count) {
            // Student doesn't exist, return error response
            console.error("Student not found");
            return res.status(404).json({ error: "Student not found" });
        }

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

        // Check if the user has already voted for the project
        const voteExistsResult = await conn.query(
            "SELECT COUNT(*) AS count FROM votes WHERE project_id = ? AND student_id = ?",
            [projectId, studentId]
        );

        if (voteExistsResult && voteExistsResult[0] && voteExistsResult[0].count) {
            // User has already voted for the project, delete the vote
            await conn.query(
                "DELETE FROM votes WHERE project_id = ? AND student_id = ?",
                [projectId, studentId]
            );

            // Update total_votes in Projects table
            await conn.query(
                "UPDATE projects SET total_votes = total_votes - 1 WHERE project_id = ?",
                [projectId]
            );

            console.log("Vote removed successfully");
            return res.status(200).json({ message: "Vote removed successfully" });
        } else {
            // User has not voted for the project, add the vote

            // Insert new vote into the database
            await conn.query(
                "INSERT INTO votes (project_id, student_id, timestamp) VALUES (?, ?, ?)",
                [projectId, studentId, timestamp]
            );

            // Update total_votes in Projects table
            await conn.query(
                "UPDATE projects SET total_votes = total_votes + 1 WHERE project_id = ?",
                [projectId]
            );

            console.log("Vote added successfully");
            return res.status(201).json({ message: "Vote added successfully" });
        }
    } catch (err) {
        console.error("Error adding/removing vote:", err);
        return res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;
