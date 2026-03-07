//===== Created by Christella - 11/22/2025 =====//
const { MongoClient, ObjectId } = require('mongodb') // Added ObjectID - Christella 12/10/2025
// ===== End of created code by Christella - 11/22/2025 =====//

const uri = process.env.CONNECTION_URI
// Edited by Christella, 1/26/2026
const client = new MongoClient(uri);
//===== Created by Christella - 11/22/2025 =====
let db

async function connectDB() {
  await client.connect()
  db = client.db('povertylensapp')
  console.log('Connected to MongoDB')

  //===== Added by Christella, 1/26/2026 =====
  try {
    await db.collection('povertyLiveStats').createIndex({country: 1, year: -1, povline: 1, fetchedAt: -1 });
    await db.collection('povertyLiveStats').createIndex({ povline: 1, country: 1, year: -1, fetchedAt: -1});
    console.log('Indexes created on povertyLiveStats');
  } catch (err) {
    console.warn('Could not create indexes for povertyLiveStats:', err.message || err);
  }
  // ===== End of addition by Christella, 1/26/2026 =====
  try {
    await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
    console.log('Index created on notifications collection');
  } catch (err) {
    console.warn('Could not create index for notifications:', err.message || err);
  }
  //Daily facts added by Damon
  try {
    await db.collection('dailyFacts').createIndex({ createdAt: 1 });
    await db.collection('notifications').createIndex({ userId: 1, dailyFactDate: 1 });
    console.log('Indexes created on dailyFacts (createdAt) and notifications.dailyFactDate');
  } catch (err) {
    console.warn('Could not create indexes for dailyFacts/notifications:', err.message || err);
  }
  // Added by Christella - 02/04/2026
  try {
    await db.collection('donations').createIndex({email: 1, createdAt: -1});
    console.log('Index created on donations collection');
  } catch (err) {
    console.warn('Could not create index for donation:', err.message || err);
  }
  // End of addition by Christella - 02/04/2026

  // Added by Marisol - 03/05/2026
  try {
    await db.collection('activityLogs').createIndex({ email: 1, timestamp: -1 });
    console.log('Index created on activityLogs collection');
  } catch (err) {
    console.warn('Could not create index for activityLogs:', err.message || err);
  }
  // End of addition by Marisol - 03/05/2026
}

function getDb() {
  return db;
}

module.exports = { connectDB, getDb, ObjectId };