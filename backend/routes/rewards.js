// daniel q. added 4/22/26

const express = require('express');
const router = express.Router();
const UserPoints = require('../models/UserPoints');
const ShopItem = require('../models/ShopItem');

router.get('/points/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    let userPoints = await UserPoints.getUserPoints(email);
    
    if (!userPoints) {
      // Initialize if user doesn't exist
      await UserPoints.initializeUser(email, email.split('@')[0]);
      userPoints = await UserPoints.getUserPoints(email);
    }
    
    res.json({
      success: true,
      points: userPoints.points,
      totalPointsEarned: userPoints.totalPointsEarned,
      purchasedItems: userPoints.purchasedItems || [],
      activeCustomizations: userPoints.activeCustomizations
    });
  } catch (error) {
    console.error('Error getting user points:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/shop', async (req, res) => {
  try {
    const allItems = await ShopItem.getAllActive();
    
    // Group by category for easier frontend consumption
    const grouped = {
      frames: allItems.filter(item => item.category === 'avatarFrame'),
      themes: allItems.filter(item => item.category === 'profileTheme'),
      badges: allItems.filter(item => item.category === 'badge')
    };
    
    res.json({
      success: true,
      shop: grouped
    });
  } catch (error) {
    console.error('Error fetching shop items:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/shop/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await ShopItem.getById(itemId);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    if (!item.isActive) {
      return res.status(400).json({ success: false, message: 'This item is no longer available' });
    }
    
    res.json({
      success: true,
      item: item
    });
  } catch (error) {
    console.error('Error fetching shop item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/purchase', async (req, res) => {
  try {
    const { email, itemId } = req.body;
    
    if (!email || !itemId) {
      return res.status(400).json({ success: false, message: 'Email and itemId are required' });
    }
    
    const item = await ShopItem.getById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    if (!item.isActive) {
      return res.status(400).json({ success: false, message: 'This item is no longer available for purchase' });
    }
    
    const result = await UserPoints.purchaseItem(email, itemId, item);
    
    res.json({
      success: true,
      message: `Successfully purchased ${item.name}!`,
      remainingPoints: result.points,
      purchasedItem: {
        id: item.id,
        name: item.name,
        category: item.category,
        cost: item.cost
      }
    });
  } catch (error) {
    console.error('Error purchasing item:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/equip', async (req, res) => {
  try {
    const { email, category, itemId, itemName } = req.body;
    
    if (!email || !category || !itemId) {
      return res.status(400).json({ success: false, message: 'Email, category, and itemId are required' });
    }
    
    const item = await ShopItem.getById(itemId);
    if (!item || !item.isActive) {
      return res.status(404).json({ success: false, message: 'Item not found or no longer available' });
    }
    
    const result = await UserPoints.equipItem(email, category, itemId, itemName);
    
    res.json({
      success: true,
      message: 'Customization applied!',
      activeCustomizations: result.activeCustomizations
    });
  } catch (error) {
    console.error('Error equipping item:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/add-points', async (req, res) => {
  try {
    const { email, points, reason } = req.body;
    
    if (!email || !points) {
      return res.status(400).json({ success: false, message: 'Email and points are required' });
    }
    
    const result = await UserPoints.addPoints(email, points, reason || 'Bonus points');
    
    res.json({
      success: true,
      message: `Added ${points} points!`,
      newTotal: result.points
    });
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/history/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const userPoints = await UserPoints.getUserPoints(email);
    
    if (!userPoints) {
      return res.json({ success: true, history: [] });
    }
    
    res.json({
      success: true,
      history: userPoints.pointsHistory || []
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;