// Created by Christella - 03/17/2026
// Glossary API routes — terms, search/filter, and per-user data (bookmarks, learned, notes)

const express = require('express');
const router  = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.CONNECTION_URI;
const DB_NAME   = 'povertylensapp';

async function getDb() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  return { db: client.db(DB_NAME), client };
}

// GET /api/glossary
// Returns all terms. Supports ?letter=A and ?search=poverty query params.
router.get('/', async (req, res) => {
  const { letter, search } = req.query;
  let query = {};

  if (letter && letter !== 'all') {
    query.letter = letter.toString().toUpperCase();
  }
  if (search) {
    query.$or = [
      { term:       { $regex: search, $options: 'i' } },
      { definition: { $regex: search, $options: 'i' } },
    ];
  }

  const { db, client } = await getDb();
  try {
    const terms = await db
      .collection('glossary')
      .find(query)
      .sort({ term: 1 })
      .toArray();
    res.json({ success: true, terms });
  } catch (err) {
    console.error('Error fetching glossary:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    await client.close();
  }
});

// GET /api/glossary/:id
// Returns a single term by ID.
router.get('/:id', async (req, res) => {
  const { db, client } = await getDb();
  try {
    const term = await db
      .collection('glossary')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!term) return res.status(404).json({ success: false, message: 'Term not found' });
    res.json({ success: true, term });
  } catch (err) {
    console.error('Error fetching term:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    await client.close();
  }
});

// PATCH /api/glossary/:id/userdata
// Upserts bookmark, learned status, and/or note for a user-term pair.
// Body: { userEmail, bookmarked?, learned?, note? }
router.patch('/:id/userdata', async (req, res) => {
  const { userEmail, bookmarked, learned, note } = req.body;
  if (!userEmail) {
    return res.status(400).json({ success: false, message: 'userEmail is required' });
  }

  const { db, client } = await getDb();
  try {
    const update = {};
    if (bookmarked !== undefined) update.bookmarked = bookmarked;
    if (learned    !== undefined) update.learned    = learned;
    if (note       !== undefined) update.note       = note;

    await db.collection('glossaryUserData').updateOne(
      { userEmail, termId: req.params.id },
      { $set: { ...update, userEmail, termId: req.params.id } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving user glossary data:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    await client.close();
  }
});

// GET /api/glossary/userdata/:userEmail
// Returns all saved user data (bookmarks, learned, notes) for a given user.
router.get('/userdata/:userEmail', async (req, res) => {
  const { db, client } = await getDb();
  try {
    const data = await db
      .collection('glossaryUserData')
      .find({ userEmail: req.params.userEmail })
      .toArray();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching user glossary data:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    await client.close();
  }
});

module.exports = router;
// End of creation by Christella - 03/17/2026