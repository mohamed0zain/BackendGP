const express = require("express");
const router = express.Router();
const conn = require("../db/dbConnection");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);




// Count project accepted
router.get('/accepted-project-count', (req, res) => {
  // Construct the SQL query to count the number of accepted projects
  const sql = 'SELECT COUNT(*) AS acceptedProjectCount FROM projects WHERE approval_status = "Approved"';

  // Execute the query
  conn.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    const acceptedProjectCount = results[0].acceptedProjectCount;
    res.json({ acceptedProjectCount });
  });
});

// Count professors
router.get('/count-professors', (req, res) => {
  // Construct SQL query to count professors
  const sql = 'SELECT COUNT(*) AS professorCount FROM professor';

  // Execute the query
  conn.query(sql, (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    // Extract the count from the result
    const professorCount = result[0].professorCount;

    // Send the count as a response
    res.json({ professorCount });
  });
});

// Count department
router.get('/department-count', (req, res) => {
  // Query to fetch the enum values from the department_name column
  const query = "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'department_name'";
  conn.query(query, (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Column not found' });
    }

    const enumValues = result[0].COLUMN_TYPE.match(/'[^']+'/g);
    const departmentCount = enumValues ? enumValues.length : 0;

    res.json({ count: departmentCount });
  });
});

//count projects assigned to the professor
router.get('/professor-project-count/:professor_id', (req, res) => {
  const professorId = req.params.professor_id;

  // Construct the SQL query to count the projects for the specific professor
  const sql = `
      SELECT 
          COUNT(*) AS totalProjects,
          SUM(CASE WHEN approval_status = 'Approved' THEN 1 ELSE 0 END) AS acceptedProjects,
          SUM(CASE WHEN approval_status = 'Rejected' THEN 1 ELSE 0 END) AS rejectedProjects,
          SUM(CASE WHEN approval_status = 'Pending' THEN 1 ELSE 0 END) AS pendingProjects
      FROM projects 
      WHERE professor_id = ?
  `;

  // Execute the query
  conn.query(sql, [professorId], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    const { totalProjects, acceptedProjects, rejectedProjects, pendingProjects } = result[0];
    res.json({ totalProjects, acceptedProjects, rejectedProjects, pendingProjects });
  });
});

