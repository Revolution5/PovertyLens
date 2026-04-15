// Created by Christella - 04/14/2026
// ===== ROUTE =====

const express = require('express');
const router = express.Router();
const { getDb, ObjectId } = require('../database');
const { createInboxMessage } = require('../helpers/inboxHelper');

const VALID_TYPES = ['Awareness Day', 'Volunteering', 'Fundraiser', 'Conference', 'Campaign'];

// Seeded well-known annual awareness events
const SEED_EVENTS = [
  {
    title: 'World Food Day',
    description: 'An international day celebrated every year worldwide to commemorate the founding of the FAO and raise awareness of global hunger.',
    date: new Date(new Date().getFullYear(), 9, 16), // Oct 16
    type: 'Awareness Day',
    location: 'Global',
    sourceUrl: 'https://www.fao.org/world-food-day',
    sourceLabel: 'FAO',
    verified: true,
    status: 'approved',
    createdAt: new Date(),
  },
  {
    title: 'International Day for the Eradication of Poverty',
    description: 'Observed annually to promote awareness of the need to eradicate poverty and destitution in all countries.',
    date: new Date(new Date().getFullYear(), 9, 17), // Oct 17
    type: 'Awareness Day',
    location: 'Global',
    sourceUrl: 'https://www.un.org/en/observances/day-for-eradicating-poverty',
    sourceLabel: 'United Nations',
    verified: true,
    status: 'approved',
    createdAt: new Date(),
  },
  {
    title: 'World Hunger Day',
    description: 'A global initiative to highlight sustainable solutions to hunger and malnutrition affecting millions worldwide.',
    date: new Date(new Date().getFullYear(), 4, 28), // May 28
    type: 'Awareness Day',
    location: 'Global',
    sourceUrl: 'https://www.thehungerproject.org/world-hunger-day/',
    sourceLabel: 'The Hunger Project',
    verified: true,
    status: 'approved',
    createdAt: new Date(),
  },
  {
    title: 'Global Citizen Festival',
    description: 'An annual music festival and advocacy platform where citizens take action to end extreme poverty.',
    date: new Date(new Date().getFullYear(), 8, 27), // Sep 27
    type: 'Campaign',
    location: 'New York, USA',
    sourceUrl: 'https://www.globalcitizen.org/en/festival/',
    sourceLabel: 'Global Citizen',
    verified: true,
    status: 'approved',
    createdAt: new Date(),
  },
  {
    title: 'World Humanitarian Day',
    description: 'Recognizes humanitarian workers and those who lost their lives working for humanitarian causes.',
    date: new Date(new Date().getFullYear(), 7, 19), // Aug 19
    type: 'Awareness Day',
    location: 'Global',
    sourceUrl: 'https://www.un.org/en/observances/humanitarian-day',
    sourceLabel: 'United Nations',
    verified: true,
    status: 'approved',
    createdAt: new Date(),
  },
  {
    title: 'Giving Tuesday',
    description: 'A global generosity movement unleashing the power of people and organizations to transform their communities.',
    date: new Date(new Date().getFullYear(), 11, 2), // Dec 2
    type: 'Fundraiser',
    location: 'Global',
    sourceUrl: 'https://www.givingtuesday.org',
    sourceLabel: 'GivingTuesday',
    verified: true,
    status: 'approved',
    createdAt: new Date(),
  },
  {
    title: 'International Volunteer Day',
    description: 'An opportunity for volunteer organizations and individual volunteers to celebrate their efforts.',
    date: new Date(new Date().getFullYear(), 11, 5), // Dec 5
    type: 'Volunteering',
    location: 'Global',
    sourceUrl: 'https://www.un.org/en/observances/volunteer-day',
    sourceLabel: 'United Nations',
    verified: true,
    status: 'approved',
    createdAt: new Date(),
  },
  {
    title: 'World Refugee Day',
    description: 'An international day designated by the UN to honour refugees around the globe.',
    date: new Date(new Date().getFullYear(), 5, 20), // Jun 20
    type: 'Awareness Day',
    location: 'Global',
    sourceUrl: 'https://www.unhcr.org/world-refugee-day.html',
    sourceLabel: 'UNHCR',
    verified: true,
    status: 'approved',
    createdAt: new Date(),
  },
];

