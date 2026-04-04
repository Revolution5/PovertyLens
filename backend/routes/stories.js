// File created by Christella - 2/26/2026
// ===== ROUTE =====

const express = require('express');
const router = express.Router();
const { getDb, ObjectId } = require('../database');
const { createNotification } = require('../helpers/notificationshelper');
const { logActivity } = require('./activitylog'); // Added by Marisol - 03/05/2026

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
      await logActivity(userEmail, 'Posted story', title || 'Untitled story', req); // Added by Marisol - 03/05/2026
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

// Added by Damon - 04/03/2026
// Report a story with a required reason
router.post('/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, reportedBy } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story id',
      });
    }

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required',
      });
    }

    const db = getDb();
    const storiesCollection = db.collection('stories');

    const reportId = new ObjectId();
    const report = {
      _id: reportId,
      reason: String(reason).trim(),
      reportedBy: reportedBy ? String(reportedBy) : null,
      status: 'open',
      createdAt: new Date(),
    };

    const result = await storiesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { reports: report },
        $set: { updatedAt: new Date() },
      }
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Story report submitted',
      reportId,
    });
  } catch (err) {
    console.error('Error reporting story:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while reporting story',
    });
  }
});

// Added by Copilot - 04/03/2026
// List stories that have reports for admin review
router.get('/reported', async (req, res) => {
  try {
    const status = (req.query.status || 'open').toString().toLowerCase();
    const db = getDb();

    const filter =
      status === 'all'
        ? { reports: { $exists: true, $ne: [] } }
        : { reports: { $elemMatch: { status } } };

    const stories = await db
      .collection('stories')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const normalizedStories = stories.map((story) => {
      const reports = Array.isArray(story.reports) ? story.reports : [];
      const filteredReports =
        status === 'all' ? reports : reports.filter((r) => r?.status === status);

      return {
        ...story,
        reports: filteredReports,
      };
    });

    res.json({
      success: true,
      stories: normalizedStories,
    });
  } catch (err) {
    console.error('Error fetching reported stories:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching reported stories.',
    });
  }
});

// Added by Copilot - 04/03/2026
// Ignore a specific report while keeping the story
router.patch('/:id/report/:reportId/ignore', async (req, res) => {
  try {
    const { id, reportId } = req.params;
    const { reviewedBy } = req.body || {};

    if (!ObjectId.isValid(id) || !ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid id',
      });
    }

    const db = getDb();
    const storiesCollection = db.collection('stories');

    const result = await storiesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          'reports.$[target].status': 'ignored',
          'reports.$[target].ignoredAt': new Date(),
          'reports.$[target].reviewedBy': reviewedBy ? String(reviewedBy) : null,
          updatedAt: new Date(),
        },
      },
      {
        arrayFilters: [{ 'target._id': new ObjectId(reportId), 'target.status': 'open' }],
      }
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    if (!result.modifiedCount) {
      return res.status(404).json({
        success: false,
        message: 'Open report not found',
      });
    }

    res.json({
      success: true,
      message: 'Report ignored',
    });
  } catch (err) {
    console.error('Error ignoring report:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while ignoring report',
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

    // Added by Marisol - 03/05/2026
    const { userEmail: editEmail } = req.body;
    if (editEmail) await logActivity(editEmail, 'Edited story', title || 'Untitled story', req);
    // End of addition by Marisol - 03/05/2026

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
    // Added by Marisol - 03/05/2026
    const { userEmail: archiveEmail } = req.body;
    if (archiveEmail) await logActivity(archiveEmail, archived ? 'Archived story' : 'Unarchived story', '', req);
    // End of addition by Marisol - 03/05/2026

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
    const { userEmail: deleteEmail } = req.body || {}; // Added by Marisol - 03/05/2026

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

    // Added by Marisol - 03/05/2026
    if (deleteEmail) await logActivity(deleteEmail, 'Deleted story', '', req);
    // End of addition by Marisol - 03/05/2026

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