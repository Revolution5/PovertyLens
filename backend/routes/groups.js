const express = require('express');
const { ObjectId } = require('mongodb');
const Group = require('../models/Group');
const GroupProgress = require('../models/GroupProgress');
const { getDb } = require('../database');
const { createNotification } = require('../helpers/notificationshelper');
const { logActivity } = require('./activitylog');

const router = express.Router();

const VALID_GROUP_TYPES = ['classroom', 'nonprofit', 'club', 'corporate'];
const VALID_ASSIGNMENT_TYPES = [
  'pledges',
  'freerice_grains',
  'stories',
  'volunteer_hours',
  'quiz',
  'country_story_reads',
];

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function mapGroup(group) {
  if (!group) return null;
  return {
    id: group._id.toString(),
    name: group.name,
    type: group.type,
    description: group.description || '',
    leaderEmail: group.leaderEmail,
    leaderUsername: group.leaderUsername,
    memberCount: group.memberCount || 0,
    code: group.code,
    inviteLink: `/groups/join/${group.inviteToken}`,
    isPublic: Boolean(group.isPublic),
    assignments: Array.isArray(group.assignments) ? group.assignments : [],
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

async function ensureUserExists(email) {
  const db = getDb();
  return db.collection('users').findOne({ email });
}

router.get('/', async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email);
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    await Group.ensureIndexes();
    await GroupProgress.ensureIndexes();

    const groups = await Group.listByEmail(email);

    res.json({
      success: true,
      groups: groups.map(mapGroup),
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching groups' });
  }
});

router.post('/', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const username = String(req.body.username || '').trim();
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();
    const type = String(req.body.type || '').trim().toLowerCase();
    const isPublic = Boolean(req.body.isPublic);

    if (!email || !name || !type) {
      return res.status(400).json({ success: false, message: 'Email, name, and type are required' });
    }

    if (!VALID_GROUP_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type must be one of: ${VALID_GROUP_TYPES.join(', ')}`,
      });
    }

    const user = await ensureUserExists(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please sign in again.' });
    }

    await Group.ensureIndexes();
    await GroupProgress.ensureIndexes();

    const group = await Group.create({
      name,
      type,
      description,
      leaderEmail: email,
      leaderUsername: username || user.username,
      isPublic,
    });

    await GroupProgress.ensureMemberRow(group._id.toString(), email, username || user.username);

    await createNotification(email, `Your group "${name}" is live. Invite members using code ${group.code}.`);
    await logActivity(email, 'Created group', `Group: ${name}`, req);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group: mapGroup(group),
    });
  } catch (error) {
    console.error('Error creating group:', error);
    if (String(error.message || '').includes('E11000')) {
      return res.status(409).json({ success: false, message: 'Duplicate join code generated. Please retry.' });
    }
    res.status(500).json({ success: false, message: 'Server error while creating group' });
  }
});

router.post('/join', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const username = String(req.body.username || '').trim();
    const code = String(req.body.code || '').toUpperCase().trim();

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const user = await ensureUserExists(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please sign in again.' });
    }

    const group = await Group.findByCode(code);
    if (!group) {
      return res.status(404).json({ success: false, message: 'No group found for that code' });
    }

    const updated = await Group.addMember(group._id.toString(), email);
    await GroupProgress.ensureMemberRow(group._id.toString(), email, username || user.username);

    await createNotification(group.leaderEmail, `${username || user.username || email} joined ${group.name}.`);
    await logActivity(email, 'Joined group', `Group: ${group.name}`, req);

    res.json({
      success: true,
      message: `You joined ${group.name}`,
      group: mapGroup(updated),
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ success: false, message: 'Server error while joining group' });
  }
});

router.get('/:groupId', async (req, res) => {
  try {
    const groupId = String(req.params.groupId || '').trim();
    const email = normalizeEmail(req.query.email);

    if (!ObjectId.isValid(groupId)) {
      return res.status(400).json({ success: false, message: 'Invalid group id' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (email && !group.memberEmails.includes(email)) {
      return res.status(403).json({ success: false, message: 'You are not a member of this group' });
    }

    const progressRows = await GroupProgress.listByGroup(groupId);

    const db = getDb();
    const memberEmails = Array.isArray(group.memberEmails) ? group.memberEmails : [];
    const users = await db
      .collection('users')
      .find(
        { email: { $in: memberEmails } },
        { projection: { email: 1, username: 1 } }
      )
      .toArray();

    const usernameByEmail = new Map(users.map((user) => [user.email, user.username]));
    const members = memberEmails.map((memberEmail) => ({
      email: memberEmail,
      username: usernameByEmail.get(memberEmail) || memberEmail.split('@')[0],
    }));

    res.json({
      success: true,
      group: mapGroup(group),
      members,
      progress: progressRows.map((row) => ({
        id: row._id.toString(),
        userEmail: row.userEmail,
        username: row.username,
        pledgesCompleted: row.pledgesCompleted || 0,
        grainsEarned: row.grainsEarned || 0,
        storiesPosted: row.storiesPosted || 0,
        volunteerHours: row.volunteerHours || 0,
        quizzesPassed: row.quizzesPassed || 0,
        updatedAt: row.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching group details' });
  }
});

router.post('/:groupId/assignments', async (req, res) => {
  try {
    const groupId = String(req.params.groupId || '').trim();
    const email = normalizeEmail(req.body.email);
    const title = String(req.body.title || '').trim();
    const assignmentType = String(req.body.assignmentType || '').trim().toLowerCase();
    const description = String(req.body.description || '').trim();
    const target = Number(req.body.target);
    const dueDateRaw = req.body.dueDate;

    if (!ObjectId.isValid(groupId)) {
      return res.status(400).json({ success: false, message: 'Invalid group id' });
    }

    if (!email || !title || !assignmentType || !Number.isFinite(target)) {
      return res.status(400).json({
        success: false,
        message: 'email, title, assignmentType, and numeric target are required',
      });
    }

    if (!VALID_ASSIGNMENT_TYPES.includes(assignmentType)) {
      return res.status(400).json({
        success: false,
        message: `assignmentType must be one of: ${VALID_ASSIGNMENT_TYPES.join(', ')}`,
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.leaderEmail !== email) {
      return res.status(403).json({ success: false, message: 'Only the group leader can create assignments' });
    }

    const dueDate = dueDateRaw ? new Date(dueDateRaw) : null;
    if (dueDateRaw && Number.isNaN(dueDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid dueDate' });
    }

    const assignment = {
      id: new ObjectId().toString(),
      title,
      assignmentType,
      description,
      target,
      dueDate,
      createdBy: email,
      completed: false,
      completedAt: null,
      completedBy: null,
      createdAt: new Date(),
    };

    const updated = await Group.addAssignment(groupId, assignment);

    const membersToNotify = (updated.memberEmails || []).filter((m) => m !== email);
    await Promise.all(
      membersToNotify.map((memberEmail) =>
        createNotification(memberEmail, `New group assignment in ${updated.name}: ${title}`)
      )
    );

    await logActivity(email, 'Created group assignment', `${updated.name}: ${title}`, req);

    res.status(201).json({
      success: true,
      message: 'Assignment created',
      assignment,
      group: mapGroup(updated),
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ success: false, message: 'Server error while creating assignment' });
  }
});

router.patch('/:groupId/assignments/:assignmentId/assign', async (req, res) => {
  try {
    const groupId = String(req.params.groupId || '').trim();
    const assignmentId = String(req.params.assignmentId || '').trim();
    const leaderEmail = normalizeEmail(req.body.email);
    const memberEmail = normalizeEmail(req.body.memberEmail);

    if (!ObjectId.isValid(groupId)) {
      return res.status(400).json({ success: false, message: 'Invalid group id' });
    }

    if (!leaderEmail || !memberEmail || !assignmentId) {
      return res.status(400).json({ success: false, message: 'email, memberEmail, and assignmentId are required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.leaderEmail !== leaderEmail) {
      return res.status(403).json({ success: false, message: 'Only the group leader can assign assignments' });
    }

    if (!group.memberEmails.includes(memberEmail)) {
      return res.status(400).json({ success: false, message: 'Target user is not a member of this group' });
    }

    const updated = await Group.assignToMember(groupId, assignmentId, memberEmail);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Assignment not found in this group' });
    }

    await createNotification(
      memberEmail,
      `You have been assigned an assignment in "${group.name}" by the group leader.`
    );

    await logActivity(leaderEmail, 'Assigned group assignment', `Group: ${group.name}, assignee: ${memberEmail}`, req);

    res.json({
      success: true,
      message: 'Assignment assigned successfully',
      group: mapGroup(updated),
    });
  } catch (error) {
    console.error('Error assigning group assignment:', error);
    res.status(500).json({ success: false, message: 'Server error while assigning assignment' });
  }
});

router.delete('/:groupId/assignments/:assignmentId', async (req, res) => {
  try {
    const groupId = String(req.params.groupId || '').trim();
    const assignmentId = String(req.params.assignmentId || '').trim();
    const email = normalizeEmail(req.query.email);

    if (!ObjectId.isValid(groupId)) {
      return res.status(400).json({ success: false, message: 'Invalid group id' });
    }

    if (!email || !assignmentId) {
      return res.status(400).json({ success: false, message: 'email and assignmentId are required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.leaderEmail !== email) {
      return res.status(403).json({ success: false, message: 'Only the group leader can delete assignments' });
    }

    const deletedAssignment = (group.assignments || []).find((a) => a.id === assignmentId);
    if (!deletedAssignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const updated = await Group.removeAssignment(groupId, assignmentId);

    if (deletedAssignment.assignedTo) {
      await createNotification(
        deletedAssignment.assignedTo,
        `An assignment ("${deletedAssignment.title}") in "${group.name}" was deleted by the group leader.`
      );
    }

    await logActivity(email, 'Deleted group assignment', `${group.name}: ${deletedAssignment.title}`, req);

    res.json({
      success: true,
      message: 'Assignment deleted',
      group: mapGroup(updated),
    });
  } catch (error) {
    console.error('Error deleting group assignment:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting assignment' });
  }
});

router.patch('/:groupId/progress', async (req, res) => {
  try {
    const groupId = String(req.params.groupId || '').trim();
    const email = normalizeEmail(req.body.email);
    const username = String(req.body.username || '').trim();

    if (!ObjectId.isValid(groupId)) {
      return res.status(400).json({ success: false, message: 'Invalid group id' });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.memberEmails.includes(email)) {
      return res.status(403).json({ success: false, message: 'You are not a member of this group' });
    }

    const updatedRow = await GroupProgress.updateMetrics(groupId, email, username, req.body);

    res.json({
      success: true,
      message: 'Progress updated',
      progress: {
        id: updatedRow._id.toString(),
        userEmail: updatedRow.userEmail,
        username: updatedRow.username,
        pledgesCompleted: updatedRow.pledgesCompleted || 0,
        grainsEarned: updatedRow.grainsEarned || 0,
        storiesPosted: updatedRow.storiesPosted || 0,
        volunteerHours: updatedRow.volunteerHours || 0,
        quizzesPassed: updatedRow.quizzesPassed || 0,
        updatedAt: updatedRow.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating group progress:', error);
    res.status(500).json({ success: false, message: 'Server error while updating group progress' });
  }
});

router.delete('/:groupId', async (req, res) => {
  try {
    const groupId = String(req.params.groupId || '').trim();
    const email = normalizeEmail(req.query.email);

    if (!ObjectId.isValid(groupId)) {
      return res.status(400).json({ success: false, message: 'Invalid group id' });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.leaderEmail !== email) {
      return res.status(403).json({ success: false, message: 'Only the group leader can delete the group' });
    }

    await Group.deleteGroup(groupId);
    await GroupProgress.deleteByGroup(groupId);

    const membersToNotify = (group.memberEmails || []).filter((m) => m !== email);
    await Promise.all(
      membersToNotify.map((memberEmail) =>
        createNotification(memberEmail, `The group "${group.name}" has been deleted by the leader.`)
      )
    );

    await logActivity(email, 'Deleted group', `Group: ${group.name}`, req);

    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting group' });
  }
});

module.exports = router;
