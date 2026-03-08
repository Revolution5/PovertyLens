// Created by Christella - 2/26/2026
// ===== HELPER =====

const { getDb } = require('../database');

async function createNotification(userId, message) {
  try {
    const db = getDb();
    const notificationsCollection = db.collection('notifications');
    
    const newNotification = {
      userId,
      message,
      createdAt: new Date(),
      read: false
    };
    
    await notificationsCollection.insertOne(newNotification);
    console.log(`Notification created for ${userId}`);
    
    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

module.exports = { createNotification };