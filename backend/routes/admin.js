// Created by Marisol Morales for Work Review 3 
// This file defines the /admin/analytics route, which provides aggregated statistics for the admin dashboard.
//  It calculates totals, monthly comparisons, and growth trends for users, stories, donations, and rice donations. 
// the data is returned in a structured format for frontend consumption.

const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { createMessage } = require('../helpers/messagesHelper');

function monthLabel(date) {
  return date.toLocaleString('en-US', { month: 'short' });
}

function getMonthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return { start, end };
}

function getLast6Months() {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: monthLabel(d),
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
    });
  }

  return months;
}

function getLast7DaysBuckets() {
  const buckets = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setDate(now.getDate() - i);
    end.setHours(23, 59, 59, 999);

    buckets.push({
      label: start.toLocaleDateString('en-US', { weekday: 'short' }),
      start,
      end,
    });
  }

  return buckets;
}

function getLast4WeeksBuckets() {
  const buckets = [];
  const now = new Date();

  for (let i = 3; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    buckets.push({
      label: `Week ${4 - i}`,
      start,
      end,
    });
  }

  return buckets;
}

function getLast4MonthsBuckets() {
  const buckets = [];
  const now = new Date();

  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

    const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    buckets.push({
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      start,
      end,
    });
  }

  return buckets;
}

function getRiceBuckets(range) {
  if (range === '7d') return getLast7DaysBuckets();
  if (range === '4m') return getLast4MonthsBuckets();
  return getLast4WeeksBuckets();
}

function percentChange(current, previous) {
  if (!previous && !current) return '+0%';
  if (!previous) return '+100%';
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change);
  return `${rounded >= 0 ? '+' : ''}${rounded}%`;
}

