const { getDb } = require('../database');
const { ObjectId } = require('mongodb');

class GroupProgress {
  static collection() {
    const db = getDb();
    return db.collection('group_progress');
  }

  static async ensureIndexes() {
    const col = this.collection();
    await Promise.all([
      col.createIndex({ groupId: 1, userEmail: 1 }, { unique: true }),
      col.createIndex({ groupId: 1 }),
      col.createIndex({ userEmail: 1 }),
      col.createIndex({ updatedAt: -1 }),
    ]);
  }

  static async ensureMemberRow(groupId, userEmail, username) {
    if (!ObjectId.isValid(groupId)) return null;
    const col = this.collection();
    const now = new Date();

    await col.updateOne(
      { groupId: new ObjectId(groupId), userEmail },
      {
        $setOnInsert: {
          groupId: new ObjectId(groupId),
          userEmail,
          username: username || userEmail.split('@')[0],
          pledgesCompleted: 0,
          grainsEarned: 0,
          storiesPosted: 0,
          volunteerHours: 0,
          quizzesPassed: 0,
          createdAt: now,
        },
        $set: { updatedAt: now },
      },
      { upsert: true }
    );

    return col.findOne({ groupId: new ObjectId(groupId), userEmail });
  }

  static async updateMetrics(groupId, userEmail, username, metrics) {
    if (!ObjectId.isValid(groupId)) return null;

    const inc = {};
    const numericKeys = [
      'pledgesCompleted',
      'grainsEarned',
      'storiesPosted',
      'volunteerHours',
      'quizzesPassed',
    ];

    for (const key of numericKeys) {
      const value = Number(metrics[key] ?? 0);
      if (Number.isFinite(value) && value !== 0) {
        inc[key] = value;
      }
    }

    const col = this.collection();
    const update = {
      $set: {
        updatedAt: new Date(),
        username: username || userEmail.split('@')[0],
      },
      $setOnInsert: {
        groupId: new ObjectId(groupId),
        userEmail,
        createdAt: new Date(),
        pledgesCompleted: 0,
        grainsEarned: 0,
        storiesPosted: 0,
        volunteerHours: 0,
        quizzesPassed: 0,
      },
    };

    if (Object.keys(inc).length > 0) {
      update.$inc = inc;
    }

    await col.updateOne(
      { groupId: new ObjectId(groupId), userEmail },
      update,
      { upsert: true }
    );

    return col.findOne({ groupId: new ObjectId(groupId), userEmail });
  }

  static async listByGroup(groupId) {
    if (!ObjectId.isValid(groupId)) return [];
    const col = this.collection();
    return col
      .find({ groupId: new ObjectId(groupId) })
      .sort({ updatedAt: -1 })
      .toArray();
  }
}

module.exports = GroupProgress;
