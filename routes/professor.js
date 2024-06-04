const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const util = require("util");
const conn = require("../db/dbConnection");
const crypto = require("crypto");
const isProfessor = require("../middleware/isProfessor");

// Login professor (DONE)
router.post(
  "/professor-login",
  body("professor_email").isEmail().withMessage("Please enter a valid email"),
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
        // Generate a new token
        const newToken = crypto.randomBytes(16).toString("hex");
        // Update the professor_token in the database
        await query(
          "UPDATE professor SET professor_token = ? WHERE professor_email = ?",
          [newToken, req.body.professor_email]
        );

        // Remove the password from the response
        delete professor[0].professor_password;

        // Send the updated professor data along with the new token
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
router.put(
  "/:professor_id",
  [
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
  ],
  async (req, res) => {
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
      if (req.body.professor_name)
        updateData.professor_name = req.body.professor_name;
      if (req.body.professor_email)
        updateData.professor_email = req.body.professor_email;
      if (req.body.professor_department)
        updateData.professor_department = req.body.professor_department;
      if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        updateData.professor_password = hashedPassword;
      }

      await query("UPDATE professor SET ? WHERE professor_id = ?", [
        updateData,
        professorId,
      ]);

      res
        .status(200)
        .json({ message: "Professor profile updated successfully" });
    } catch (err) {
      console.error("Error updating professor profile:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// List Projects Supervised by Professor (DONE) (??)
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

// List Requested Projects for Professor (DONE)
router.get(
  "/:professor_id/requested-projects",
  isProfessor,
  async (req, res) => {
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
  }
);
// GET APPROVED PROJECTS (DONE)
router.get(
  "/:professor_id/approved-projects",
  isProfessor,
  async (req, res) => {
    try {
      const professorId = req.params.professor_id;

      const query = util.promisify(conn.query).bind(conn);
      const projects = await query(
        "SELECT * FROM projects WHERE approval_status = 'Approved' AND professor_id = ?",
        [professorId]
      );

      res.status(200).json(projects);
    } catch (err) {
      console.error("Error fetching requested projects for professor:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Accept Project API (DONE)
router.put(
  "/accept/project/:project_id/:professor_id",
  isProfessor,
  async (req, res) => {
    try {
      const { project_id, professor_id } = req.params;
      const status = "Approved";

      const countQuery =
        "SELECT COUNT(*) AS count FROM projects WHERE project_id = ?";
      const [result] = await conn.query(countQuery, [project_id]);
      if (!result || result.length === 0 || result.count === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      const professorQuery =
        "SELECT COUNT(*) AS count FROM professor WHERE professor_id = ?";
      const [professorResult] = await conn.query(professorQuery, [
        professor_id,
      ]);
      if (professorResult.count === 0) {
        return res.status(404).json({ error: "Professor not found" });
      }

      const updateStatusQuery =
        "UPDATE projects SET approval_status = ? WHERE project_id = ?";
      await conn.query(updateStatusQuery, [status, project_id]);

      const addProjectQuery =
        "INSERT INTO project_professor (project_id, professor_id) VALUES (?, ?)";
      await conn.query(addProjectQuery, [project_id, professor_id]);

      const currentDate = new Date().toISOString().slice(0, 10);
      const setRegistrationDateQuery =
        "UPDATE projects SET registration_date = ? WHERE project_id = ?";
      await conn.query(setRegistrationDateQuery, [currentDate, project_id]);

      const studentsQuery =
        "SELECT student_id FROM project_students WHERE project_id = ?";
      const studentRows = await conn.query(studentsQuery, [project_id]);
      const professorNameQuery =
        "SELECT professor_name FROM professor WHERE professor_id = ?";
      const professor_name = await conn.query(professorNameQuery, professor_id);
      const students = studentRows.map((row) => row.student_id);
      for (const student of students) {
        const notificationMessage = `Your project has been accepted by Professor ${professor_name[0].professor_name}`;
        await createNotification(
          student,
          professor_id,
          project_id,
          "project_status_update",
          notificationMessage
        );
      }
      res.status(200).json({ message: "Project accepted successfully" });
    } catch (err) {
      console.error("Error accepting project:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Reject Project API (DONE)
router.put(
  "/reject/project/:project_id/:professor_id",
  isProfessor,
  async (req, res) => {
    try {
      const { project_id } = req.params;
      const { professor_id } = req.params;
      const status = "Rejected";

      const countQuery =
        "SELECT COUNT(*) AS count FROM projects WHERE project_id = ?";
      const [result] = await conn.query(countQuery, [project_id]);
      if (!result || result.length === 0 || result.count === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      const updateStatusQuery =
        "UPDATE projects SET approval_status = ? WHERE project_id = ?";
      await conn.query(updateStatusQuery, [status, project_id]);

      const studentsQuery =
        "SELECT student_id FROM project_students WHERE project_id = ?";
      const studentRows = await conn.query(studentsQuery, [project_id]);
      const professorNameQuery =
        "SELECT professor_name FROM professor WHERE professor_id = ?";
      const professor_name = await conn.query(professorNameQuery, professor_id);
      const students = studentRows.map((row) => row.student_id);
      for (const student of students) {
        const notificationMessage = `Your project has been rejected by Professor ${professor_name[0].professor_name}`;
        await createNotification(
          student,
          professor_id,
          project_id,
          "project_status_update",
          notificationMessage
        );
      }

      res.status(200).json({ message: "Project rejected successfully" });
    } catch (err) {
      console.error("Error rejecting project:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Assigned grades to students (DONE)
router.get("/project/:project_id/students", async (req, res) => {
  try {
    const { project_id } = req.params;

    const studentDetailsQuery = `
      SELECT students.student_id, students.student_name, project_students.semester_work_grade, project_students.final_work_grade, project_students.max_semester_work_grade, project_students.max_final_work_grade, project_students.overall_grade, project_students.max_overall_grade
      FROM project_students
      INNER JOIN students ON project_students.student_id = students.student_id
      WHERE project_students.project_id = ?;
    `;

    // Execute the query
    const result = await conn.query(studentDetailsQuery, [project_id]);

    const rows = result;

    // Debugging lines to log the result structure

    // Check if rows is an array and has elements
    if (rows && rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No students found for the specified project" });
    }

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching student details:", err);
    res.status(500).json({ error: "Server error" });
  }
});
// Assign grades to students (DONE)
router.put("/project/assign-grades", isProfessor, async (req, res) => {
  try {
    const {
      professor_id,
      student_id,
      project_id,
      semester_work_grade,
      final_work_grade,
      max_semester_work_grade,
      max_final_work_grade,
    } = req.body;

    const professorExistsQuery =
      "SELECT COUNT(*) AS count FROM professor WHERE professor_id = ?";
    const [professorResult] = await conn.query(professorExistsQuery, [
      professor_id,
    ]);
    if (professorResult.count === 0) {
      return res.status(404).json({ error: "Professor not found" });
    }

    const projectSupervisedQuery =
      "SELECT COUNT(*) AS count FROM project_professor WHERE project_id = ? AND professor_id = ?";
    const [projectSupervisedResult] = await conn.query(projectSupervisedQuery, [
      project_id,
      professor_id,
    ]);
    if (projectSupervisedResult.count === 0) {
      return res.status(403).json({
        error: "Professor is not authorized to supervise this project",
      });
    }

    const projectExistsQuery =
      "SELECT COUNT(*) AS count FROM project_students WHERE student_id = ? AND project_id = ?";
    const [projectExistsResult] = await conn.query(projectExistsQuery, [
      student_id,
      project_id,
    ]);
    if (projectExistsResult.count === 0) {
      return res
        .status(404)
        .json({ error: "Student not found in the specified project" });
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

    const notificationMessage = `Your grade has been updated.`;
    await createNotification(
      student_id,
      professor_id,
      project_id,
      "grade_update",
      notificationMessage
    );

    res.status(200).json({ message: "Grades assigned successfully" });
  } catch (err) {
    console.error("Error assigning grades:", err);
    res.status(500).json({ error: "Server error" });
  }
});

async function createNotification(
  recipientId,
  senderId,
  projectId,
  notificationType,
  message
) {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO notifications (recipient_id, sender_id, project_id, notification_type, notification_message, read_status) VALUES (?, ?, ?, ?, ?, 'unread')";
    conn.query(
      sql,
      [recipientId, senderId, projectId, notificationType, message],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}

// Change Email for Professor
router.put(
  "/:professor_id/change-email",
  param("professor_id")
    .isInt()
    .withMessage("Please enter a valid professor ID (integer)"),
  body("current_email")
    .isEmail()
    .withMessage("Please enter a valid current email"),
  body("new_email")
    .isEmail()
    .withMessage("Please enter a valid new email")
    .custom(async (value, { req }) => {
      const professorId = req.params.professor_id;
      const currentEmail = req.body.current_email;

      // Check if the new email is different from the current one
      if (value === currentEmail) {
        throw new Error("New email must be different from the current one");
      }

      // Check if the new email ends with "@fci.helwan.edu.eg"
      if (!value.endsWith("@fci.helwan.edu.eg")) {
        throw new Error("Email domain must be '@fci.helwan.edu.eg'");
      }

      // Check if the new email is already registered for another professor
      const existingEmail = await conn.query(
        "SELECT * FROM professor WHERE professor_email = ? AND professor_id != ?",
        [value, professorId]
      );
      if (existingEmail.length > 0) {
        throw new Error("Professor with the same email already exists");
      }

      return true;
    }),
  async (req, res) => {
    try {
      const { professor_id } = req.params;
      const { new_email, current_email } = req.body;

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if professor exists and if the provided current email matches
      const professor = await conn.query(
        "SELECT * FROM professor WHERE professor_id = ? AND professor_email = ?",
        [professor_id, current_email]
      );
      if (professor.length === 0) {
        return res.status(404).json({
          error: "Professor not found or current email does not match",
        });
      }

      // Update professor's email with the new one
      await conn.query(
        "UPDATE professor SET professor_email = ? WHERE professor_id = ?",
        [new_email, professor_id]
      );

      res.status(200).json({ message: "Email updated successfully" });
    } catch (err) {
      console.error("Error changing email for professor:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Change Password for Professor
router.put(
  "/:professor_id/change-password",
  param("professor_id")
    .isInt()
    .withMessage("Please enter a valid professor ID (integer)"),
  body("old_password")
    .isLength({ min: 8, max: 12 })
    .withMessage("Old password should be between (8-12) characters"),
  body("new_password")
    .isLength({ min: 8, max: 12 })
    .withMessage("New password should be between (8-12) characters")
    .custom(async (value, { req }) => {
      const professorId = req.params.professor_id;
      const oldPassword = req.body.old_password;

      // Check if the old password is the same as the new password
      if (value === oldPassword) {
        throw new Error("New password must be different from the old one");
      }

      return true;
    }),
  async (req, res) => {
    try {
      const professorId = req.params.professor_id;
      const { old_password, new_password } = req.body;

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if old password matches the one stored in the database
      const professor = await conn.query(
        "SELECT * FROM professor WHERE professor_id = ?",
        [professorId]
      );
      if (professor.length === 0) {
        return res.status(404).json({
          error: "Professor not found",
        });
      }

      const checkOldPassword = await bcrypt.compare(
        old_password,
        professor[0].professor_password
      );
      if (!checkOldPassword) {
        return res.status(400).json({
          error: "Old password is incorrect",
        });
      }

      // Update professor's password with the new one
      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      await conn.query(
        "UPDATE professor SET professor_password = ? WHERE professor_id = ?",
        [hashedNewPassword, professorId]
      );

      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      console.error("Error changing password for professor:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);


// Request Password Reset for Professor
router.post(
  '/request-professor-password-reset',
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email!')
    .custom((value) => {
      if (!value.endsWith('@fci.helwan.edu.eg')) {
        throw new Error("Email domain must be '@fci.helwan.edu.eg'");
      }
      return true;
    }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(conn.query).bind(conn);
      const email = req.body.email;

      // Check if email exists in the database
      const professor = await query('SELECT * FROM professor WHERE professor_email = ?', [email]);
      if (professor.length === 0) {
        return res.status(404).json({ error: 'No account found with that email address.' });
      }

      // Generate a password reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpiration = Date.now() + 3600000; // 1 hour from now

      // Store the token in the database
      await query('UPDATE professor SET reset_password_token = ?, reset_password_expires = ? WHERE professor_email = ?', [resetToken, resetTokenExpiration, email]);

      // Instead of sending an email, we return the token in the response for testing
      res.status(200).json({ message: 'Password reset token generated successfully!', resetToken });
    } catch (err) {
      console.error('Error requesting password reset:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Reset Password for Professor
router.post(
  '/reset-professor-password/:token',
  body('password')
    .isLength({ min: 8, max: 12 })
    .withMessage('Password should be between 8 to 12 characters'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(conn.query).bind(conn);
      const resetToken = req.params.token;
      const newPassword = req.body.password;

      // Find the professor by the reset token and check if the token is still valid
      const professor = await query('SELECT * FROM professor WHERE reset_password_token = ? AND reset_password_expires > ?', [resetToken, Date.now()]);
      if (professor.length === 0) {
        return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the professor's password and clear the reset token and expiration
      await query('UPDATE professor SET professor_password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = ?', [hashedPassword, resetToken]);

      res.status(200).json({ message: 'Password has been reset successfully!' });
    } catch (err) {
      console.error('Error resetting password:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);
module.exports = router;