//Created by Damon 4/3/2026
const { getDb } = require('../database');

function buildMessage(type, context = {}) {
  const from = 'PovertyLens Team';

  switch (type) {
    case 'story_under_review':
      return {
        type,
        from,
        subject: 'Your story has been reported',
        body: `Hi! We wanted to let you know that your story "${context.storyTitle || 'your story'}" has been reported by another user. We are currently putting it under review. We appreciate your patience while we look into this and will follow up after the review is complete.`,
      };
    case 'story_approved':
      return {
        type,
        from,
        subject: 'Your story has been approved',
        body: `After reviewing your story "${context.storyTitle || 'your story'}", we found no community guideline violations. Your story remains published.`,
      };
    case 'story_removed':
      return {
        type,
        from,
        subject: 'Your story has been removed',
        body: `After reviewing your story "${context.storyTitle || 'your story'}", we found that it violated our community guidelines and it has been removed from the platform.`,
      };
    case 'warning_issued':
      return {
        type,
        from,
        subject: `Warning issued - ${context.warningCount || 1} of 3`,
        body: `You have received a warning on your PovertyLens account. This is warning ${context.warningCount || 1} of 3.`,
      };
    case 'suspension_issued':
      return {
        type,
        from,
        subject: 'Your account has been temporarily suspended',
        body: `Your PovertyLens account has been temporarily suspended for ${context.suspensionDays || 7} days due to repeated violations of our community guidelines.`,
      };
    case 'ban_issued':
      return {
        type,
        from,
        subject: 'Your account has been permanently banned',
        body: 'After multiple violations of our community guidelines, your PovertyLens account has been permanently banned.',
      };
    case 'story_report_cleared':
      return {
        type,
        from,
        subject: 'Report on your story has been cleared',
        body: `We have completed our review of the report made against your story "${context.storyTitle || 'your story'}" and found no violations. Your story remains published.`,
      };
    default:
      throw new Error(`Unsupported message type: ${type}`);
  }
}

async function createMessage(recipientEmail, type, context = {}) {
  if (!recipientEmail) {
    return null;
  }

  const db = getDb();
  if (!db) {
    throw new Error('Database not initialized');
  }

  const baseMessage = buildMessage(type, context);
  const message = {
    ...baseMessage,
    recipientEmail,
    read: false,
    createdAt: new Date(),
  };

  const result = await db.collection('messages').insertOne(message);
  return { ...message, _id: result.insertedId };
}

module.exports = {
  createMessage,
};