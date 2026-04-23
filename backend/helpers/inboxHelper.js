// Added by Christella - 04/14/2026
const { getDb } = require('../database');

async function createInboxMessage({
  email,
  subject,
  body,
  type,
  from = 'PovertyLens Team',
}) {
  if (!email) return;

  const db = getDb();

  await db.collection('messages').insertOne({
    email: email.trim().toLowerCase(),
    subject,
    body,
    type,
    from,
    read: false,
    date: new Date().toLocaleDateString(),
    createdAt: new Date(),
  });
}

module.exports = { createInboxMessage };
// End of addition by Christella - 04/14/2026