// -d.q. added 04/22/26

const { getDb } = require('../database');
const { ObjectId } = require('mongodb');

class UserPoints {
  static getCollection() {
    const db = getDb();
    return db.collection('user_points');
  }

  // Initialize points for a new user
  static async initializeUser(email, username) {
    const collection = this.getCollection();
    const existing = await collection.findOne({ email });
    
    if (!existing) {
      const result = await collection.insertOne({
        email,
        username,
        points: 0,
        totalPointsEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Store purchased items
        purchasedItems: [],
        // Active customization items
        activeCustomizations: {
          avatarFrame: null,
          profileTheme: 'default',
          badge: null
        }
      });
      return result;
    }
    return existing;
  }

  // Get user points and info
  static async getUserPoints(email) {
    const collection = this.getCollection();
    return await collection.findOne({ email });
  }

  // Add points to user
  static async addPoints(email, points, reason) {
    const collection = this.getCollection();
    const result = await collection.findOneAndUpdate(
      { email },
      { 
        $inc: { 
          points: points,
          totalPointsEarned: points
        },
        $set: { updatedAt: new Date() },
        $push: {
          pointsHistory: {
            amount: points,
            reason: reason,
            date: new Date()
          }
        }
      },
      { returnDocument: 'after' }
    );
    return result;
  }

  // Deduct points from user
  static async deductPoints(email, points, reason) {
    const collection = this.getCollection();
    const user = await collection.findOne({ email });
    
    if (!user || user.points < points) {
      throw new Error('Insufficient points');
    }
    
    const result = await collection.findOneAndUpdate(
      { email },
      { 
        $inc: { points: -points },
        $set: { updatedAt: new Date() },
        $push: {
          pointsHistory: {
            amount: -points,
            reason: reason,
            date: new Date()
          }
        }
      },
      { returnDocument: 'after' }
    );
    return result;
  }

  // Purchase an item
  static async purchaseItem(email, itemId, itemDetails) {
    const collection = this.getCollection();
    const user = await collection.findOne({ email });
    
    if (!user || user.points < itemDetails.cost) {
      throw new Error('Insufficient points');
    }
    
    // Check if already purchased
    const alreadyPurchased = user.purchasedItems?.some(
      item => item.itemId === itemId
    );
    
    if (alreadyPurchased) {
      throw new Error('Item already purchased');
    }
    
    const result = await collection.findOneAndUpdate(
      { email },
      {
        $inc: { points: -itemDetails.cost },
        $push: {
          purchasedItems: {
            itemId: itemId,
            name: itemDetails.name,
            category: itemDetails.category,
            cost: itemDetails.cost,
            purchasedAt: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
    
    return result;
  }

  // Apply/equip a customization item
  static async equipItem(email, category, itemId, itemName) {
    const collection = this.getCollection();
    const user = await collection.findOne({ email });
    
    // Check if user owns this item
    const ownsItem = user.purchasedItems?.some(
      item => item.itemId === itemId
    );
    
    if (!ownsItem) {
      throw new Error('Item not owned');
    }
    
    const updateField = `activeCustomizations.${category}`;
    const result = await collection.findOneAndUpdate(
      { email },
      {
        $set: {
          [updateField]: { itemId, name: itemName, equippedAt: new Date() },
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    return result;
  }
}

module.exports = UserPoints;