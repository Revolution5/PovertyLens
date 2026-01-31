require('dotenv').config()
const cors = require('cors')
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs')

// Code for allowing for Image uploads : Marisol Morale 1/28/26 
const multer = require('multer') // Import multer for handling file uploads
const path = require('path') // Import path module for handling file paths
const fs = require('fs').promises // Import fs module for file system operations
// End of Marisol Morales Code 1/28/26

const app = express()
const port = 4000

const fetch = require('node-fetch')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Added by Marisol Morales 1/28/26 
// Configure multer storage to save uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define the upload directory
    const uploadDir = path.join(__dirname, 'uploads');
    
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

// Serve uploaded files as static files so they can be accessed via URL 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// End of Marisol Morales Code 1/28/26 ===============

const uri = process.env.CONNECTION_URI
// edited by Christella, 1/26/2026
const client = new MongoClient(uri);

let db

async function connectDB() {
  await client.connect()
  db = client.db('povertylensapp')
  console.log('Connected to MongoDB')

  // added by Christella, 1/26/2026
  try {
    await db.collection('povertyLiveStats').createIndex({country: 1, year: -1, povline: 1, fetchedAt: -1 });
    await db.collection('povertyLiveStats').createIndex({ povline: 1, country: 1, year: -1, fetchedAt: -1});
    console.log('Indexes created on povertyLiveStats');
  } catch (err) {
    console.warn('Could not create indexes for povertyLiveStats:', err.message || err);
  }
}

// notifications array
const notifications = [];

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Create notification function
function createNotification(userId, message) {
  const newNotification = {
    id: generateId(),
    userId,
    message,
    createdAt: new Date(),
    read: false
  };
  
  notifications.unshift(newNotification); // Add to beginning
  
  // Keep only last 50 notifications to save memory
  if (notifications.length > 50) {
    notifications.length = 50;
  }
  
  return newNotification;
}

// Edited by Christella 1/30/2026
const ISO3_LIST = ['USA', 'CAN', 'MEX', 'BRA', 'ARG', 'GBR', 'FRA','DEU','ESP', 'ITA', 'IND', 'CHN', 'JPN', 'KOR', 'NGA', 'ZAF', 'EGY', 'ETH', 'PAK', 'BGD', 'IDN', 'VNM', 'PHL', 'THA', 'AUS', 'NZL'];

async function fetchPip({ country, year, povline }){
  let pipUrl = `https://api.worldbank.org/pip/v1/pip?country=${country}&povline=${povline}&fill_gaps=true&welfare_type=all`;
  if (year) pipUrl = `https://api.worldbank.org/pip/v1/pip?country=${country}&year=${year}&povline=${povline}&fill_gaps=true&welfare_type=all`;

  const pipRes = await fetch(pipUrl);
  if (!pipRes.ok) throw new Error(`PIP error status ${pipRes.status}`);
  const pipData = await pipRes.json();
  const row = Array.isArray(pipData) ? pipData[0] : null;
  return {pipData, row};
}

function extractMetricAndMeta(row){
  const metric = {
    headcount: typeof row?.headcount === 'number' ? row.headcount : null,
    poverty_gap: typeof row?.poverty_gap === 'number' ? row.poverty_gap : null,
    poverty_severity: typeof row?.poverty_severity === 'number' ? row.poverty_severity : null,
  };

  const meta = {
    reporting_year: row?.reporting_year ?? null,
    welfare_type: row?.welfare_type ?? null,
    reporting_level: row?.reporting_level ?? null,
    estimate_type: row?.estimate_type ?? null,
    country_name: row?.country_name ?? null,
    country_code: row?.country_code ?? null,
    poverty_line: row?.poverty_line ?? null,
  }
  return {metric, meta};
}

app.get('/', async (req, res) => {
  try {
    const data = await db.collection('names').find({}).limit(10).toArray()
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// 12.15.2025 12:46pm

// Sign up
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ 
        message: 'Email, username and password are required' 
      });
    }

    // Check if user already exists (by email or username)
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

    // Hash the password
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
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }
    
    // Find user by email
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Compare hashed password
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

