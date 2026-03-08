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

router.post('/read', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const db = getDb();
    const notificationsCollection = db.collection('notifications');
    
    await notificationsCollection.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark a single notification as read by id
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'id required' });

    const db = getDb();
    const notificationsCollection = db.collection('notifications');
    await notificationsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;