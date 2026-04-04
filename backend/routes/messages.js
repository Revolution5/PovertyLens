//Created by Damon 4/3/2026

const express = require('express');
const router = express.Router();
const { getDb, ObjectId } = require('../database');

router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const db = getDb();
    const messages = await db
      .collection('messages')
      .find({ recipientEmail: String(email) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      messages: messages.map((message) => ({
        id: message._id.toString(),
        type: message.type,
        subject: message.subject,
        body: message.body,
        date: message.createdAt,
        read: !!message.read,
        from: message.from,
      })),
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid message id' });
    }

    const db = getDb();
    const result = await db.collection('messages').updateOne(
      { _id: new ObjectId(id) },
      { $set: { read: true, updatedAt: new Date() } }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, message: 'Message marked as read' });
  } catch (err) {
    console.error('Error marking message as read:', err);
    res.status(500).json({ success: false, message: 'Failed to update message' });
  }
});

router.patch('/read-all', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const db = getDb();
    await db.collection('messages').updateMany(
      { recipientEmail: String(email), read: false },
      { $set: { read: true, updatedAt: new Date() } }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (err) {
    console.error('Error marking all messages as read:', err);
    res.status(500).json({ success: false, message: 'Failed to update messages' });
  }
});

module.exports = router;