// /api/poverty - done by Christella
// Returns poverty statistics from "povertyStats" collection.
app.get('/api/poverty/summary', async(req,res) => {
  try {
    const country = String(req.query.country || '').toUpperCase().trim();
    if (!/^[A-Z]{3}$/.test(country)){
      return res.status(400).json({success: false, message: 'country must be ISO3'});
    }

    const povline = Number(req.query.povline ?? DEFAULT_POVLINE);
    const maxAgeDays = Number(req.query.maxAgeDays ?? DEFAULT_MAX_AGE_DAYS);

    if (!Number.isFinite(povline) || povline <= 0 || povline > 100) {
      return res.status(400).json({ success: false, message: 'Invalid povline'});
    }

    const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    const col = db.collection('povertyLiveStats');

    // Find most recent cached doc for country + poverty line
    const cached = await col
      .find({country, povline})
      .sort({year: -1, fetchedAt: -1})
      .limit(1)
      .next();
    
    if (cached && cached.fetchedAt && new Date(cached.fetchedAt) >= cutoff) {
      return res.json({
        success: true,
        source: 'MongoDB cache (PIP-backed)',
        country,
        year: cached.year ?? null,
        povline,
        fetchedAt: cached.fetchedAt,
        metric: cached.metric ?? null,
        meta: cached.meta ?? null,
        data: cached.data ?? null,
      });
    }

    const yearToFetch = cached?.year ?? DEFAULT_YEAR;

    const { pipData, row } = await fetchPip({ country, year: yearToFetch, povline });
    const { metric, meta } = extractMetricAndMeta(row);

    const docToStore = {
      country,
      povline,
      year: yearToFetch,
      fetchedAt: new Date(),
      data: pipData,
      metric,
      meta,
    };

    await col.updateOne({ country, povline, year: yearToFetch }, {$set: docToStore}, {upsert: true});

    return res.json({
      success: true,
      source: 'World Bank PIP (Fresh)',
      country,
      year: yearToFetch,
      povline,
      fetchedAt: docToStore.fetchedAt,
      metric,
      meta,
      data: pipData,
    });
  } catch (err) {
    console.error('Error in /api/poverty/summary:', err);
    res.status(500).json({ success: false, message: 'Server error'});
  }
});

app.get('/api/poverty/pip-map', async (req, res) => {
  try {
    const povline = Number(req.query.povline ?? DEFAULT_POVLINE);
    const year = Number(req.query.year ?? DEFAULT_YEAR);
    const maxAgeDays = Number(req.query.maxAgeDays ?? DEFAULT_MAX_AGE_DAYS);

    if (!Number.isFinite(povline) || povline <= 0 || povline > 100) {
      return res.status(400).json({success: false, message: 'Invalid povline'});
    }
    if (!Number.isFinite(year) || year < 1960 || year > 2100){
      return res.status(400).json({success: false, message: 'Invalid year'});
    }

    const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60* 1000);
    const col = db.collection('povertyLiveStats');

    const CONCURRENCY = 8;
    const rows = [];
    let idx = 0;

    async function worker(){
      while (idx < ISO3_LIST.length){
        const country = ISO3_LIST[idx++];
        const cacheKey = { country, povline, year };

        const cached = await col.findOne({...cacheKey, fetchedAt: {$gte: cutoff }});
        if (cached) {
          rows.push({
            country,
            year,
            povline,
            headcount: cached.metric?.headcount ?? (Array.isArray(cached.data) ? cached.data[0]?.headcount : null),
            source: 'cache',
            fetchedAt: cached.fetchedAt,
          });
          continue;
        }

        try {
          const { pipData, row } = await fetchPip({country, year, povline});
          const { metric, meta } = extractMetricAndMeta(row);

          const docToStore = {
            ...cacheKey,
            fetchedAt: new Date(),
            data: pipData,
            metric,
            meta,
          };

          await col.updateOne(cache, { $set: docToStore }, {upsert: true});

          rows.push({
            country,
            year,
            povline,
            headcount: metric.headcount,
            source: 'pip',
            fetchedAt: docToStore.fetchedAt,
          });
        } catch (e) {
          rows.push({
            country,
            year,
            povline,
            headcount: null,
            source: 'error',
            error: String(e?.message || e),
          });
        }
      }
    }

    await Promise.all(Array.from({length: CONCURRENCY }, () => ServiceWorkerRegistration()));

    res.json({
      success: true,
      source: 'World Bank PIP (cached)',
      year,
      povline,
      maxAgeDays,
      rows,
    });
  } catch (err) {
    console.error('Error in /api/poverty/pip-map:', err);
    res.status(500).json({success: false, message: 'Server error building map dataset'});
  }
});

