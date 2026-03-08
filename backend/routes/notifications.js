// ===== ROUTE =====
// File created by Christella - 2/26/2026

const express = require('express');
const router = express.Router();
const { getDb, ObjectId } = require('../database');

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.json({ notifications: [] });
    }
    
    const db = getDb();
    const notificationsCollection = db.collection('notifications');
    
    const notifications = await notificationsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    const out = notifications.map(n => ({
      id: n._id ? String(n._id) : null,
      _id: n._id ? String(n._id) : null,
      userId: n.userId,
      message: n.message,
      read: !!n.read,
      createdAt: n.createdAt,
    }));

    res.json({ success: true, notifications: out });
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/clear', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const db = getDb();
    const notificationsCollection = db.collection('notifications');
    
    // Delete all notifications for this user
    const result = await notificationsCollection.deleteMany({ userId });
    
    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} notifications` 
    });
    
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;