// GET /api/events - get all approved events, sorted by date
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    let events = await db
      .collection('events')
      .find({ status: 'approved' })
      .sort({ date: 1 })
      .toArray();

    // Seed on first load if collection is empty
    if (events.length === 0) {
      await db.collection('events').insertMany(SEED_EVENTS);
      events = await db.collection('events').find({ status: 'approved' }).sort({ date: 1 }).toArray();
    }

    res.json({ success: true, events });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ success: false, message: 'Error fetching events.' });
  }
});

// GET /api/events/pending - get all pending events (admin use)
router.get('/pending', async (req, res) => {
  try {
    const db = getDb();
    const events = await db
      .collection('events')
      .find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, events });
  } catch (err) {
    console.error('Error fetching pending events:', err);
    res.status(500).json({ success: false, message: 'Error fetching pending events.' });
  }
});

// POST /api/events - submit a new event for approval
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      type,
      location,
      sourceUrl,
      sourceLabel,
      submittedBy,
      submittedEmail
    } = req.body;

    if (!title || !description || !date || !type || !sourceUrl || !submittedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, date, type, source URL, and email are required.',
      });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid event type.' });
    }

    const db = getDb();
    const [year, month, day] = (date || '').split('-').map(Number);
    const newEvent = {
      title: title.trim(),
      description: description.trim(),
      date: new Date(year, month - 1, day),
      type,
      location: location ? location.trim() : 'Global',
      sourceUrl: sourceUrl.trim(),
      sourceLabel: sourceLabel ? sourceLabel.trim() : 'Source',
      submittedBy: submittedBy ? submittedBy.trim() : 'Anonymous',
      submittedEmail: submittedEmail.trim().toLowerCase(),
      verified: false,
      status: 'pending',
      createdAt: new Date(),
    };

    const result = await db.collection('events').insertOne(newEvent);

    console.log('Creating event_under_review message for:', newEvent.submittedEmail);
    await createInboxMessage({
      email: newEvent.submittedEmail,
      subject: 'Your event submission is being reviewed',
      body: `Hi ${newEvent.submittedBy || 'there'}, your event "${newEvent.title}" has been received and is now under review. We will notify you once it has been approved or denied.`,
      type: 'event_under_review',
    });

    res.status(201).json({
      success: true,
      message: 'Event submitted for review. Thank you!',
      eventId: result.insertedId,
    });
  } catch (err) {
    console.error('Error submitting event:', err);
    res.status(500).json({ success: false, message: 'Server error while submitting event.' });
  }
});

// GET /api/events/approved
router.get('/approved', async (req, res) => {
  try {
    const db = getDb();
    const events = await db
      .collection('events')
      .find({ status: 'approved' })
      .sort({ approvedAt: -1, createdAt: -1 })
      .toArray();

    res.json({ success: true, events });
  } catch (err) {
    console.error('Error fetching approved events:', err);
    res.status(500).json({ success: false, message: 'Error fetching approved events.' });
  }
});

// GET /api/events/rejected
router.get('/rejected', async (req, res) => {
  try {
    const db = getDb();
    const events = await db
      .collection('events')
      .find({ status: 'rejected' })
      .sort({ rejectedAt: -1, createdAt: -1 })
      .toArray();

    res.json({ success: true, events });
  } catch (err) {
    console.error('Error fetching rejected events:', err);
    res.status(500).json({ success: false, message: 'Error fetching rejected events.' });
  }
});

// PATCH /api/events/:id/approve
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const event = await db.collection('events').findOne({ _id: new ObjectId(id) });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await db.collection('events').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'approved',
          verified: true,
          approvedAt: new Date(),
        },
      }
    );

    await createInboxMessage({
      email: event.submittedEmail,
      subject: 'Your event was approved',
      body: `Your event "${event.title}" has been approved. Please allow about an hour for your event to show up.`,
      type: 'event_approved',
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// PATCH /api/events/:id/reject
router.patch('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = getDb();

    const event = await db.collection('events').findOne({ _id: new ObjectId(id) });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await db.collection('events').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'rejected',
          rejectionReason: reason || '',
          rejectedAt: new Date(),
        },
      }
    );

    await createInboxMessage({
      email: event.submittedEmail,
      subject: 'Your event was not approved',
      body: `Your event "${event.title}" was not approved.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'event_denied',
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});
module.exports = router;