app.get('/api/poverty', async(req, res) => {
  try{
    const stats = await db.collection('povertyStats').find({}).toArray()
    res.json({
      success: true,
      stats,
    })
  } catch (err) {
    console.error('Error fetching poverty stats:', err)
    res.status(500).json({
      success: false,
      message: 'Error fetching poverty stats',
    })
  }
}) 

// poverty live stats - done by Christella
app.get('/api/poverty/live', async (req, res) => {
  try {
    const country = String(req.query.country || '').toUpperCase().trim();
    const yearRaw = String(req.query.year || '').trim();
    const lineRaw = (req.query.line !== undefined &&  req.query.line !== null) ? String(req.query.line).trim() : '';

    if (!/^[A-Z]{3}$/.test(country)){
      return res.status(400).json({
        success: false,
        message: 'Please enter a 3-letter ISO country code (e.g. USA)'
      });
    }

    let year = null;
    if (yearRaw){
      year = Number.parseInt(yearRaw, 10);
      const currentYear = new Date().getUTCFullYear();
      if (!Number.isFinite(year) || year < 1960 || year > currentYear + 1){
        return res.status(400).json({ success: false, message: 'Invalid year'});
      }
    }

    const povline = lineRaw ? Number.parseFloat(lineRaw) : 2.15;
    if (!Number.isFinite(povline) || povline <= 0 || povline > 100){
      return res.status(400).json({
        success: false,
        message: 'Invalid poverty line'
      });
    }
    
    const cacheCollection = db.collection('povertyLiveStats')
    const cacheKey = year ? { country, year, povline } : { country, povline };

    const cached = await cacheCollection.findOne(cacheKey)

    if (cached) {
      return res.json({
        success: true,
        source: 'MongoDB cache',
        country,
        year: cached.year ?? year,
        povline,
        fetchedAt: cached.fetchedAt,
        metric: cached.metric ?? null,
        meta: cached.meta ?? null,
        data: cached.data,
      })
    }


    const pipRes = await fetch(pipUrl)
    if(!pipRes.ok){
      console.error('PIP API error status: ', pipRes.status)
      return res.status(502).json({
        success: false,
        message: 'Error fetching data from World Bank PIP API'
      })
    }

    const pipData = await pipRes.json()

    const docToStore = {
      ...cacheKey,
      fetchedAt: new Date(),
      data: pipData,
    }

    await cacheCollection.updateOne(cacheKey, { $set: docToStore }, { upsert: true })

    res.json({
      success: true,
      source: 'World Bank PIP (fresh)',
      country,
      year,
      povline: line,
      fetchedAt: docToStore.fetchedAt,
      data: pipData,
    })
    } catch (err) {
      console.error('Error in /api/poverty/live:', err)
      res.status(500).json({
        success: false,
        message: 'Server error fetching live poverty data',
      })
    }
  })

