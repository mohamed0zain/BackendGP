const express = require("express");
const router = express.Router();
const util = require("util");
const conn = require("../db/dbConnection");
const isStudent = require("../middleware/isStudent");

// Get grades of a student
router.get("/:student_id/grades", isStudent ,async (req, res) => {
    try {
        const studentId = req.params.student_id;

        const query = util.promisify(conn.query).bind(conn);
        const grades = await query(
            "SELECT project_id, semester_work_grade, final_work_grade, max_semester_work_grade, max_final_work_grade FROM project_students WHERE student_id = ?",
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

module.exports = router;
