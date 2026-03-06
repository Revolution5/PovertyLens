// File created by Christella - 2/26/2026
// ===== ROUTE =====

// Added by Christella - 02/04/2026
const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Added by Christella - 03/03/2026

// Log a donation (no payments yet - just saves to MongoDB)
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      console.warn('DB not initialized when /api/donations called');
      return res.status(500).json({ success: false, message: 'Database not initialized' });
    }

    let { amount, isMonthly, name, email, message } = req.body;

    // basic validation
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid donation amount' });
    }
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const donationDoc = {
      amount: parsedAmount,
      isMonthly: !!isMonthly,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      message: message ? String(message).trim().slice(0, 1000) : '',
      createdAt: new Date(),
      status: 'logged',
    };

    const result = await db.collection('donations').insertOne(donationDoc);

    // createNotification(donationDoc.email, `Thanks for donating $${donationDoc.amount}!`);

    res.status(201).json({
      success: true,
      message: 'Donation logged',
      donationId: String(result.insertedId),
    });
  } catch (err) {
    console.error('Error in /api/donations:', err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, message: 'Server error while logging donation' });
  }
});

// View recent donations (useful for testing/admin)
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      console.warn('DB not initialized when GET /api/donations called');
      return res.status(500).json({ success: false, message: 'Database not initialized' });
    }

    const donations = await db
      .collection('donations')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const out = donations.map(d => ({
      ...d,
      _id: d._id ? String(d._id) : null,
      id: d._id ? String(d._id) : null,
    }));

    res.json({ success: true, donations: out });
  } catch (err) {
    console.error('Error fetching donations:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// End of addition by Christella - 02/04/2026

// Addition by Christella - 03/03/2026
router.post('/create-payment-intent', async (req, res) => {
  try {
    const {amount, name, email, isMonthly} = req.body;
    
    const parsedAmount = Math.round(Number(amount) * 100);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parsedAmount,
      currency: 'usd',
      metadata: { name, email, isMonthly: String(isMonthly) },
    });

    // Checks status of payment completion
    res.json({success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({success: false, message: 'Payment Setup Failed'});
  }
})

module.exports = router;