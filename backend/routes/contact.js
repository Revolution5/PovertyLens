// Created by Marisol for Work Review 3
// Handles contact form submissions and admin replies

const express = require('express');
const router = express.Router();
const { getDb, ObjectId } = require('../database');

// POST /api/contact — user submits the contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const db = getDb();

    // Save contact form submission
    const submission = {
      name: String(name),
      email: String(email),
      subject: String(subject),
      message: String(message),
      status: 'pending', // pending | replied
      createdAt: new Date(),
    };

    const result = await db.collection('contacts').insertOne(submission);

    // Send confirmation message to user's inbox
    await db.collection('messages').insertOne({
      recipientEmail: String(email),
      type: 'contact_received',
      subject: 'We received your message',
      body: `Hi ${name}, thank you for reaching out! We received your message about "${subject}" and will get back to you as soon as possible.`,
      from: 'PovertyLens Team',
      read: false,
      createdAt: new Date(),
    });

    return res.json({ success: true, message: 'Message received.', id: result.insertedId });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit contact form.' });
  }
});

// GET /api/contact — admin fetches all submissions
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const contacts = await db
      .collection('contacts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({
      success: true,
      contacts: contacts.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        email: c.email,
        subject: c.subject,
        message: c.message,
        status: c.status,
        reply: c.reply || null,
        repliedAt: c.repliedAt || null,
        repliedBy: c.repliedBy || null,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch submissions.' });
  }
});

// POST /api/contact/:id/reply — admin sends a reply
router.post('/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, adminEmail } = req.body;

    if (!reply) {
      return res.status(400).json({ success: false, message: 'Reply cannot be empty.' });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid submission ID.' });
    }

    const db = getDb();
    const contact = await db.collection('contacts').findOne({ _id: new ObjectId(id) });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    // Update submission status
    await db.collection('contacts').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'replied',
          reply: String(reply),
          repliedAt: new Date(),
          repliedBy: adminEmail || 'Admin',
        },
      }
    );

    // Send reply to user's inbox
    await db.collection('messages').insertOne({
      recipientEmail: contact.email,
      type: 'contact_reply',
      subject: `Re: ${contact.subject}`,
      body: reply,
      from: 'PovertyLens Team',
      read: false,
      createdAt: new Date(),
    });

    return res.json({ success: true, message: 'Reply sent.' });
  } catch (err) {
    console.error('Reply error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send reply.' });
  }
});

module.exports = router;