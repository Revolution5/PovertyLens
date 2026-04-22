// daniel q. added 4/22/26

const { getDb } = require('../database');
const { ObjectId } = require('mongodb');

class ShopItem {
  static getCollection() {
    const db = getDb();
    return db.collection('shop_items');
  }

  // Get all active shop items
  static async getAllActive() {
    const collection = this.getCollection();
    return await collection.find({ isActive: true }).sort({ category: 1, cost: 1 }).toArray();
  }

  // Get all shop items (including inactive)
  static async getAll() {
    const collection = this.getCollection();
    return await collection.find({}).sort({ createdAt: -1 }).toArray();
  }

  // Get item by ID
  static async getById(id) {
    const collection = this.getCollection();
    return await collection.findOne({ id: id });
  }

  // Add new shop item
  static async addItem(itemData) {
    const collection = this.getCollection();
    const newItem = {
      ...itemData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await collection.insertOne(newItem);
    return newItem;
  }

  // Update shop item
  static async updateItem(id, updateData) {
    const collection = this.getCollection();
    const result = await collection.updateOne(
      { id: id },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        } 
      }
    );
    return result;
  }

  // Delete (soft delete) shop item
  static async deleteItem(id) {
    const collection = this.getCollection();
    const result = await collection.updateOne(
      { id: id },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
    return result;
  }

  // Permanently remove shop item
  static async permanentlyRemove(id) {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ id: id });
    return result;
  }

  // Get items by category
  static async getByCategory(category) {
    const collection = this.getCollection();
    return await collection.find({ category: category, isActive: true }).toArray();
  }
}

module.exports = ShopItem;