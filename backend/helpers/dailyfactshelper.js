// ===== HELPER =====
// File created by Christella - 2/26/2026

const { getDb } = require('../database');

//Daily facts helper added by Damon
//Helper: get today's date string (UTC YYYY-MM-DD)
function todayDateStringUTC() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

//Daily facts added by Damon
//Get today's fact (deterministic random selection per-day)
async function getTodaysFact() {
  const db = getDb();
  const dfCol = db.collection('dailyFacts');
  const count = await dfCol.countDocuments();
  if (!count) return null;

  //Deterministic selection per-day using date string as seed
  const seed = todayDateStringUTC();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % count;

  const fact = await dfCol.find().limit(1).skip(idx).next();
  return fact || null;
}

async function sendDailyFactReminder() {
  try {
    const db = getDb();
    // Get today's actual fact first
    const fact = await getTodaysFact();
    if (!fact) {
      console.log('No daily fact available to send');
      return;
    }
    
    const users = await db.collection('users').find({}, { projection: { email: 1 } }).toArray();
    const notificationsCollection = db.collection('notifications');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create message with the actual fact
    const factMessage = fact.text;
    const factTitle = fact.title || 'Daily Fact';
    const message = `${factTitle}: ${factMessage}`;
    
    let sentCount = 0;
    for (const user of users) {
      const existing = await notificationsCollection.findOne({
        userId: user.email,
        dailyFactReminder: true,  // Check by type instead of message
        createdAt: { $gte: today }
      });
      
      if (!existing) {
        await notificationsCollection.insertOne({
          userId: user.email,
          message: message,  // Now contains the actual fact!
          createdAt: new Date(),
          read: false,
          dailyFactReminder: true
        });
        sentCount++;
      }
    }
    
    console.log(`Daily fact reminders sent to ${sentCount} users with fact: ${message.substring(0, 50)}...`);
  } catch (err) {
    console.error('Error sending daily fact reminder:', err);
  }
}

const scheduleDailyReminder = () => {
  const now = new Date();
  const target = new Date();
  target.setHours(9, 0, 0, 0); // 9:00 AM
  
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  
  const msUntilTarget = target.getTime() - now.getTime();
  
  setTimeout(() => {
    sendDailyFactReminder();
    setInterval(sendDailyFactReminder, 24 * 60 * 60 * 1000);
  }, msUntilTarget);
  
  console.log(`Daily fact reminder scheduled for ${target.toLocaleString()}`);
};

module.exports = { todayDateStringUTC, getTodaysFact, sendDailyFactReminder, scheduleDailyReminder };