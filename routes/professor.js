const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const util = require("util");
const conn = require("../db/dbConnection");
const crypto = require("crypto");


// Login professor

router.post(
    "/professor-login",
    body("professor_email")
      .isEmail()
      .withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 8, max: 12 })
      .withMessage("Password should be between 8 to 12 characters"),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        const query = util.promisify(conn.query).bind(conn);
        const professor = await query(
          "SELECT * FROM professor WHERE professor_email = ?",
          [req.body.professor_email]
        );
        if (professor.length === 0) {
          return res.status(404).json({
            errors: [{ msg: "Professor email or password not found!" }],
          });
        }
  
        const checkPassword = await bcrypt.compare(
          req.body.password,
          professor[0].professor_password
        );
        if (checkPassword) {
          delete professor[0].professor_password;
          const newToken = crypto.randomBytes(16).toString("hex");
          professor[0].professor_token = newToken;
  
          res.status(200).json(professor[0]);
        } else {
          res.status(404).json({
            errors: [{ msg: "Professor email or password not found!" }],
          });
        }
      } catch (err) {
        console.error("Error logging in professor:", err);
        res.status(500).json({ err: "Server error" });
      }
    }
  );

// GET Professor Profile

router.get("/:professor_id", async (req, res) => {
    try {
        const professorId = req.params.professor_id;

        const query = util.promisify(conn.query).bind(conn);
        const professor = await query(
            "SELECT professor_name, professor_email, professor_department FROM professor WHERE professor_id = ?",
            [professorId]
        );

        if (professor.length === 0) {
            return res.status(404).json({ error: "Professor not found" });
        }

        res.status(200).json(professor[0]);
    } catch (err) {
        console.error("Error fetching professor profile:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// Update Professor Profile

router.put("/:professor_id", [
    body("professor_name")
        .optional()
        .isString()
        .withMessage("Please enter a valid name"),
    body("professor_email")
        .optional()
        .isEmail()
        .withMessage("Please enter a valid email")
        .custom((value) => {
            if (!value.endsWith("@fci.helwan.edu.eg")) {
                throw new Error("Email domain must be '@fci.helwan.edu.eg'");
            }
            return true;
        }),
    body("professor_department")
        .optional()
        .isString()
        .withMessage("Please enter a valid department"),
    body("password")
        .optional()
        .isLength({ min: 8, max: 12 })
        .withMessage("Password should be between 8 to 12 characters"),
], async (req, res) => {
    try {
        const professorId = req.params.professor_id;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const query = util.promisify(conn.query).bind(conn);
        const professor = await query(
            "SELECT * FROM professor WHERE professor_id = ?",
            [professorId]
        );

        if (professor.length === 0) {
            return res.status(404).json({ error: "Professor not found" });
        }

        let updateData = {};
        if (req.body.professor_name) updateData.professor_name = req.body.professor_name;
        if (req.body.professor_email) updateData.professor_email = req.body.professor_email;
        if (req.body.professor_department) updateData.professor_department = req.body.professor_department;
        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            updateData.professor_password = hashedPassword;
        }

        await query("UPDATE professor SET ? WHERE professor_id = ?", [updateData, professorId]);

        res.status(200).json({ message: "Professor profile updated successfully" });
    } catch (err) {
        console.error("Error updating professor profile:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// List Projects Supervised by Professor

router.get("/:professor_id/projects", async (req, res) => {
    try {
        const professorId = req.params.professor_id;


        const query = util.promisify(conn.query).bind(conn);
        const projects = await query(
            "SELECT * FROM projects WHERE project_id IN (SELECT project_id FROM project_professor WHERE professor_id = ?)",
            [professorId]
        );

        res.status(200).json(projects);
    } catch (err) {
        console.error("Error fetching projects supervised by professor:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// List Requested Projects for Professor

router.get("/:professor_id/requested-projects", async (req, res) => {
    try {
        const professorId = req.params.professor_id;

        const query = util.promisify(conn.query).bind(conn);
        const projects = await query(
            "SELECT * FROM projects WHERE approval_status = 'pending' AND professor_id = ?",
            [professorId]
        );

        res.status(200).json(projects);
    } catch (err) {
        console.error("Error fetching requested projects for professor:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// Update Project Status API

router.put("/update/project-status", async (req, res) => {
    try {
        const { project_id, status, professor_id } = req.body;
        if (!project_id || !status || !professor_id) {
            return res.status(400).json({ error: "Project ID, status, and professor ID are required" });
        }

        const countQuery = "SELECT COUNT(*) AS count FROM projects WHERE project_id = ?";
        const [result] = await conn.query(countQuery, [project_id]);
        if (!result || result.length === 0 || result.count === 0) {
            return res.status(404).json({ error: "Project not found" });
        }

        const professorQuery = "SELECT COUNT(*) AS count FROM professor WHERE professor_id = ?";
        const [professorResult] = await conn.query(professorQuery, [professor_id]);
        if (professorResult.count === 0) {
            return res.status(404).json({ error: "Professor not found" });
        }

        const updateStatusQuery = "UPDATE projects SET approval_status = ? WHERE project_id = ?";
        await conn.query(updateStatusQuery, [status, project_id]);

        if (status === "Approved") {
            const checkProjectQuery = "SELECT COUNT(*) AS count FROM project_professor WHERE project_id = ? AND professor_id = ?";
            const [projectResult] = await conn.query(checkProjectQuery, [project_id, professor_id]);
            if (projectResult.count === 0) {
                const addProjectQuery = "INSERT INTO project_professor (project_id, professor_id) VALUES (?, ?)";
                await conn.query(addProjectQuery, [project_id, professor_id]);
            }
            const currentDate = new Date().toISOString().slice(0, 10);
            const setRegistrationDateQuery = "UPDATE projects SET registration_date = ? WHERE project_id = ?";
            await conn.query(setRegistrationDateQuery, [currentDate, project_id]);
        }

        res.status(200).json({ message: "Project status updated successfully" });
    } catch (err) {
        console.error("Error changing project status:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// Assign grades to students

router.put("/project/assign-grades", async (req, res) => {
    try {
        const { professor_id, student_id, project_id, semester_work_grade, final_work_grade, max_semester_work_grade, max_final_work_grade } = req.body;

        const professorExistsQuery = "SELECT COUNT(*) AS count FROM professor WHERE professor_id = ?";
        const [professorResult] = await conn.query(professorExistsQuery, [professor_id]);
        if (professorResult.count === 0) {
            return res.status(404).json({ error: "Professor not found" });
        }

        const projectSupervisedQuery = "SELECT COUNT(*) AS count FROM project_professor WHERE project_id = ? AND professor_id = ?";
        const [projectSupervisedResult] = await conn.query(projectSupervisedQuery, [project_id, professor_id]);
        if (projectSupervisedResult.count === 0) {
            return res.status(403).json({ error: "Professor is not authorized to supervise this project" });
        }

        const projectExistsQuery = "SELECT COUNT(*) AS count FROM project_students WHERE student_id = ? AND project_id = ?";
        const [projectExistsResult] = await conn.query(projectExistsQuery, [student_id, project_id]);
        if (projectExistsResult.count === 0) {
            return res.status(404).json({ error: "Student not found in the specified project" });
        }

        let updateQuery = "UPDATE project_students SET ";
        const updateValues = [];
        if (semester_work_grade !== undefined) {
            updateQuery += "semester_work_grade = ?, ";
            updateValues.push(semester_work_grade);
        }
        if (final_work_grade !== undefined) {
            updateQuery += "final_work_grade = ?, ";
            updateValues.push(final_work_grade);
        }
        if (max_semester_work_grade !== undefined) {
            updateQuery += "max_semester_work_grade = ?, ";
            updateValues.push(max_semester_work_grade);
        }
        if (max_final_work_grade !== undefined) {
            updateQuery += "max_final_work_grade = ?, ";
            updateValues.push(max_final_work_grade);
        }
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += " WHERE student_id = ? AND project_id = ?";
        updateValues.push(student_id, project_id);
        await conn.query(updateQuery, updateValues);

        res.status(200).json({ message: "Grades assigned successfully" });
    } catch (err) {
        console.error("Error assigning grades:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
