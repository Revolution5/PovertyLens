// backend/scripts/initShopItems.js
// Run this once to populate the database with default shop items
// Usage: node backend/scripts/initShopItems.js
// daniel q. created 4/22/26

require('dotenv').config({ path: __dirname + '/../.env' });
const { connectDB, getDb } = require('../database');

const defaultShopItems = [
  // Avatar Frames
  {
    id: 'frame_gold',
    name: 'Gold Frame',
    category: 'avatarFrame',
    cost: 500,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'frame_rainbow',
    name: 'Rainbow Frame',
    category: 'avatarFrame',
    cost: 300,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'frame_star',
    name: 'Star Frame',
    category: 'avatarFrame',
    cost: 200,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Profile Themes
  {
    id: 'theme_ocean',
    name: 'Ocean Theme',
    category: 'profileTheme',
    cost: 400,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'theme_forest',
    name: 'Forest Theme',
    category: 'profileTheme',
    cost: 400,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'theme_sunset',
    name: 'Sunset Theme',
    category: 'profileTheme',
    cost: 350,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'theme_dark',
    name: 'Dark Mode Theme',
    category: 'profileTheme',
    cost: 300,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Badges
  {
    id: 'badge_helper',
    name: 'Helping Hand Badge',
    category: 'badge',
    cost: 1000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'badge_donor',
    name: 'Generous Donor Badge',
    category: 'badge',
    cost: 1500,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'badge_storyteller',
    name: 'Storyteller Badge',
    category: 'badge',
    cost: 800,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function initializeShopItems() {
  try {
    await connectDB();
    const db = getDb();
    const collection = db.collection('shop_items');
    
    // Check if shop_items collection already has data
    const existingCount = await collection.countDocuments();
    
    if (existingCount === 0) {
      console.log('Initializing shop items in database...');
      const result = await collection.insertMany(defaultShopItems);
      console.log(`Successfully added ${result.insertedCount} shop items to database!`);
    } else {
      console.log(`Shop items already exist (${existingCount} items found). Skipping initialization.`);
      console.log('To reset, first delete the shop_items collection.');
    }
  } catch (error) {
    console.error('Error initializing shop items:', error);
  } finally {
    process.exit();
  }
}

// Run the initialization
initializeShopItems();