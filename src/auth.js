const { SESSION_COOKIE, cookieOptions } = require("./utils");
const { getSessionWithUser } = require("./session");
async function requireAuth(req, res, next) {
  // TODO: Read cookie; 401 if absent; look up session; 401 and clear cookie if invalid;
  // attach req.user and req.sessionId; call next().
  throw new Error("TODO: requireAuth");
}
module.exports = { requireAuth };
