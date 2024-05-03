const router = require("express").Router();
const conn = require("../db/dbConnection");
const { body, validationResult } = require("express-validator");
const util = require("util");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");

//---------------------------------------START OF AUTHENTICATION----------------------------------------------------

router.post(
  "/student-login",
  body("student_id")
    .isInt()
    .withMessage("Please enter a valid student ID (integer)"),
  body("password")
    .isLength({ min: 8, max: 12 })
    .withMessage("Password should be between (8-12) characters"),
  async (req, res) => {
    try {
      // 1- VALIDATION REQUEST [manual, express validation]
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF STUDENT ID EXISTS
      const query = util.promisify(conn.query).bind(conn);
      const student = await query("select * from students where student_id = ?", [
        req.body.student_id,
      ]);
      if (student.length === 0) {
        res.status(404).json({
          errors: [
            {
              msg: "Student ID or password not found!",
            },
          ],
        });
        return; // Exit the function early to prevent further processing
      }

      // 3- COMPARE HASHED PASSWORD
      const checkPassword = await bcrypt.compare(
        req.body.password,
        student[0].student_password
      );
      if (checkPassword) {
        delete student[0].student_password; // Exclude password from response
        const newToken = crypto.randomBytes(16).toString("hex");
        student[0].student_token = newToken;

        // Update student token in database (optional)
        // await query('UPDATE students SET student_token = ? WHERE student_id = ?', [newToken, student[0].student_id]);

        res.status(200).json(student[0]);
      } else {
        res.status(404).json({
          errors: [
            {
              msg: "Student ID or password not found!",
            },
          ],
        });
      }
    } catch (err) {
      console.error("Error logging in student:", err);
      res.status(500).json({ err: "Server error" });
    }
  }
);


router.post(
  "/student-register",
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email!")
    .custom((value) => {
      if (!value.endsWith("@fci.helwan.edu.eg")) {
        throw new Error("Email domain must be '@fci.helwan.edu.eg'");
      }
      return true;
    }),
  body("student_name")
    .isString()
    .withMessage("Please enter a valid name")
    .isLength({ min: 10, max: 20 })
    .withMessage("Name should be between (10-20) characters"),
  body("password")
    .isLength({ min: 8, max: 12 })
    .withMessage("Password should be between (8-12) characters"),
  async (req, res) => {
    try {
      // 1- VALIDATION REQUEST [manual, express validation]
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK FOR DUPLICATE STUDENT ID
      const checkStudentIdExists = await conn.query(
        "select * from students where student_id = ?",
        [req.body.student_id]
      );
      if (checkStudentIdExists.length > 0) {
        return res.status(409).json({
          error: "Student ID already exists!",
        });
      }

      // 3- CHECK FOR DUPLICATE EMAIL
      const checkEmailExists = await conn.query(
        "select * from students where student_email = ?",
        [req.body.email]
      );
      if (checkEmailExists.length > 0) {
        return res.status(409).json({
          error: "Email already exists!",
        });
      }

      // 4- PREPARE STUDENT OBJECT TO -> SAVE
      const studentData = {
        student_id: req.body.student_id,
        student_name: req.body.student_name,
        student_email: req.body.email,
        student_password: await bcrypt.hash(req.body.password, 10),
        student_department: req.body.student_department,
        student_project_id: null,
        student_token: crypto.randomBytes(16).toString("hex"),
      };

      // 5- INSERT STUDENT OBJECT INTO DB
      await conn.query("insert into students set ? ", studentData);
      delete studentData.student_password;
      res.status(201).json(studentData);
    } catch (err) {
      console.error("Error registering student:", err);
      res.status(500).json({ err: "Server error" });
    }
  }
);


//------------------------------------END OF AUTHENTICATION--------------------------------------------------------


//-----------------------------------START OF PROJECTS PAGE--------------------------------------------------------

// Set up multer storage ------------Handels The Poject Images-----------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "project_files/"); // Specify the folder where uploaded RAR files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  },
});

// Initialize multer instance
const upload = multer({ storage: storage });


