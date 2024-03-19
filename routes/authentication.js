const router = require("express").Router();
const conn = require("../db/dbConnection");
const { body, validationResult } = require("express-validator");
const util = require("util");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");


//---------------------------------------START OF AUTHENTICATION----------------------------------------------------

// LOGIN
router.post(
  "/login",
  body("email").isEmail().withMessage("please enter a valid email!"),
  body("password")
    .isLength({ min: 8, max: 12 })
    .withMessage("password should be between (8-12) character"),
  async (req, res) => {
    try {
      // 1- VALIDATION REQUEST [manual, express validation]
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF EMAIL EXISTS
      const query = util.promisify(conn.query).bind(conn); // transform query mysql --> promise to use [await/async]
      const user = await query("select * from users where email = ?", [
        req.body.email,
      ]);
      if (user.length == 0) {
        res.status(404).json({
          errors: [
            {
              msg: "email or password not found !",
            },
          ],
        });
      }

      // 3- COMPARE HASHED PASSWORD
      const checkPassword = await bcrypt.compare(
        req.body.password,
        user[0].password
      );
      if (checkPassword) {
        delete user[0].password;
        const newToken = crypto.randomBytes(16).toString("hex");
        user[0].token = newToken;
        await query('UPDATE users SET token = ? WHERE id = ?', [newToken, user[0].id]);
        res.status(200).json(user[0]);
      } else {
        res.status(404).json({
          errors: [
            {
              msg: "email or password not found !",
            },
          ],
        });
      }
    } catch (err) {
      res.status(500).json({ err: err });
    }
  }
);

// REGISTRATION
router.post(
  "/register",
  body("email").isEmail().withMessage("please enter a valid email!")
    .custom(value => {
      if (!value.endsWith("@fci.helwan.edu.eg")) {
        throw new Error("Email domain must be '@fci.helwan.edu.eg'")
      } return true;
    }),
  body("name")
    .isString()
    .withMessage("please enter a valid name")
    .isLength({ min: 10, max: 20 })
    .withMessage("name should be between (10-20) character"),
  body("password")
    .isLength({ min: 8, max: 12 })
    .withMessage("password should be between (8-12) character"),
  async (req, res) => {
    try {
      // 1- VALIDATION REQUEST [manual, express validation]
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF EMAIL EXISTS
      const query = util.promisify(conn.query).bind(conn); // transform query mysql --> promise to use [await/async]
      const checkEmailExists = await query(
        "select * from users where email = ?",
        [req.body.email]
      );
      if (checkEmailExists.length > 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "email already exists !",
            },
          ],
        });
      }

      // 3- PREPARE OBJECT USER TO -> SAVE
      const userData = {
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        token: crypto.randomBytes(16).toString("hex"), // JSON WEB TOKEN, CRYPTO -> RANDOM ENCRYPTION STANDARD
      };

      // 4- INSERT USER OBJECT INTO DB
      await query("insert into users set ? ", userData);
      delete userData.password;
      res.status(200).json(userData);
    } catch (err) {
      res.status(500).json({ err: err });
    }
  }
);

//------------------------------------END OF AUTHENTICATION--------------------------------------------------------


//-----------------------------------START OF PROJECTS PAGE--------------------------------------------------------

// Set up multer storage ------------Handels The Poject Images-----------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "project_images/"); // Specify the folder where uploaded images will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  },
});
// Initialize multer instance
const upload = multer({ storage: storage });


// Create a new project
router.post("/projects", upload.single("projectImage"), async (req, res) => {
  const { title, description, supervisor_name, graduation_year, graduation_term, department_name, github_link, leader_email } = req.body;

  try {
    // Check if the email provided exists in the Users table
    const query = util.promisify(conn.query).bind(conn);
    const user = await query("SELECT * FROM Users WHERE email = ?", [leader_email]);
    if (user.length === 0) {
      return res.status(404).json({ error: "User with provided email not found" });
    }

    // If user found, proceed to save project
    const project_image_path = req.file ? req.file.path : null; // Get the path to the uploaded image

    // Insert project into database with default values for approval_status and total_votes
    await conn.query(
      "INSERT INTO Projects (title, description, supervisor_name, graduation_year, graduation_term, department_name, project_image_path, github_link, leader_email, approval_status, total_votes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)",
      [title, description, supervisor_name, graduation_year, graduation_term, department_name, project_image_path, github_link, leader_email]
    );

    // If project insertion successful, image has been saved successfully
    res.status(201).json({ message: "Project created successfully" });
  } catch (err) {
    console.error("Error creating project:", err);
    // If project insertion failed, delete the uploaded image if it exists
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting uploaded image:", unlinkErr);
        }
      });
    }
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

module.exports = router;
