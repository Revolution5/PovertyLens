//===== Created by Christella - 11/22/2025 =====//
require('dotenv').config()
const cors = require('cors')
const express = require('express')
const path = require('path')
// ===== End of created code by Christella - 11/22/2025 =====//

const { connectDB, getDb } = require('./database');
const { scheduleDailyReminder } = require('./helpers/dailyfactshelper');

// Route modules
const notificationsRouter = require('./routes/notifications');
const dailyFactsRouter = require('./routes/dailyfacts');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const povertyRouter = require('./routes/povertystats');
const freericeRouter = require('./routes/freerice');
const storiesRouter = require('./routes/stories');
const donationsRouter = require('./routes/donations');
const pledgesRouter = require('./routes/pledges'); // Added by Christella - 03/06/2026
const timelineRouter = require('./routes/timeline'); // Added by Christella - 03/13/2026
const currencyRouter = require('./routes/currency'); // added by daniel q. - 3/17/36
const { router: activityLogRouter } = require('./routes/activitylog'); // Added by Marisol - 03/05/2026
const glossaryRoutes = require('./routes/glossaryRoutes'); // Added by Christella - 03/17/2026
const chatRouter = require('./routes/chat'); // Added by Reymes - 03/24/2026
const adminRoutes = require('./routes/admin'); // Added by Marisol for WORK REVIEW 3
const contactRouter = require('./routes/contact'); // Added by Marisol for WORK REVIEW 3
const messagesRouter = require('./routes/messages');
//===== Created by Christella - 11/22/2025 =====//
const app = express()
const port = 4000
//===== End of code created by Christella - 11/22/2025 =====//

app.use(cors()) // Created by Christella - 11/22/2025
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files as static files so they can be accessed via URL 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// End of Marisol Morales Code 1/28/26 ===============

app.use('/api/admin', adminRoutes); // added by Marisol for WORK REVIEW 3
app.use('/api/contact', contactRouter); // added by Marisol for WORK REVIEW 3
app.use('/api/messages', messagesRouter);

// Mount routes
app.use('/api/notifications', notificationsRouter);
app.use('/api/daily-facts', dailyFactsRouter);
app.use('/api', authRouter);           // /api/signup, /api/login, /api/user-by-email
app.use('/api/profile', profileRouter); // /api/profile/update, /api/profile/delete, /api/upload-image, etc.
app.use('/api/poverty', povertyRouter);
app.use('/api/freerice', freericeRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/pledges', pledgesRouter); // Added by Christella - 03/06/2026
app.use('/api/activity-log', activityLogRouter); // Added by Marisol - 03/05/2026
app.use('/api/timeline', timelineRouter); // Added by Christella - 03/13/2026
app.use('/api/glossary', glossaryRoutes); // Added by Christella - 03/17/2026
app.use('/api/currency', currencyRouter); // added by daniel q. - 3/17/36
app.use('/api/chat', chatRouter); // Added by Reymes - 03/24/2026

//===== Created by Christella - 11/22/2025 =====//
// Root endpoint
app.get('/', async (req, res) => {
  try {
    const db = getDb();
    const data = await db.collection('names').find({}).limit(10).toArray()
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
});
// End of creation by Christella - 11/22/2025

// 12.15.2025 12:46pm

// Start server and connect to MongoDB
(async () => {
  try {
    await connectDB();
    console.log('Database initialized');
  } catch (err) {
    console.error('Warning: could not connect to DB - running with limited functionality:', err && err.stack ? err.stack : err);
    // Don't exit the process; keep the server running so frontend can reach it and return JSON errors for DB-required endpoints
  }

  // Debug ping endpoint to verify server reachability and DB status
  app.get('/api/debug/ping', (req, res) => {
    res.json({ ok: true, dbInitialized: !!getDb() });
  });

  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });

  // Schedule daily fact reminders (waits 5s for DB to be ready)
  setTimeout(() => {
    if (getDb()) {
      scheduleDailyReminder();
    }
  }, 5000);
})();