// Create a new project
router.post("/register-project", upload.single("projectFile"), async (req, res) => {
  const {
    title,
    description,
    supervisor_name,
    graduation_year,
    graduation_term,
    department_name,
    github_link,
  } = req.body;

  try {
    const project_file_path = req.file ? req.file.path : null; // Get the path to the uploaded file

    // Insert project into database with default values
    await conn.query(
      "INSERT INTO Projects (title, description, supervisor_name, graduation_year, graduation_term, department_name, project_files_path, github_link, approval_status, total_votes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)",
      [
        title,
        description,
        supervisor_name,
        graduation_year,
        graduation_term,
        department_name,
        project_file_path,
        github_link,
      ]
    );

    res.status(201).json({ message: "Project created successfully" });
  } catch (err) {
    console.error("Error creating project:", err);
    // If project insertion failed, delete the uploaded file if it exists
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting uploaded file:", unlinkErr);
        }
      });
    }
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/projects/participants", async (req, res) => {
  const { project_id, group_members } = req.body;

  try {
    // Insert group members into ProjectParticipants table
    const participantPromises = group_members.map(async (member) => {
      await conn.query(
        "INSERT INTO ProjectParticipants (project_id, student_name, student_id, grade) VALUES (?, ?, ?, ?)",
        [project_id, member.name, member.id, member.grade]
      );
    });

    await Promise.all(participantPromises);

    res.status(201).json({ message: "Participant details created successfully" });
  } catch (err) {
    console.error("Error creating participant details:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// Get a list of all projects
router.get('/projects', (req, res) => {
  // Fetch all projects from database with selected fields
  conn.query('SELECT project_id, title, description, supervisor_name, graduation_year, graduation_term, department_name, project_image_path, github_link, approval_status, total_votes FROM Projects', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching projects' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get details of a specific project by ID
router.get('/projects/:id', (req, res) => {
  const projectId = req.params.id;
  // Fetch project from database by ID with selected fields
  conn.query('SELECT project_id, title, description, supervisor_name, graduation_year, graduation_term, department_name, project_image_path, github_link, IFNULL(approval_status, "pending") AS approval_status, IFNULL(total_votes, 0) AS total_votes FROM Projects WHERE project_id = ?', [projectId], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching project' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Project not found' });
    } else {
      res.status(200).json(results[0]);
    }
  });
});

// Update an existing project by ID
router.put('/projects/:id', (req, res) => {
  const projectId = req.params.id;
  const { title, description, supervisor_name, graduation_year, graduation_term, department_name, project_image_path, github_link } = req.body;
  // Update project in database by ID
  conn.query('UPDATE Projects SET title = ?, description = ?, supervisor_name = ?, graduation_year = ?, graduation_term = ?, department_name = ?, project_image_path = ?, github_link = ? WHERE project_id = ?', [title, description, supervisor_name, graduation_year, graduation_term, department_name, project_image_path, github_link, projectId], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error updating project' });
    } else {
      res.status(200).json({ message: 'Project updated successfully' });
    }
  });
});

// Delete a project by ID
router.delete('/projects/:id', (req, res) => {
  const projectId = req.params.id;
  // Delete project from database by ID
  conn.query('DELETE FROM Projects WHERE project_id = ?', [projectId], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error deleting project' });
    } else {
      res.status(200).json({ message: 'Project deleted successfully' });
    }
  });
});
//-------------------------------------------------END OF PROJECTS PAGE-------------------------------------------------------


//--------------------------------------------------START OF VOTES--------------------------------------------------------

// Add a new vote to a project
router.post("/projects/:id/votes", async (req, res) => {
  const projectId = req.params.id;
  const timestamp = new Date().toISOString(); // Get current timestamp

  try {
    // Insert new vote into the database
    await conn.query(
      "INSERT INTO Votes (project_id, timestamp) VALUES (?, ?)",
      [projectId, timestamp]
    );

    // Update total_votes in Projects table
    await conn.query(
      "UPDATE Projects SET total_votes = total_votes + 1 WHERE project_id = ?",
      [projectId]
    );

    res.status(201).json({ message: "Vote added successfully" });
  } catch (err) {
    console.error("Error adding vote:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//--------------------------------------------------END OF VOTES--------------------------------------------------------
// lol
module.exports = router;