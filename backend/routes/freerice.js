// File created by Christella - 2/26/2026
// ===== ROUTE =====

// -----------------------
// FreeRice endpoints (donate + leaderboard) Reymes 1/31/26
// -----------------------

const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// Log manual donation
router.post('/donate', async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      console.warn('DB not initialized when /api/freerice/donate called');
      return res.status(500).json({ success: false, message: 'Database not initialized' });
    }

    let { answers, grains, email } = req.body;
    answers = answers !== undefined ? Number(answers) : undefined;
    grains = grains !== undefined ? Number(grains) : undefined;

    if ((answers === undefined || Number.isNaN(answers)) && (grains === undefined || Number.isNaN(grains))) {
      return res.status(400).json({ success: false, message: 'Provide answers or grains' });
    }

    if (answers !== undefined) grains = Math.floor(answers) * 10;
    if (!Number.isFinite(grains) || grains <= 0) return res.status(400).json({ success: false, message: 'Invalid grains value' });
    if (grains > 500000) return res.status(400).json({ success: false, message: 'Donation exceeds allowed maximum' });

    // require an email and verify user exists (uses existing users collection; does not change login/signup behavior)
    if (!email) return res.status(401).json({ success: false, message: 'Email required to log donation (sign in first)' });
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'User not found - please sign in' });

    // duplicate protection: same user, same grains within 20 seconds
    const recent = await db.collection('freericeDonations').findOne({ email, grains, createdAt: { $gte: new Date(Date.now() - 20 * 1000) } });
    if (recent) return res.status(429).json({ success: false, message: 'Duplicate donation detected. Please wait before submitting again.' });

    const donation = {
      email: email || null,
      username: user.username || null,
      grains: Number(grains),
      createdAt: new Date(),
    };

    await db.collection('freericeDonations').insertOne(donation);

    res.status(201).json({ success: true, message: 'Donation logged', donation });
  } catch (err) {
    console.error('Error in /api/freerice/donate:', err && err.stack ? err.stack : err);
    // Return error message for debugging (will remove after we confirm cause)
    res.status(500).json({ success: false, message: 'Server error while logging donation', error: String(err && err.message ? err.message : err) });
  }
});

// Leaderboard and recent activity
// Accepts optional ?email=<user email> to indicate the requester (frontend should pass localStorage userEmail)
router.get('/leaderboard', async (req, res) => {
  try {
    const db = getDb();
    const requesterEmail = String(req.query.email || '') || null;
    let session = { authenticated: false };

    if (requesterEmail) {
      const user = await db.collection('users').findOne({ email: requesterEmail });
      if (user) session = { authenticated: true, email: user.email, username: user.username, id: user._id };
    }

    const topAgg = await db.collection('freericeDonations').aggregate([
      { $group: { _id: { email: '$email', username: '$username' }, totalGrains: { $sum: '$grains' } } },
      { $sort: { totalGrains: -1 } },
      { $limit: 10 }
    ]).toArray();

    const top = topAgg.map(t => ({ email: t._id.email, username: t._id.username, totalGrains: t.totalGrains }));

    const recent = await db.collection('freericeDonations').find({}).sort({ createdAt: -1 }).limit(10).toArray();

    res.json({ success: true, top, recent, session });
  } catch (err) {
    console.error('Error in /api/freerice/leaderboard:', err);
    res.status(500).json({ success: false, message: 'Server error while building leaderboard' });
  }
});
//end of FreeRice endpoints Reymes 1/26/26

// Start of - Get a specific user's total grains donated Marisol 2/3/2026

router.get('/user-total', async (req, res) => {
  try {
    const db = getDb();
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email parameter required' });
    }

    // Aggregate all donations for this specific user
    const userTotal = await db.collection('freericeDonations').aggregate([
      { $match: { email: String(email) } },
      { $group: { _id: null, totalGrains: { $sum: '$grains' } } }
    ]).toArray();

    const total = userTotal.length > 0 ? userTotal[0].totalGrains : 0;

    res.json({ success: true, email, totalGrains: total });
  } catch (err) {
    console.error('Error in /api/freerice/user-total:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching user total' });
  }
});
// End of Get a specific user's total grains donated Marisol 2/3/2026

module.exports = router;