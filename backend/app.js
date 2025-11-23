require('dotenv').config()
const cors = require('cors')
const express = require('express')
const { MongoClient } = require('mongodb')

const app = express()
const port = 4000

app.use(cors())
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

app.listen(port, async () => {
  await connectDB()
  console.log(`Server listening on port ${port}`)
})