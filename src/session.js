const { prisma } = require("./db");
const { newSessionId, expiresAt } = require("./utils");

async function createSession(userId) {
  // TODO: Save a new Session with random ID, userId, and 7-day expiry. Return ID.
  throw new Error("TODO: createSession");
}
async function getSessionWithUser(id) {
  // TODO: Find session including public user fields; delete expired session; return null if invalid.
  throw new Error("TODO: getSessionWithUser");
}
async function deleteSession(id) {
  // TODO: Delete by ID without throwing if missing.
  throw new Error("TODO: deleteSession");
}
async function deleteAllUserSessions(userId) {
  // TODO: Delete all sessions for this user and return count.
  throw new Error("TODO: deleteAllUserSessions");
}
module.exports = {
  createSession,
  getSessionWithUser,
  deleteSession,
  deleteAllUserSessions,
};
