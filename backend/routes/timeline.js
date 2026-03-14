// Created by Christella - 03/13/2026
// ===== ROUTE =====

const express = require('express');
const router = express.Router();
const { getDb, ObjectId } = require('../database');

const VALID_CATEGORIES = [
  'Famine',
  'Policy & Law',
  'Breakthrough',
  'Natural Disaster',
  'War & Conflict',
  'Aid & Relief',
  'Economic Crisis',
];

// Seed data - pre-populated historical events
const SEED_EVENTS = [
  {
    year: 2020,
    title: 'COVID-19 Pushes 120 Million into Extreme Poverty',
    description: 'The COVID-19 pandemic reversed decades of poverty reduction progress, pushing an estimated 120 million people into extreme poverty in a single year — the first increase in global poverty since 1998.',
    category: 'Economic Crisis',
    source: 'https://www.worldbank.org/en/news/press-release/2020/10/07/covid-19-to-add-as-many-as-150-million-extreme-poor-by-2021',
    sourceLabel: 'World Bank',
    createdAt: new Date(),
  },
  {
    year: 2015,
    title: 'UN Adopts Sustainable Development Goals',
    description: 'The United Nations adopted the 2030 Agenda for Sustainable Development, including SDG 1: End poverty in all its forms everywhere. 193 countries committed to eradicating extreme poverty by 2030.',
    category: 'Policy & Law',
    source: 'https://sdgs.un.org/goals/goal1',
    sourceLabel: 'United Nations',
    createdAt: new Date(),
  },
  {
    year: 2011,
    title: 'East Africa Famine Declared',
    description: 'The UN declared famine in parts of Somalia — the first formal famine declaration in nearly 30 years. Over 13 million people across the Horn of Africa faced severe food insecurity, with hundreds of thousands dying.',
    category: 'Famine',
    source: 'https://www.un.org/en/chronicle/article/famine-horn-africa',
    sourceLabel: 'UN Chronicle',
    createdAt: new Date(),
  },
  {
    year: 2010,
    title: 'Haiti Earthquake Devastates Poorest Nation in Western Hemisphere',
    description: 'A 7.0 magnitude earthquake struck Haiti, killing over 230,000 people and displacing 1.5 million. The disaster worsened an already dire poverty crisis in a country where 80% lived below the poverty line.',
    category: 'Natural Disaster',
    source: 'https://www.worldvision.org/disaster-relief-news-stories/2010-haiti-earthquake-facts',
    sourceLabel: 'World Vision',
    createdAt: new Date(),
  },
  {
    year: 2008,
    title: 'Global Financial Crisis Spikes Food Prices',
    description: 'The 2008 global financial crisis caused food prices to spike by over 80%, triggering food riots in over 30 countries and pushing an additional 100 million people into hunger.',
    category: 'Economic Crisis',
    source: 'https://www.ifad.org/en/web/latest/blog/asset/41880770',
    sourceLabel: 'IFAD',
    createdAt: new Date(),
  },
  {
    year: 2005,
    title: 'Make Poverty History Campaign',
    description: "The Make Poverty History campaign, coordinated with the G8 Gleneagles Summit, pressured world leaders to cancel $40 billion in debt owed by the world's poorest nations and increase aid commitments.",
    category: 'Aid & Relief',
    source: 'https://www.one.org/us/about/history/',
    sourceLabel: 'ONE.org',
    createdAt: new Date(),
  },
  {
    year: 2000,
    title: 'UN Millennium Development Goals Adopted',
    description: 'World leaders at the UN Millennium Summit adopted 8 Millennium Development Goals, including halving extreme poverty by 2015. By the deadline, extreme poverty rates had been cut in half.',
    category: 'Policy & Law',
    source: 'https://www.un.org/millenniumgoals/',
    sourceLabel: 'United Nations',
    createdAt: new Date(),
  },
  {
    year: 1998,
    title: 'Bangladesh Floods Leave 30 Million Homeless',
    description: 'Two-thirds of Bangladesh was submerged in devastating floods for over two months, leaving 30 million homeless and destroying crops, deepening poverty for millions.',
    category: 'Natural Disaster',
    source: 'https://reliefweb.int/report/bangladesh/bangladesh-floods-1998',
    sourceLabel: 'ReliefWeb',
    createdAt: new Date(),
  },
  {
    year: 1994,
    title: 'Rwanda Genocide Creates Poverty Crisis',
    description: 'The Rwandan genocide killed an estimated 800,000 people in 100 days and displaced millions more, collapsing the economy and leaving the majority of survivors in extreme poverty.',
    category: 'War & Conflict',
    source: 'https://www.un.org/en/preventgenocide/rwanda/',
    sourceLabel: 'United Nations',
    createdAt: new Date(),
  },
  {
    year: 1984,
    title: 'Ethiopian Famine Shocks the World',
    description: 'A severe famine in Ethiopia killed over one million people. Iconic media coverage and the Band Aid/Live Aid concerts raised global awareness and over $100 million for relief efforts.',
    category: 'Famine',
    source: 'https://www.bbc.co.uk/news/world-africa-26854406',
    sourceLabel: 'BBC News',
    createdAt: new Date(),
  },
  {
    year: 1974,
    title: 'First World Food Conference',
    description: 'The United Nations convened the first World Food Conference in Rome, declaring that every person has the right to be free from hunger. This led to the creation of the World Food Council.',
    category: 'Breakthrough',
    source: 'https://www.fao.org/3/p4228e/p4228e03.htm',
    sourceLabel: 'FAO',
    createdAt: new Date(),
  },
  {
    year: 1948,
    title: 'Universal Declaration of Human Rights',
    description: 'The UN adopted the Universal Declaration of Human Rights, enshrining the right to an adequate standard of living including food, clothing, and housing — laying the legal groundwork for global poverty reduction.',
    category: 'Policy & Law',
    source: 'https://www.un.org/en/about-us/universal-declaration-of-human-rights',
    sourceLabel: 'United Nations',
    createdAt: new Date(),
  },
];

// GET /api/timeline - get all events, newest first
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { category } = req.query;

    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    let events = await db
      .collection('timeline')
      .find(filter)
      .sort({ year: -1 })
      .toArray();

    // If collection is empty, seed it
    if (events.length === 0 && !category) {
      await db.collection('timeline').insertMany(SEED_EVENTS);
      events = await db.collection('timeline').find({}).sort({ year: -1 }).toArray();
    }

    res.json({ success: true, events });
  } catch (err) {
    console.error('Error fetching timeline:', err);
    res.status(500).json({ success: false, message: 'Error fetching timeline.' });
  }
});

// POST /api/timeline - add a new event
router.post('/', async (req, res) => {
  try {
    const { year, title, description, category, source, sourceLabel } = req.body;

    if (!year || !title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Year, title, description and category are required.' });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const db = getDb();
    const newEvent = {
      year: parseInt(year),
      title,
      description,
      category,
      source: source || null,
      sourceLabel: sourceLabel || 'Source',
      createdAt: new Date(),
    };

    const result = await db.collection('timeline').insertOne(newEvent);
    res.status(201).json({ success: true, event: { ...newEvent, _id: result.insertedId } });
  } catch (err) {
    console.error('Error creating timeline event:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/timeline/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const result = await db.collection('timeline').deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    console.error('Error deleting timeline event:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;