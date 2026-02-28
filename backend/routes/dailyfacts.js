// File created by Christella - 2/26/2026
// ===== ROUTE =====

const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { getTodaysFact, todayDateStringUTC } = require('../helpers/dailyfactshelper');

//Daily facts added by Damon
//--- Daily Facts endpoints ---
//Create a daily fact
router.post('/', async (req, res) => {
  try {
    const { title, text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'text is required' });

    const db = getDb();
    const dfCol = db.collection('dailyFacts');
    const doc = {
      title: title || null,
      text: text.trim(),
      createdAt: new Date(),
    };

    const result = await dfCol.insertOne(doc);
    res.status(201).json({ success: true, factId: result.insertedId, fact: doc });
  } catch (err) {
    console.error('Error creating daily fact:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//Daily facts added by Damon
//List daily facts
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const dfCol = db.collection('dailyFacts');
    const facts = await dfCol.find({}).sort({ createdAt: -1 }).limit(200).toArray();
    res.json({ success: true, facts });
  } catch (err) {
    console.error('Error fetching daily facts:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//Daily facts added by Damon
//Send today's daily fact as notifications to all users
router.post('/notify', async (req, res) => {
  try {
    const fact = await getTodaysFact();
    if (!fact) return res.status(404).json({ success: false, message: 'No daily fact to send' });

    const db = getDb();
    const users = await db.collection('users').find({}, { projection: { email: 1 } }).toArray();
    const notificationsCollection = db.collection('notifications');
    const today = todayDateStringUTC();

    const message = fact.text ? (fact.title ? `${fact.title}: ${fact.text}` : fact.text) : (fact.title || 'Daily fact');

    const ops = users.map(u => ({
      updateOne: {
        filter: { userId: u.email, dailyFactDate: today },
        update: { $setOnInsert: { userId: u.email, message, createdAt: new Date(), read: false, dailyFactDate: today } },
        upsert: true,
      }
    }));

    if (ops.length) {
      await notificationsCollection.bulkWrite(ops, { ordered: false });
    }

    res.json({ success: true, message: 'Daily fact notifications processed', recipients: users.length });
  } catch (err) {
    console.error('Error sending daily fact notifications:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;