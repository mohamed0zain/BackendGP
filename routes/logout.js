const express = require('express');
const router = express.Router();
const db = require("../db/dbConnection");

// Logout route
router.post('/logout', async (req, res) => {
    try {
      // Get user ID from request body
      const userId = req.body.id;

      if (!userId) {
        return res.status(400).json({ message: 'Missing user ID in request body' });
      }

      await db.query('UPDATE users SET token = ? WHERE id = ?', ['', userId]);

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error logging out' });
    }
  });

  module.exports = router;