router.get('/analytics', async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not initialized' });
    }

    const range = req.query.range || '4w';

    const usersCol = db.collection('users');
    const storiesCol = db.collection('stories');
    const donationsCol = db.collection('donations');
    const riceCol = db.collection('freericeDonations');

    const [totalUsers, storiesShared, donationsAgg, riceAgg] = await Promise.all([
      usersCol.countDocuments(),
      storiesCol.countDocuments(),
      donationsCol.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      riceCol.aggregate([
        { $group: { _id: null, total: { $sum: '$grains' } } }
      ]).toArray(),
    ]);

    const donationsMade = donationsAgg[0]?.total || 0;
    const riceDonated = riceAgg[0]?.total || 0;

    const current = getMonthRange(0);
    const prev = getMonthRange(-1);

    const [
      usersCurrent,
      usersPrev,
      storiesCurrent,
      storiesPrev,
      donationCurrentAgg,
      donationPrevAgg,
      riceCurrentAgg,
      ricePrevAgg,
    ] = await Promise.all([
      usersCol.countDocuments({ createdAt: { $gte: current.start, $lt: current.end } }),
      usersCol.countDocuments({ createdAt: { $gte: prev.start, $lt: prev.end } }),

      storiesCol.countDocuments({ createdAt: { $gte: current.start, $lt: current.end } }),
      storiesCol.countDocuments({ createdAt: { $gte: prev.start, $lt: prev.end } }),

      donationsCol.aggregate([
        { $match: { createdAt: { $gte: current.start, $lt: current.end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),

      donationsCol.aggregate([
        { $match: { createdAt: { $gte: prev.start, $lt: prev.end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),

      riceCol.aggregate([
        { $match: { createdAt: { $gte: current.start, $lt: current.end } } },
        { $group: { _id: null, total: { $sum: '$grains' } } }
      ]).toArray(),

      riceCol.aggregate([
        { $match: { createdAt: { $gte: prev.start, $lt: prev.end } } },
        { $group: { _id: null, total: { $sum: '$grains' } } }
      ]).toArray(),
    ]);

    const donationCurrent = donationCurrentAgg[0]?.total || 0;
    const donationPrev = donationPrevAgg[0]?.total || 0;
    const riceCurrent = riceCurrentAgg[0]?.total || 0;
    const ricePrev = ricePrevAgg[0]?.total || 0;

    const months = getLast6Months();
    const userGrowthData = await Promise.all(
      months.map(async (m) => ({
        month: m.label,
        users: await usersCol.countDocuments({ createdAt: { $gte: m.start, $lt: m.end } }),
        stories: await storiesCol.countDocuments({ createdAt: { $gte: m.start, $lt: m.end } }),
      }))
    );

    const donationData = await donationsCol.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          amount: { $sum: '$amount' },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]).toArray();

    const donationChartData = donationData.map((item) => {
      const date = new Date(item._id.year, item._id.month - 1, 1);
      return {
        month: date.toLocaleString('en-US', { month: 'short' }),
        amount: item.amount,
      };
    });

    const riceBuckets = getRiceBuckets(range);

    const riceData = await Promise.all(
      riceBuckets.map(async (bucket) => {
        const [grainAgg, playerAgg] = await Promise.all([
          riceCol.aggregate([
            {
              $match: {
                createdAt: { $gte: bucket.start, $lte: bucket.end }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$grains' }
              }
            }
          ]).toArray(),

          riceCol.aggregate([
            {
              $match: {
                createdAt: { $gte: bucket.start, $lte: bucket.end }
              }
            },
            {
              $match: {
                email: { $exists: true, $nin: [null, ''] }
              }
            },
            {
              $group: {
                _id: '$email'
              }
            },
            {
              $count: 'players'
            }
          ]).toArray()
        ]);

        return {
          period: bucket.label,
          grains: grainAgg[0]?.total || 0,
          players: playerAgg[0]?.players || 0,
        };
      })
    );

    res.json({
      success: true,
      stats: {
        totalUsers,
        storiesShared,
        riceDonated,
        donationsMade,
        usersChange: percentChange(usersCurrent, usersPrev),
        storiesChange: percentChange(storiesCurrent, storiesPrev),
        riceChange: percentChange(riceCurrent, ricePrev),
        donationsChange: percentChange(donationCurrent, donationPrev),
      },
      userGrowthData,
      donationData: donationChartData,
      riceData,
      riceRange: range,
    });
  } catch (err) {
    console.error('Error in /api/admin/analytics:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load admin analytics',
    });
  }
});

// GET /api/admin/users - returns all users (no passwords)
router.get('/users', async (req, res) => {
  try {
    const db = getDb();
    if (!db) return res.status(500).json({ success: false, message: 'Database not initialized' });
 
    const users = await db.collection('users').find(
      {},
      { projection: { password: 0, passwordHistory: 0 } }
    ).sort({ createdAt: -1 }).toArray();
 
    res.json({ success: true, users });
  } catch (err) {
    console.error('Error in GET /api/admin/users:', err);
    res.status(500).json({ success: false, message: 'Failed to load users' });
  }
});
 
// PATCH /api/admin/users/suspend - suspend or unsuspend a user
router.patch('/users/suspend', async (req, res) => {
  try {
    const { email, suspend } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
 
    const db = getDb();
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.admin) return res.status(403).json({ success: false, message: 'Cannot suspend admin accounts' });
 
    await db.collection('users').updateOne(
      { email },
      { $set: { suspended: !!suspend } }
    );

    if (suspend) {
      try {
        await createMessage(email, 'suspension_issued', { suspensionDays: 7 });
      } catch (msgErr) {
        console.error('Failed to send suspension inbox message:', msgErr);
      }
    } else if (user.suspended) {
      try {
        await createMessage(email, 'unsuspension_issued');
      } catch (msgErr) {
        console.error('Failed to send unsuspension inbox message:', msgErr);
      }
    }
 
    console.log(`User ${email} ${suspend ? 'suspended' : 'unsuspended'} by admin`);
    res.json({ success: true, message: `User ${suspend ? 'suspended' : 'unsuspended'} successfully` });
  } catch (err) {
    console.error('Error in PATCH /api/admin/users/suspend:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
 
// PATCH /api/admin/users/ban - ban or unban a user
router.patch('/users/ban', async (req, res) => {
  try {
    const { email, ban } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
 
    const db = getDb();
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.admin) return res.status(403).json({ success: false, message: 'Cannot ban admin accounts' });
 
    // Banning also clears suspension since ban is more severe
    await db.collection('users').updateOne(
      { email },
      { $set: { banned: !!ban, suspended: ban ? false : user.suspended } }
    );
 
    console.log(`User ${email} ${ban ? 'banned' : 'unbanned'} by admin`);
    res.json({ success: true, message: `User ${ban ? 'banned' : 'unbanned'} successfully` });
  } catch (err) {
    console.error('Error in PATCH /api/admin/users/ban:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;