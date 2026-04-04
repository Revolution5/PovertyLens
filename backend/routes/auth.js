// File created by Christella - 2/26/2026
// ===== ROUTE =====

const express = require('express');
const router = express.Router();
//Password hashing/encryption added by Damon
const bcrypt = require('bcryptjs');

const { getDb } = require('../database');
const { createNotification } = require('../helpers/notificationshelper');
const { logActivity } = require('./activitylog'); // Added by Marisol - 03/05/2026


// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ 
        message: 'Email, username and password are required' 
      });
    }

    const db = getDb();
    const usersCollection = db.collection('users');
    const existingUserByEmail = await usersCollection.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingUserByUsername = await usersCollection.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    //Password hashing/encryption added by Damon
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      username,
      password: hashedPassword,
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    console.log(`New user created: ${email} (${username})`);

    createNotification(email, `Welcome to PovertyLens, ${username}!`);
    await logActivity(email, 'Created account', `Signed up as @${username}`, req); // Added by Marisol - 03/05/2026

    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      user: { email: newUser.email, username: newUser.username, id: result.insertedId }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
});

// Log in
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const db = getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // START Added by Marisol for work review 3 - Block banned and suspended users from logging in
    if (user.banned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been permanently banned. Please contact support if you believe this is a mistake.'
      });
    }

    // END Added by Marisol for work review 3 - Block banned users from logging in
    
    //Password hashing/encryption added by Damon
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await logActivity(email, 'Failed login attempt', '', req); // Added by Marisol - 03/05/2026
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }
    
    console.log(`User logged in: ${email}`);
    await logActivity(email, 'Signed in', '', req); // Added by Marisol - 03/05/2026

    res.json({ 
      success: true,
      message: 'Login successful',
      user: { 
        email: user.email, 
        username: user.username,
        id: user._id,
        admin: user.admin ?? false  // Added by Marisol for work review 3 - Include admin status in login response
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Get user by email (for profile display in statistics page) - daniel q. 2/4
router.get('/user-by-email', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const db = getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne(
      { email },
      { projection: { password: 0, passwordHistory: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
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
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout - Added by Marisol 03/05/2026
router.post('/logout', async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      await logActivity(email, 'Signed out', '', req);
    }
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
});

//START Forgot Password - Added by Damon 3/7/2026
router.post('/forgot-password/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const db = getDb();
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account exists with that email address' });

    return res.json({ success: true, message: 'Email found. You can set a new password now.' });
  } catch (error) {
    console.error('Forgot password email check error:', error);
    return res.status(500).json({ success: false, message: 'Server error while checking email' });
  }
});

router.post('/forgot-password/reset-direct', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) return res.status(400).json({ success: false, message: 'Email and new password are required' });
    if (String(newPassword).length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });

    const db = getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account exists with that email address' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await usersCollection.updateOne({ _id: user._id }, { $set: { password: hashedPassword, passwordUpdatedAt: new Date() } });

    await createNotification(email, 'Your password was reset successfully.');
    await logActivity(email, 'Reset password', '', req);

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Direct reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error while resetting password' });
  }
});
//END Forgot Password - Added by Damon 3/7/2026

module.exports = router;