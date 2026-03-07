// File created by Christella - 2/26/2026
// ===== ROUTE =====

const express = require('express');
const router = express.Router();

//Password hashing/encryption added by Damon
const bcrypt = require('bcryptjs');

// Code for allowing for Image uploads : Marisol Morales 1/28/26 
const multer = require('multer') // Import multer for handling file uploads
const path = require('path') // Import path module for handling file paths
const fs = require('fs').promises // Import fs module for file system operations
// End of Marisol Morales Code 1/28/26

const { getDb } = require('../database');
const { logActivity } = require('./activitylog'); // Added by Marisol - 03/05/2026

// Added by Marisol Morales 1/28/26 
// Configure multer storage to save uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define the upload directory
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Use promises properly with callbacks
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => {
        cb(null, uploadDir); // Set upload directory
      })
      .catch((err) => {
        cb(err); // Handle error
      });
  },
  filename: (req, file, cb) => {
    // Generate unique filename WITH the original file extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname); // Get .jpg, .png, etc.
    cb(null, uniqueSuffix + extension);
  }
});

// Configure multer with storage settings and file validation
const upload = multer({
  storage: storage, // Use the defined storage
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }, 
  fileFilter: (req, file, cb) => {
    // only allow specific file types
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true); // Accept file
    }
    cb(new Error('Only images of type JPEG, JPG, PNG, and WEBP are allowed')); // Reject file
  }
});
// End of Marisol Morales Code 1/28/26 ===============

// Profile Update Route
router.put('/update', async (req, res) => {
  try {
    const { email, currentPassword, newPassword, newUsername } = req.body;
    
    if (!email || !currentPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and current password are required' 
      });
    }
    
    const db = getDb();
    const usersCollection = db.collection('users');
    
    // Find user by email
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    //Password hashing/encryption added by Damon
    //Verify current password using bcrypt
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    // Update email if changed (check if new email exists)
    if (email !== user.email) {
      const emailExists = await usersCollection.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already in use' 
        });
      }
      updateData.email = email;
    }
    
    // Update password if provided
    if (newPassword) {
      // Marisol Morales 1/29/26 - Adding password history restriction 

      // Get password histroy (deafault to empty array)
      const passwordHistory = user.passwordHistory || [];

      //Password hashing/encryption added by Damon
      //check if new password matches current password 
      const matchesCurrent = await bcrypt.compare(newPassword, user.password);
      if (matchesCurrent) {
        return res.status(400).json({
          success: false,
          message: 'New password must be different from current password'        
        });
      }
      //Password hashing/encryption added by Damon
      //check if new password matches any in password history
      for (let i = 0; i < Math.min(passwordHistory.length, 3); i++) {
        const matchesOld = await bcrypt.compare(newPassword, passwordHistory[i]);
        if (matchesOld) {
          return res.status(400).json({
            success: false,
            message: 'New password must be different from the last 3 passwords'
          });
        }
      }
      //Password hashing/encryption added by Damon
      //Hash new password 
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      //add current password to history 
      const updatedPasswordHistory = [user.password, ...passwordHistory].slice(0, 3); // keep last 3 passwords

      //Keep only the last 3 passwords in history
      const trimmedHistory = updatedPasswordHistory.slice(0, 3);

      // update both password and password history
      updateData.password = hashedNewPassword;
      updateData.passwordHistory = trimmedHistory;

      //updateData.password = await bcrypt.hash(newPassword, 10);
    } // End of newPassword block - Marisol Morales 1/29/26

    // Update username if provided (check if exists)
    if (newUsername && newUsername !== user.username) {
      const usernameExists = await usersCollection.findOne({ username: newUsername });
      if (usernameExists) {
        return res.status(400).json({ 
          success: false,
          message: 'Username already taken' 
        });
      }
      updateData.username = newUsername;
    }
    
    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: updateData }
      );
      
      // Added by Marisol - 03/05/2026
      if (updateData.password) await logActivity(email, 'Changed password', '', req);
      if (updateData.username) await logActivity(email, 'Updated username', `Changed to @${updateData.username}`, req);
      // End of addition by Marisol - 03/05/2026

      console.log(`Profile updated for: ${user.email}`);
    }
    
    res.json({ 
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during profile update' 
    });
  }
});

