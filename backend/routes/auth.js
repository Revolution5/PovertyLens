// File created by Christella - 2/26/2026
// ===== ROUTE =====

const express = require('express');
const router = express.Router();

//Password hashing/encryption added by Damon
const bcrypt = require('bcryptjs');

const { getDb } = require('../database');
const { createNotification } = require('../helpers/notificationshelper');

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ 
        message: 'Email, username and password are required' 
      });
    }

    // Check if user already exists (by email or username)
    const db = getDb();
    const usersCollection = db.collection('users');
    const existingUserByEmail = await usersCollection.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ 
        message: 'Email already exists' 
      });
    }

    const existingUserByUsername = await usersCollection.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ 
        message: 'Username already taken' 
      });
    }

    //Password hashing/encryption added by Damon
    //Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with hashed password
    const newUser = {
      email,
      username,
      password: hashedPassword,
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    
    console.log(`New user created: ${email} (${username})`);

    createNotification(email, `Welcome to PovertyLens, ${username}!`);

    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      user: { 
        email: newUser.email, 
        username: newUser.username,
        id: result.insertedId 
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during signup' 
    });
  }
});

// Log in
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }
    
    // Find user by email
    const db = getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    //Password hashing/encryption added by Damon
    //Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid password' 
      });
    }
    
    console.log(`User logged in: ${email}`);
    res.json({ 
      success: true,
      message: 'Login successful',
      user: { 
        email: user.email, 
        username: user.username,
        id: user._id 
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// Get user by email (for profile display in statistics page) - daniel q. 2/4
router.get('/user-by-email', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    const db = getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne(
      { email },
      { projection: { password: 0, passwordHistory: 0 } } // Exclude sensitive data
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      user: {
        email: user.email,
        username: user.username,
        profileImage: user.profileImage || null,
        bannerImage: user.bannerImage || null,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;