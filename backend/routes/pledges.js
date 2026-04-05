// Created by Christella - 03/06/2026
// ===== ROUTE =====

const express = require('express');
const router = express.Router();
const { getDb, ObjectId } = require('../database');

async function createNotification(userId, message) { // added daniel q. 4/4/26 
  try {
    const db = getDb();
    const notification = {
      userId: userId,
      message: message,
      read: false,
      createdAt: new Date()
    };
    await db.collection('notifications').insertOne(notification);
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}

// Preset pledges users can pick from
const PRESET_PLEDGES = [
  { text: 'I will donate $5 this month to a poverty-relief organization.', category: 'donate' },
  { text: 'I will share one poverty fact per week on social media.', category: 'spread awareness' },
  { text: 'I will volunteer locally at least once this month.', category: 'volunteer' },
  { text: 'I will reduce food waste in my household this week.', category: 'lifestyle change' },
  { text: 'I will learn about a country affected by poverty and share what I find.', category: 'spread awareness' },
  { text: 'I will donate unused clothes or items to a local shelter.', category: 'donate' },
  { text: 'I will sign up to volunteer at a food bank this month.', category: 'volunteer' },
  { text: 'I will cut one unnecessary expense and donate the savings.', category: 'lifestyle change' },
];

// GET /api/pledges - get all pledges, optionally filtered by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const db = getDb();
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    const pledges = await db
      .collection('pledges')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const total = await db.collection('pledges').countDocuments();

    res.json({ success: true, pledges, total });
  } catch (err) {
    console.error('Error fetching pledges:', err);
    res.status(500).json({ success: false, message: 'Error fetching pledges.' });
  }
});

// GET /api/pledges/presets - return preset pledge options
router.get('/presets', (req, res) => {
  res.json({ success: true, presets: PRESET_PLEDGES });
});

// POST /api/pledges - create a new pledge
router.post('/', async (req, res) => {
  try {
    const { pledgeText, category, userEmail, displayName, username } = req.body;

    if (!pledgeText || !pledgeText.trim()) {
      return res.status(400).json({ success: false, message: 'Pledge text is required.' });
    }
    if (pledgeText.trim().length > 300) {
      return res.status(400).json({ success: false, message: 'Pledge must be under 300 characters.' });
    }

    const validCategories = ['donate', 'volunteer', 'spread awareness', 'lifestyle change'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const db = getDb();

    if (userEmail) {
      const user = await db.collection('users').findOne({ email: userEmail });
      if (user?.suspended) {
        return res.status(403).json({
          success: false,
          message: 'Your account is suspended. You cannot create pledges right now.',
        });
      }
    }

    const newPledge = {
      pledgeText: pledgeText.trim(),
      category,
      userEmail: userEmail || null,
      username: displayName && username ? username : 'PovertyLens User',
      completed: false,
      completedAt: null,
      createdAt: new Date(),
    };

    const result = await db.collection('pledges').insertOne(newPledge);
    // added daniel q. 4/4/26 start
    if (userEmail) {
      await createNotification(
        userEmail,
        `You created a new pledge: "${pledgeText.trim().substring(0, 50)}${pledgeText.trim().length > 50 ? '...' : ''}"`
      );
    }
    // added daniel q. 4/4/26 start
    res.status(201).json({
      success: true,
      message: 'Pledge created successfully.',
      pledgeId: result.insertedId,
      pledge: { ...newPledge, _id: result.insertedId },
    });
  } catch (err) {
    console.error('Error creating pledge:', err);
    res.status(500).json({ success: false, message: 'Server error while creating pledge.' });
  }
});

// PATCH /api/pledges/:id/complete - mark a pledge as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;

    const db = getDb();

    const pledge = await db.collection('pledges').findOne({ _id: new ObjectId(id) });
    if (!pledge) {
      return res.status(404).json({ success: false, message: 'Pledge not found.' });
    }

    // Only the pledge owner can mark it complete
    if (pledge.userEmail && pledge.userEmail !== userEmail) {
      return res.status(403).json({ success: false, message: 'You can only complete your own pledges.' });
    }

    const result = await db.collection('pledges').updateOne(
      { _id: new ObjectId(id) },
      { $set: { completed: true, completedAt: new Date() } }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ success: false, message: 'Pledge not found.' });
    }
    // added daniel q. 4/4/26 start
    if (pledge.userEmail) {
      await createNotification(
        pledge.userEmail,
        `Congratulations! You completed your pledge: "${pledge.pledgeText.substring(0, 50)}${pledge.pledgeText.length > 50 ? '...' : ''}"`
      );
    }
    // added daniel q. 4/4/26 end

    res.json({ success: true, message: 'Pledge marked as completed!' });
  } catch (err) {
    console.error('Error completing pledge:', err);
    res.status(500).json({ success: false, message: 'Server error while completing pledge.' });
  }
});

module.exports = router;
// End of creation by Christella - 03/06/2026