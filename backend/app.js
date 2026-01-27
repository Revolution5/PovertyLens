require('dotenv').config()
const cors = require('cors')
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')

const app = express()
const port = 4000

const fetch = require('node-fetch')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

    // Create new user (note: passwords are still stored plaintext here)
    const newUser = {
      email,
      username,
      password,
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

    console.log(`New user created: ${email} (${username})`);

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
    
    // Check password (plain text comparison for now)
    if (user.password !== password) {
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
    
    // Verify current password
    if (user.password !== currentPassword) {
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
      updateData.password = newPassword;
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


// Setting up code for button counter
app.get('/api/counter', async (req, res) => {
  try {
    let counter = await db.collection('counters').findOne({ name: 'button-clicks' })
    res.json({ count: counter.count })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/api/counter/increment', async (req, res) => {
  try {
    const result = await db.collection('counters').findOneAndUpdate(
      { name: 'button-clicks' },              // Find this document
      { $inc: { count: 1 } },                 // Add 1 to count
      { upsert: true, returnDocument: 'after' } // Return the new value
    )
    
    console.log(`Total clicks: ${result.count}`) // Log to server console
    res.json({ count: result.count })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.listen(port, async () => {
  await connectDB()
  console.log(`Server listening on port ${port}`)
})