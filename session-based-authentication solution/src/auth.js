const { SESSION_COOKIE } = require('./utils');
const { getSessionWithUser } = require('./session');

async function requireAuth(req, res, next) {
  const sessionId = req.cookies[SESSION_COOKIE];
  if (!sessionId) return res.status(401).json({ error: 'Not logged in' });

  const session = await getSessionWithUser(sessionId);
  if (!session) return res.status(401).json({ error: 'Invalid or expired session' });

  req.user = session.user;
  req.sessionId = session.id;
  next();
}

module.exports = { requireAuth };