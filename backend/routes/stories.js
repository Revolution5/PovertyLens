// File created by Christella - 2/26/2026
// ===== ROUTE =====

const express = require('express');
const router = express.Router();
const { getDb, ObjectId } = require('../database');
const { createNotification } = require('../helpers/notificationshelper');

// Added by Christella - 12/10/2025
// Create a story
router.post('/', async(req, res) => {
  try {
    const {title, country, storyText, displayName, displayPhoto, userEmail } = req.body; // Added 'country' for the statistics page - Christella 12/10/2025

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
    
    const db = getDb();
    const storiesCollection = db.collection('stories');

    const newStory = {
      title: title || '',
      country: country ? String(country).toUpperCase():null, // Ensures that country is uppercased - Christella 12/10/2025
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

// List of stories for editing, deleting, or archiving - added 12/10/2025 by Christella
router.get('/', async (req, res) => {
  try {
    const { userEmail, includeArchived, country } = req.query; // Added "country" to confirm that it is archived as well - Christella - 12/12/2025

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

    const db = getDb();
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
router.put('/:id', async (req, res) => {
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

    const db = getDb();
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
router.patch('/:id/archive', async (req, res) => {
  try {
    const {id} = req.params;
    const {archived} = req.body;

    console.log('Archive route called. id=', id, 'archived=', archived);

    const db = getDb();
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
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }
    res.json({
      success: true,
      message: archived ? 'Story archived.' : 'Story unarchived.',
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
router.delete('/:id', async (req, res) => {
  try {
    const {id} = req.params;

    const db = getDb();
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
// End of addition by Christella - 12/10/25

module.exports = router;