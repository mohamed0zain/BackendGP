const express = require('express');
const router = express.Router();
const db = require("../db/dbConnection");
const util = require('util');
const query = util.promisify(db.query).bind(db);

router.post('/logout', async (req, res) => {
    try {
        const userId = req.body.id;
        if (!userId) {
            return res.status(400).json({ message: 'Missing user ID in request body' });
        }
        const results = await query('SELECT * FROM users WHERE id = ?', [userId]);
        if (results.length === 0) {
            return res.status(400).json({message: 'This id does not exist'});
        } else {
            await db.query('UPDATE users SET token = ? WHERE id = ?', ['', userId]);
            res.json({ message: 'Logged out successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
});

module.exports = router;