// Profile Update Route
app.put('/api/profile/update', async (req, res) => {
  try {
    const { email, currentPassword, newPassword, newUsername } = req.body;
    
    if (!email || !currentPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and current password are required' 
      });
    }
    
    const usersCollection = db.collection('users');
    
    // Find user by email
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Verify current password using bcrypt
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
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

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
app.delete('/api/profile/delete', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }
    
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
    if (user.password !== password) {
      return res.status(400).json({ 
        success: false,
        message: 'Password is incorrect' 
      });
    }
    
    // Delete user
    await usersCollection.deleteOne({ _id: user._id });
    
    console.log(`Account deleted: ${email}`);
    
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
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
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
      const oldImagePath = path.join(__dirname, user[fieldName]);
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
app.post('/api/remove-image', async (req, res) => {
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
      const imagePath = path.join(__dirname, user[fieldName]);
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
app.get('/api/user-images', async (req, res) => {
  try {
    // Get email from URL parameter
    const { email } = req.query;
    
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

// Create a story
app.post('/api/stories', async(req, res) => {
  try {
    const {title, country, storyText, displayName, displayPhoto, userEmail } = req.body;

    if (!storyText || !storyText.trim()){
      return res.status(400).json({
        success: false,
        message: 'Story text is required',
      });
    }

    const words = storyText.trim().split(/\s+/);
    if (words.length > 7000){
      return res.status(400).json({
        success: false,
        message: 'Story exceeds the 7,000 word limit',
      });
    }
    
    const storiesCollection = db.collection('stories');

    const newStory = {
      title: title || '',
      country: country ? String(country).toUpperCase():null,
      storyText,
      displayName: !!displayName,
      displayPhoto: !!displayPhoto,
      userEmail: userEmail || null,
      createdAt: new Date(),
    };

    const result = await storiesCollection.insertOne(newStory);

    if (userEmail) {
      createNotification(userEmail, `Your story "${title || 'Untitled'}" was published successfully!`);
    }

    res.status(201).json({
      success: true,
      message: 'Story uploaded successfully',
      storyId: result.insertedId,
    });
  } catch (err) {
    console.error('Error creating story:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while saving the story',
    });
  }
});

// List of stories for editing, deleting, or archiving
app.get('/api/stories', async (req, res) => {
  try {
    const { userEmail, includeArchived, country } = req.query;

    const filter = {};
    if (userEmail) {
      filter.userEmail = userEmail;
    }
    if (country) {
      filter.country = String(country).toUpperCase();
    }
    // Hide archived stories by default
    if (!includeArchived || includeArchived === 'false') {
      filter.archived = { $ne: true};
    }

    const stories = await db
      .collection('stories')
      .find(filter)
      .sort({createdAt: -1})
      .limit(50)
      .toArray();
    
    res.json({
      success: true,
      stories,
    });
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching stories.',
    });
  }
});

// Edit route for the stories
app.put('/api/stories/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const {title, storyText, displayName, displayPhoto} = req.body;

    if (!storyText || !storyText.trim()){
      return res.status(400).json({
        success: false,
        message: 'Story text is required',
      });
    }

    const words = storyText.trim().split(/\s+/);
    if (words.length > 7000) {
      return res.status(400).json({
        success: false,
        message: 'Story exceeds 7,000 word limit',
      });
    }

    const storiesCollection = db.collection('stories');

    const result = await storiesCollection.updateOne(
      {_id: new ObjectId(id)},
      {
        $set: {
          title: title || '',
          storyText,
          displayName: !!displayName,
          displayPhoto: !!displayPhoto,
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    res.json({
      success: true,
      message: 'Edits saved successfully!',
    });
  } catch (err) {
    console.error('Error updating story:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating story',
    });
  }
});

// Archive/unarchive
app.patch('/api/stories/:id/archive', async (req, res) => {
  try {
    const {id} = req.params;
    const {archived} = req.body;

    console.log('Archive route called. id=', id, 'archived=', archived);

    const storiesCollection = db.collection('stories');

    const result = await storiesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          archived: !!archived,
          archivedAt: archived ? new Date() : null,
        },
      }
    );
    if (!result.matchedCount){
      return res. status(404).json({
        success: false,
        message: 'Story not found',
      });
    }
    res.json({
      success: true,
      message: archived ? 'Story archive.' : 'Story unarchived.',
    });
  } catch (err) {
    console.error('Error archiving story:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while archiving story',
    });
  }
});

// Deleting stories
app.delete('/api/stories/:id', async (req, res) => {
  try {
    const {id} = req.params;

    const storiesCollection = db.collection('stories');

    const result = await storiesCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (!result.deletedCount) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }
    res.json({
      success: true,
      message: 'Successfully deleted story.',
    });
  } catch(err){
    console.error('Error: could not delete story:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting the story',
    });
  }
});

// Get notifications
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.json({ success: true, notifications: [] });
  }
  
  // Filter for this user's notifications, newest first
  const userNotifications = notifications
    .filter(note => note.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({ 
    success: true, 
    notifications: userNotifications.slice(0, 10) // Return last 10
  });
});

// Mark notification as read
app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  
  const noteIndex = notifications.findIndex(n => n.id === id);
  if (noteIndex !== -1) {
    notifications[noteIndex].read = true;
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: 'Notification not found' });
  }
});

app.listen(port, async () => {
  await connectDB()
  console.log(`Server listening on port ${port}`)
})