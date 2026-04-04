// ===== ROUTE =====
// Weekly Email Digest - Created by Damon

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const { sendWeeklyDigest } = require('../helpers/weeklydigesthelper');

// POST /api/digest/send
// Manually trigger the weekly digest. Protected by DIGEST_ADMIN_SECRET env var if set.
router.post('/send', async (req, res) => {
  const adminSecret = process.env.DIGEST_ADMIN_SECRET;
  if (adminSecret && req.headers['x-admin-secret'] !== adminSecret) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const result = await sendWeeklyDigest();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Digest] Error triggering digest:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/digest/unsubscribe?token=...
// One-click unsubscribe link included in every digest email.
// Returns an HTML confirmation page (no frontend needed).
router.get('/unsubscribe', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('<p>Invalid unsubscribe link.</p>');
  }

  try {
    const secret = process.env.JWT_SECRET || 'pl-digest-secret';
    const payload = jwt.verify(token, secret);

    if (payload.purpose !== 'unsubscribe' || !payload.email) {
      return res.status(400).send('<p>Invalid unsubscribe link.</p>');
    }

    const db = getDb();
    await db
      .collection('users')
      .updateOne({ email: payload.email }, { $set: { weeklyDigestOptIn: false } });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Unsubscribed — PovertyLens</title>
  <style>
    body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; background: #f5f5f5; }
    .box { background: #fff; border-radius: 12px; padding: 48px 40px; text-align: center;
           max-width: 420px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
    h1 { color: #1a1a1a; margin: 0 0 12px; }
    p  { color: #666; line-height: 1.6; }
    a  { color: #1a73e8; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Unsubscribed</h1>
    <p>You've been successfully removed from the PovertyLens weekly digest.</p>
    <p>
      Changed your mind?
      <a href="${frontendUrl}/profile">Re-enable in account settings</a>.
    </p>
  </div>
</body>
</html>`);
  } catch (err) {
    return res
      .status(400)
      .send('<p>This unsubscribe link has expired or is invalid.</p>');
  }
});

module.exports = router;