// the average of studnets grade by project ID
router.get('/average-grades/:project_id', async (req, res) => {
  const { project_id } = req.params;

  try {
    // Fetch grades for the given project ID
    const gradesQuery = 'SELECT semester_work_grade, final_work_grade FROM project_students WHERE project_id = ?';
    conn.query(gradesQuery, [project_id], (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'No students found for this project ID' });
      }

      // Calculate the average of semester work grades and final work grades
      let totalSemesterGrade = 0;
      let totalFinalGrade = 0;
      results.forEach(row => {
        totalSemesterGrade += row.semester_work_grade;
        totalFinalGrade += row.final_work_grade;
      });

      const averageSemesterGrade = totalSemesterGrade / results.length;
      const averageFinalGrade = totalFinalGrade / results.length;
      const averageOverallGrade = (averageSemesterGrade + averageFinalGrade) / 2;

      // Return the average grades
      res.json({
        averageSemesterGrade: averageSemesterGrade.toFixed(2),
        averageFinalGrade: averageFinalGrade.toFixed(2),
        averageOverallGrade: averageOverallGrade.toFixed(2)
      });
    });
  } catch (error) {
    console.error('Error calculating average grades:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// The top 3 bookmarked projects
router.get('/most-bookmarked-projects', async (req, res) => {
  try {
    const sql = `
      SELECT title, COUNT(*) as bookmark_count
      FROM bookmarks
      GROUP BY title
      ORDER BY bookmark_count DESC
      LIMIT 3
    `;

    conn.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(results);
    });
  } catch (err) {
    console.error('Error fetching most bookmarked projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//average grade for department
router.get('/average-grades-by-department', async (req, res) => {
  try {
    const sql = `
          SELECT 
              p.department_name,
              AVG(ps.semester_work_grade) AS avg_semester_work_grade,
              AVG(ps.final_work_grade) AS avg_final_work_grade,
              AVG(ps.overall_grade) AS avg_overall_grade
          FROM 
              project_students ps
          JOIN 
              projects p ON ps.project_id = p.project_id
          GROUP BY 
              p.department_name;
      `;

    conn.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

//average grade for professer
router.get("/average-grade-by-professor", async (req, res) => {
  try {
    const sql = 
    `SELECT 
    pr.professor_name,
    AVG(ps.overall_grade) AS avg_overall_grade
FROM 
    project_students ps
JOIN 
    projects p ON ps.project_id = p.project_id
JOIN
    project_professor pp ON pp.project_id = ps.project_id
JOIN
    professor pr ON pr.professor_id = pp.professor_id
WHERE
    ps.semester_work_grade IS NOT NULL
    AND ps.final_work_grade IS NOT NULL
    AND ps.overall_grade IS NOT NULL
GROUP BY 
    pr.professor_name;
    `;
    conn.query(sql, (err, results) => {
      if (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ error: "Server error" });
      }
      res.json(results);
    });
  } catch (error) {
    console.error("Error calculating average grade by professor:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// The top 3 voted projects
router.get('/most-voted-projects', (req, res) => {
  const sql = 'SELECT title, total_votes FROM projects ORDER BY total_votes DESC LIMIT 3';

  conn.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json(results);
  });
});

// the top 3 commented projects
router.get('/most-commented-projects', async (req, res) => {
  try {
    const sql = `
          SELECT p.title, COUNT(c.comment_id) AS comment_count
          FROM projects p
          LEFT JOIN comments c ON p.project_id = c.project_id
          GROUP BY p.title
          ORDER BY comment_count DESC
          LIMIT 3`;

    conn.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error("Error calculating most commented projects:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get average grades by year for each department
router.get('/average-grades-by-year', async (req, res) => {
  try {
    const sql = `
    SELECT 
    p.department_name,
    p.graduation_year AS year,
    AVG(ps.semester_work_grade) AS avg_semester_work_grade,
    AVG(ps.final_work_grade) AS avg_final_work_grade,
    AVG((ps.semester_work_grade + ps.final_work_grade) / 2) AS avg_overall_grade
FROM 
    projects p
JOIN 
    project_students ps ON p.project_id = ps.project_id
WHERE 
    ps.semester_work_grade IS NOT NULL
    AND ps.final_work_grade IS NOT NULL
    AND p.graduation_year IS NOT NULL
GROUP BY 
    p.department_name, p.graduation_year
ORDER BY 
    p.department_name, p.graduation_year;
`;

    conn.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get average grades by graduation year
router.get('/average-grades-by-graduation-year', async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.graduation_year AS year,
        AVG(ps.semester_work_grade) AS avg_semester_work_grade,
        AVG(ps.final_work_grade) AS avg_final_work_grade,
        AVG((ps.semester_work_grade + ps.final_work_grade) / 2) AS avg_overall_grade
      FROM 
        project_students ps
      JOIN 
        projects p ON ps.project_id = p.project_id
      WHERE 
        ps.semester_work_grade IS NOT NULL
        AND ps.final_work_grade IS NOT NULL
        AND p.graduation_year IS NOT NULL
      GROUP BY 
        p.graduation_year
      ORDER BY 
        p.graduation_year
    `;

    conn.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get average grades by graduation term
router.get('/average-grades-by-graduation-term', async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.graduation_term AS term,
        AVG(ps.semester_work_grade) AS avg_semester_work_grade,
        AVG(ps.final_work_grade) AS avg_final_work_grade,
        AVG((ps.semester_work_grade + ps.final_work_grade) / 2) AS avg_overall_grade
      FROM 
        project_students ps
      JOIN 
        projects p ON ps.project_id = p.project_id
      WHERE 
        ps.semester_work_grade IS NOT NULL
        AND ps.final_work_grade IS NOT NULL
        AND p.graduation_term IN ('June', 'January', 'Summer')
      GROUP BY 
        term
      ORDER BY 
        term
    `;

    conn.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// succes rate by department
router.get('/success-rate-by-department', async (req, res) => {
  try {
      const sql = `
          SELECT
              p.department_name,
              COUNT(ps.student_id) AS total_students,
              SUM(CASE WHEN ps.overall_grade >= (ps.max_overall_grade / 2) THEN 1 ELSE 0 END) AS successful_students
          FROM
              projects p
          JOIN
              project_students ps ON p.project_id = ps.project_id
          GROUP BY
              p.department_name;
      `;

      conn.query(sql, (err, results) => {
          if (err) {
              console.error('Error executing SQL query:', err);
              return res.status(500).json({ error: 'Server error' });
          }

          const successRates = results.map(row => ({
              department_name: row.department_name,
              success_rate: (row.successful_students / row.total_students) * 100
          }));

          res.json(successRates);
      });
  } catch (error) {
      console.error("Error calculating success rate by department:", error);
      res.status(500).json({ error: "Server error" });
  }
});
//failure rate by department
router.get('/failure-rate-by-department', async (req, res) => {
  try {
    const sql = `
      SELECT
        p.department_name,
        COUNT(ps.student_id) AS total_students,
        SUM(CASE WHEN ps.overall_grade < (ps.max_overall_grade / 2) THEN 1 ELSE 0 END) AS failed_students
      FROM
        projects p
      JOIN
        project_students ps ON p.project_id = ps.project_id
      GROUP BY
        p.department_name;
    `;

    conn.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      const failureRates = results.map(row => ({
        department_name: row.department_name,
        failure_rate: (row.failed_students / row.total_students) * 100
      }));

      res.json(failureRates);
    });
  } catch (error) {
    console.error("Error calculating failure rate by department:", error);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;  