// Delete Account Route
router.delete('/delete', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }
    
    const db = getDb();
    const usersCollection = db.collection('users');
    
    // Find user
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Verify password
    //Password hashing/encryption added by Damon 3/2/2026
    if (await bcrypt.compare(password, user.password) == false) {
      return res.status(400).json({ 
        success: false,
        message: 'Password is incorrect' 
      });
    }

    // Added by Christella - 2/27/2026
    // Anonymize stories before deleting account
    await db.collection('stories').updateMany(
      {userEmail: email },
      {$set: {userEmail: null, displayName: false, displayPhoto: false }}
    );
    // End of addition by Christella - 2/27/2026

    // Delete user
    await usersCollection.deleteOne({ _id: user._id });
    
    console.log(`Account deleted: ${email}`);
    await logActivity(email, 'Deleted account', '', req); // Added by Marisol - 03/05/2026
    
    res.json({ 
      success: true,
      message: 'Account deleted successfully'
    });
    
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during account deletion' 
    });
  }
});

// Start of Marisol Morales Code for image uploads 1/28/26 
// Upload image route - handles profile picture and banner uploads 
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    // get email and type from request body
    const { email, type } =  req.body;

    // validate that email was provided
    if (!email) {
      // if no email, delete the uploaded file to avoid orphaned files 
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Email is required',   
      });
    }

    // Check if file was uploaded by multer 
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create url path that will be put in MongoDB
    const imageUrl = `/uploads/${req.file.filename}`;
    const db = getDb();
    const usersCollection = db.collection('users');

    // Find the user to ensure they exist and get their old image 
    const user = await usersCollection.findOne({ email });
    if (!user) {
      // user not found, cleanup uploaded file
      await fs.unlink(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
  }

  // determine field to update based on type
  const fieldName = type === 'profile' ? 'profileImage' : 'bannerImage';
    
    // Delete old image file if it exists to free up storage
    if (user[fieldName]) {
      const oldImagePath = path.join(__dirname, '..', user[fieldName]);
      try {
        await fs.unlink(oldImagePath);
        console.log(`Deleted old image: ${oldImagePath}`);
      } catch (err) {
        // Ignore error if old file doesn't exist (already deleted or never existed)
        console.log('Old image not found or already deleted');
      }
    }

    // Update MongoDB user document with the new image path
    await usersCollection.updateOne(
      { email },
      { $set: { [fieldName]: imageUrl } }
    );

    console.log(`Image uploaded for ${email}: ${imageUrl}`);
    await logActivity(email, 'Updated profile image', type === 'profile' ? 'Profile picture changed' : 'Banner image changed', req); // Added by Marisol - 03/05/2026

    // Send success response with the image URL
    res.json({
      success: true,
      imageUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during upload'
    });
  }
});

// Remove image route - deletes image file and removes reference from database
router.post('/remove-image', async (req, res) => {
  try {
    // Get email and type from request body
    const { email, type } = req.body;

    // Validate email was provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const db = getDb();
    const usersCollection = db.collection('users');
    // Find the user
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Determine which field to remove (profileImage or bannerImage)
    const fieldName = type === 'profile' ? 'profileImage' : 'bannerImage';
    
    // Delete the actual image file from the uploads folder
    if (user[fieldName]) {
      const imagePath = path.join(__dirname, '..', user[fieldName]);
      try {
        await fs.unlink(imagePath);
        console.log(`Deleted image: ${imagePath}`);
      } catch (err) {
        console.log('Image file not found or already deleted');
      }
    }

    // Remove the image reference from MongoDB (using $unset to delete the field)
    await usersCollection.updateOne(
      { email },
      { $unset: { [fieldName]: "" } }
    );

    console.log(`Image removed for ${email}`);
    await logActivity(email, 'Removed profile image', type === 'profile' ? 'Profile picture removed' : 'Banner image removed', req); // Added by Marisol - 03/05/2026

    res.json({
      success: true,
      message: 'Image removed successfully'
    });

  } catch (error) {
    console.error('Remove error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing image'
    });
  }
});

// Get user profile images - retrieves the image URLs from MongoDB
router.get('/user-images', async (req, res) => {
  try {
    // Get email from URL parameter
    const { email } = req.query;
    
    const db = getDb();
    const usersCollection = db.collection('users');
    // Find user and only return the image fields (projection)
    const user = await usersCollection.findOne(
      { email },
      { projection: { profileImage: 1, bannerImage: 1 } }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return the image URLs (or null if they don't exist)
    res.json({
      success: true,
      profileImage: user.profileImage || null,
      bannerImage: user.bannerImage || null
    });

  } catch (error) {
    console.error('Error fetching user images:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
// End of Marisol Morales Code 1/28/26 =====================

module.exports = router;