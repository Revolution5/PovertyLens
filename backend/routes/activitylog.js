// created by Marisol morales 2-28 for logging user account activity such as logins, password changes, and security events
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');

// Helper: parse device from User-Agent header
function parseDevice(req) {
  const ua = req.headers['user-agent'] || '';
  if (ua.includes('iPhone') || ua.includes('Android')) return 'Mobile';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  return 'Unknown Device';
}

// Helper: get location from IP
async function getLocationFromIP(ip) {
  try {
    const cleanIP = ip.replace(/^::ffff:/, '');
    if (cleanIP === '127.0.0.1' || cleanIP === 'localhost' || cleanIP.startsWith('192.168.')) {
      return { city: 'Local', country: 'Development', ip: cleanIP };
    }
    const response = await fetch(`https://ipapi.co/${cleanIP}/json/`);
    const data = await response.json();
    return {
      city: data.city || 'Unknown',
      country: data.country_name || 'Unknown',
      ip: cleanIP
    };
  } catch {
    return { city: 'Unknown', country: 'Unknown', ip };
  }
}

// Helper: log an activity — imported and used by other route files
async function logActivity(email, action, details = '', req = null) {
  try {
    const db = getDb();
    if (!db) return;

    let ip = 'unknown';
    let device = 'Unknown';

    if (req) {
      ip = req.headers['x-forwarded-for'] ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           'unknown';
      if (ip.includes(',')) ip = ip.split(',')[0].trim();
      device = parseDevice(req);
    }

    const location = await getLocationFromIP(ip);

    await db.collection('activityLogs').insertOne({
      email: email.toLowerCase(),
      action,
      details,
      device,
      location,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

// GET /api/activity-log  — fetch logs for a user
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { email, limit = 50 } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const logs = await db.collection('activityLogs')
      .find({ email: email.toLowerCase() })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json({
      success: true,
      logs: logs.map(log => ({
        id: log._id.toString(),
        action: log.action,
        details: log.details,
        device: log.device,
        location: log.location,
        timestamp: log.timestamp
      }))
    });
  } catch (err) {
    console.error('Error fetching activity log:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/activity-log/clear  — clear logs after password check
router.delete('/clear', async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ success: false, message: 'Invalid password' });

    await db.collection('activityLogs').deleteMany({ email: email.toLowerCase() });
    await logActivity(email, 'Activity log cleared', 'User cleared their activity history', req);

    res.json({ success: true, message: 'Activity log cleared' });
  } catch (err) {
    console.error('Error clearing activity log:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = { router, logActivity };