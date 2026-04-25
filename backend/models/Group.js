const { getDb } = require('../database');
const { ObjectId } = require('mongodb');

class Group {
  static collection() {
    const db = getDb();
    return db.collection('groups');
  }

  static async ensureIndexes() {
    const col = this.collection();
    await Promise.all([
      col.createIndex({ code: 1 }, { unique: true }),
      col.createIndex({ inviteToken: 1 }, { unique: true }),
      col.createIndex({ leaderEmail: 1 }),
      col.createIndex({ memberEmails: 1 }),
      col.createIndex({ createdAt: -1 }),
    ]);
  }

  static async create({ name, type, description, leaderEmail, leaderUsername, isPublic }) {
    const col = this.collection();
    const now = new Date();

    const doc = {
      name,
      type,
      description: description || '',
      leaderEmail,
      leaderUsername: leaderUsername || leaderEmail.split('@')[0],
      memberEmails: [leaderEmail],
      memberCount: 1,
      code: this.makeJoinCode(),
      inviteToken: this.makeInviteToken(),
      assignments: [],
      isPublic: Boolean(isPublic),
      createdAt: now,
      updatedAt: now,
    };

    const result = await col.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  static async listByEmail(email) {
    const col = this.collection();
    return col
      .find({ memberEmails: email })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  static async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    const col = this.collection();
    return col.findOne({ _id: new ObjectId(id) });
  }

  static async findByCode(code) {
    const col = this.collection();
    return col.findOne({ code: String(code || '').toUpperCase().trim() });
  }

  static async addMember(groupId, email) {
    if (!ObjectId.isValid(groupId)) return null;
    const col = this.collection();
    const id = new ObjectId(groupId);

    const result = await col.findOneAndUpdate(
      { _id: id },
      {
        $addToSet: { memberEmails: email },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    const memberCount = Array.isArray(result.memberEmails) ? result.memberEmails.length : 0;

    return col.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          memberCount,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
  }

  static async assignToMember(groupId, assignmentId, memberEmail) {
    if (!ObjectId.isValid(groupId)) return null;
    const col = this.collection();
    return col.findOneAndUpdate(
      { _id: new ObjectId(groupId), 'assignments.id': assignmentId },
      {
        $set: {
          'assignments.$.assignedTo': memberEmail,
          'assignments.$.completed': false,
          'assignments.$.completedAt': null,
          'assignments.$.completedBy': null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
  }

  static async addAssignment(groupId, assignment) {
    if (!ObjectId.isValid(groupId)) return null;
    const col = this.collection();

    return col.findOneAndUpdate(
      { _id: new ObjectId(groupId) },
      {
        $push: { assignments: assignment },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );
  }

  static async removeAssignment(groupId, assignmentId) {
    if (!ObjectId.isValid(groupId)) return null;
    const col = this.collection();
    return col.findOneAndUpdate(
      { _id: new ObjectId(groupId) },
      {
        $pull: { assignments: { id: assignmentId } },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );
  }

  static async deleteGroup(groupId) {
    if (!ObjectId.isValid(groupId)) return null;
    const col = this.collection();
    return col.deleteOne({ _id: new ObjectId(groupId) });
  }

  static makeJoinCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 6; i += 1) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  static makeInviteToken() {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

module.exports = Group;
