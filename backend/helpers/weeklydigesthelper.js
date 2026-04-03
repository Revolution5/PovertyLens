// ===== HELPER =====
// Weekly Email Digest - Created by Damon

const { getDb } = require('../database');
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');

// Build a signed JWT used as a one-click unsubscribe token in emails
function buildUnsubscribeToken(email) {
  const secret = process.env.JWT_SECRET || 'pl-digest-secret';
  return jwt.sign({ email, purpose: 'unsubscribe' }, secret, { expiresIn: '30d' });
}

// Pull this week's fact, a random story, and return them
async function buildDigestContent() {
  const db = getDb();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Top fact: most recent from the past 7 days, falling back to any fact
  const dfCol = db.collection('dailyFacts');
  let fact = await dfCol.findOne(
    { createdAt: { $gte: oneWeekAgo } },
    { sort: { createdAt: -1 } }
  );
  if (!fact) {
    fact = await dfCol.findOne({}, { sort: { createdAt: -1 } });
  }

  // Random published story
  const storyCount = await db.collection('stories').countDocuments({ storyText: { $exists: true } });
  let story = null;
  if (storyCount > 0) {
    const skip = Math.floor(Math.random() * storyCount);
    story = await db
      .collection('stories')
      .findOne({ storyText: { $exists: true } }, { skip });
  }

  return { fact, story };
}

// Main entry point — queries opted-in users and sends each a digest email
async function sendWeeklyDigest() {
  const db = getDb();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const users = await db
    .collection('users')
    .find({ weeklyDigestOptIn: true }, { projection: { email: 1 } })
    .toArray();

  if (!users.length) {
    console.log('[WeeklyDigest] No opted-in users found.');
    return { sent: 0, errors: 0 };
  }

  const { fact, story } = await buildDigestContent();

  let sent = 0;
  let errors = 0;

  for (const user of users) {
    try {
      // Fetch up to 3 of this user's incomplete pledges
      const pledges = await db
        .collection('pledges')
        .find({ userEmail: user.email, completed: false })
        .limit(3)
        .toArray();

      const token = buildUnsubscribeToken(user.email);
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const unsubscribeUrl = `${backendUrl}/api/digest/unsubscribe?token=${token}`;

      const html = buildEmailHtml({ fact, story, pledges, unsubscribeUrl, frontendUrl });

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'PovertyLens <onboarding@resend.dev>',
        to: user.email,
        subject: 'Your PovertyLens Weekly Digest',
        html,
      });

      sent++;
    } catch (err) {
      console.error(`[WeeklyDigest] Error sending to ${user.email}:`, err.message);
      errors++;
    }
  }

  console.log(`[WeeklyDigest] Complete — Sent: ${sent}, Errors: ${errors}`);
  return { sent, errors };
}

function buildEmailHtml({ fact, story, pledges, unsubscribeUrl, frontendUrl }) {
  const factHtml = fact
    ? `<h2 style="color:#1a1a1a;font-size:18px;margin:0 0 10px;">Fact of the Week</h2>
       ${fact.title ? `<p style="font-weight:bold;color:#333;margin:0 0 6px;">${escapeHtml(fact.title)}</p>` : ''}
       <p style="color:#444;line-height:1.7;margin:0;">${escapeHtml(fact.text)}</p>`
    : '';

  const storyExcerpt = story
    ? escapeHtml((story.storyText || '').slice(0, 300)) +
      (story.storyText && story.storyText.length > 300 ? '...' : '')
    : '';

  const storyHtml = story
    ? `<h2 style="color:#1a1a1a;font-size:18px;margin:0 0 10px;">Story Spotlight</h2>
       ${story.title ? `<p style="font-weight:bold;color:#333;margin:0 0 8px;">${escapeHtml(story.title)}</p>` : ''}
       <p style="color:#444;line-height:1.7;margin:0 0 12px;">${storyExcerpt}</p>
       <a href="${frontendUrl}/viewstories" style="color:#1a73e8;text-decoration:none;font-weight:bold;">Read more stories →</a>`
    : '';

  const pledgesHtml =
    pledges.length > 0
      ? `<h2 style="color:#1a1a1a;font-size:18px;margin:0 0 10px;">Your Pending Pledges</h2>
         <ul style="margin:0;padding-left:20px;color:#444;line-height:1.9;">
           ${pledges.map((p) => `<li>${escapeHtml(p.pledgeText)}</li>`).join('')}
         </ul>
         <p style="margin:12px 0 0;">
           <a href="${frontendUrl}/pledgewalluser" style="color:#1a73e8;text-decoration:none;font-weight:bold;">View all your pledges →</a>
         </p>`
      : '';

  const sections = [
    factHtml
      ? `<div style="margin-bottom:24px;padding:24px;background:#f0fbff;border-radius:8px;border-left:4px solid #8CE4FF;">${factHtml}</div>`
      : '',
    storyHtml
      ? `<div style="margin-bottom:24px;padding:24px;background:#fff9f0;border-radius:8px;border-left:4px solid #FFA239;">${storyHtml}</div>`
      : '',
    pledgesHtml
      ? `<div style="margin-bottom:24px;padding:24px;background:#f0fff4;border-radius:8px;border-left:4px solid #4ade80;">${pledgesHtml}</div>`
      : '',
  ]
    .filter(Boolean)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>PovertyLens Weekly Digest</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#8CE4FF 0%,#FFA239 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#1a1a1a;font-size:30px;font-weight:bold;letter-spacing:-0.5px;">PovertyLens</h1>
              <p style="margin:8px 0 0;color:#1a1a1a;opacity:0.75;font-size:14px;">Your Weekly Digest</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${sections || '<p style="color:#666;">Nothing new this week — check back soon!</p>'}
              <!-- CTA -->
              <div style="text-align:center;margin-top:32px;">
                <a href="${frontendUrl}"
                  style="display:inline-block;background:linear-gradient(135deg,#8CE4FF,#FFA239);color:#1a1a1a;font-weight:bold;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:16px;">
                  Visit PovertyLens
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#f9f9f9;border-top:1px solid #eeeeee;text-align:center;">
              <p style="margin:0;color:#aaa;font-size:12px;">
                You're receiving this because you opted in to the PovertyLens weekly digest.
              </p>
              <p style="margin:8px 0 0;">
                <a href="${unsubscribeUrl}" style="color:#aaa;font-size:12px;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Escape HTML special characters to prevent injection in email content
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { sendWeeklyDigest, buildUnsubscribeToken };
