require('dotenv').config()
const cors = require('cors')
const express = require('express')
const { MongoClient } = require('mongodb')

const app = express()
const port = 4000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const uri = process.env.CONNECTION_URI
const client = new MongoClient(uri)

let db

async function connectDB() {
  await client.connect()
  db = client.db('povertylensapp')
  console.log('Connected to MongoDB')
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

// 12.15.2025 12:46pm

// Sign up
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }
    
    // Check if user already exists
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already exists' 
      });
    }
    
    // Create new user
    const newUser = {
      email,
      password, // Storing plain text (temporary!)
      createdAt: new Date()
    };
    
    const result = await usersCollection.insertOne(newUser);
    
    console.log(`New user created: ${email}`);
    
    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      user: { 
        email: newUser.email, 
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


app.listen(port, async () => {
  await connectDB()
  console.log(`Server listening on port ${port}`)
})