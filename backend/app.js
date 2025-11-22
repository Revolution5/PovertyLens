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

app.listen(port, async () => {
  await connectDB()
  console.log(`Server listening on port ${port}`)
})