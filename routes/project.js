const express = require("express");
const router = express.Router();
const conn = require("../db/dbConnection");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);


const storage = multer.diskStorage({
    destination: "project_files/",
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
  });
  const upload = multer({ storage });

  // Create Project

router.post("/create", upload.single("projectFile"), async (req, res) => {
  const {
    title,
    description,
    supervisor_name,
    graduation_year,
    graduation_term,
    department_name,
    github_link,
    teammateData,
    professor_id
  } = req.body;

  const project_file_path = req.file ? req.file.path : null;

  try {
    const studentIds = teammateData.map(teammate => teammate.studentId);
    const existingStudents = await checkExistingStudents(studentIds);
    if (existingStudents.length > 0) {
      return res.status(400).json({ error: "One or more students are already associated with a project" });
    }

    await startTransaction();

    const projectInsertion = await insertProject(
      title,
      description,
      supervisor_name,
      graduation_year,
      graduation_term,
      department_name,
      project_file_path,
      github_link,
      professor_id
    );

    const projectId = projectInsertion.insertId;

    if (teammateData && teammateData.length) {
      for (const teammate of teammateData) {
        await insertProjectStudent(projectId, teammate.name, teammate.studentId);
      }
    }

    await commitTransaction();

    res.status(201).json({ message: "Project and student associations created successfully" });

  } catch (err) {
    console.error("Error in project creation or student association:", err);

    await rollbackTransaction();

    if (project_file_path) {
      fs.unlink(project_file_path, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting uploaded file:", unlinkErr);
        }
      });
    }

    res.status(500).json({ error: "Server error during project creation. Transaction has been rolled back." });
  }
});

function checkExistingStudents(studentIds) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT student_id FROM project_students WHERE student_id IN (?)";
    conn.query(sql, [studentIds], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

function startTransaction() {
  return new Promise((resolve, reject) => {
    conn.beginTransaction((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function commitTransaction() {
  return new Promise((resolve, reject) => {
    conn.commit((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function rollbackTransaction() {
  return new Promise((resolve, reject) => {
    conn.rollback((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function insertProject(title, description, supervisor_name, graduation_year, graduation_term, department_name, project_files_path, github_link, professor_id) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO projects (title, description, supervisor_name, graduation_year, graduation_term, department_name, project_files_path, github_link, approval_status, total_votes, professor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?)";
    conn.query(sql, [title, description, supervisor_name, graduation_year, graduation_term, department_name, project_files_path, github_link, professor_id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

function insertProjectStudent(projectId, studentName, studentId) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO project_students (project_id, student_name, student_id) VALUES (?, ?, ?)";
    conn.query(sql, [projectId, studentName, studentId], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}



// Get all projects Accepted or not

router.get('/all', (req, res) => {
    conn.query('SELECT project_id, title, description, supervisor_name, graduation_year, graduation_term, department_name, project_files_path, github_link, approval_status, total_votes FROM projects', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching projects' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Get project by id

router.get('/:id', (req, res) => {
    const projectId = req.params.id;

    conn.query('SELECT project_id, title, description, supervisor_name, graduation_year, graduation_term, department_name, project_files_path, github_link, IFNULL(approval_status, "pending") AS approval_status, IFNULL(total_votes, 0) AS total_votes FROM projects WHERE project_id = ?', [projectId], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching project' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Project not found' });
        } else {
            res.status(200).json(results[0]);
        }
    });
});


// Update Project by id

router.put("/update/:id", upload.single("projectFile"), async (req, res) => {
  const projectId = req.params.id;

  const {
      title,
      description,
      supervisor_name,
      graduation_year,
      graduation_term,
      department_name,
      github_link,
      professor_id
  } = req.body;

  try {
      let project_file_path = null;
      if (req.file) {
          project_file_path = req.file.path;
      }

      let query = "UPDATE projects SET ";
      const values = [];

      if (title) {
          query += "title = ?, ";
          values.push(title);
      }
      if (description) {
          query += "description = ?, ";
          values.push(description);
      }
      if (supervisor_name) {
          query += "supervisor_name = ?, ";
          values.push(supervisor_name);
      }
      if (graduation_year) {
          query += "graduation_year = ?, ";
          values.push(graduation_year);
      }
      if (graduation_term) {
          query += "graduation_term = ?, ";
          values.push(graduation_term);
      }
      if (department_name) {
          query += "department_name = ?, ";
          values.push(department_name);
      }
      if (github_link) {
          query += "github_link = ?, ";
          values.push(github_link);
      }
      if (project_file_path) {
          query += "project_files_path = ?, ";
          values.push(project_file_path);
      }
      if (professor_id) {
          query += "professor_id = ?, ";
          values.push(professor_id);
      }

      query = query.slice(0, -2);

      query += " WHERE project_id = ?";
      values.push(projectId);

      await conn.query(query, values);

      res.status(200).json({ message: "Project updated successfully" });
  } catch (err) {
      console.error("Error updating project:", err);
      res.status(500).json({ error: "Server error" });
  }
});


// Delete project by id

router.delete('/:id', (req, res) => {
    const projectId = req.params.id;
    conn.query('DELETE FROM projects WHERE project_id = ?', [projectId], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error deleting project' });
        } else {
            res.status(200).json({ message: 'Project deleted successfully' });
        }
    });
});

module.exports = router;
