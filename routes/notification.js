const express = require("express");
const router = express.Router(); 
const conn = require("../db/dbConnection"); 


// GET request to fetch unread notifications for a specific recipient

router.get('/:recipient_id', async (req, res) => {
    const recipient_id = req.params.recipient_id;

    try {
        const query = 'SELECT * FROM notifications WHERE recipient_id = ? AND read_status = ?';
        const notifications = await conn.query(query, [recipient_id, 'unread']);

        res.status(200).json(notifications);
    } catch (err) {
        console.error('Error fetching unread notifications:', err);
        res.status(500).json({ error: 'Server error while fetching unread notifications' });
    }
});



// PUT request to update the status of a notification

router.put('/:notification_id', async (req, res) => {
    const notification_id = req.params.notification_id;

    try {
        const updateQuery = 'UPDATE notifications SET read_status = ? WHERE notification_id = ?';
        await conn.query(updateQuery, ['read', notification_id]);

        res.status(200).json({ message: 'Notification status updated successfully' });
    } catch (err) {
        console.error('Error updating notification status:', err);
        res.status(500).json({ error: 'Server error while updating notification status' });
    }
});


module.exports = router;
