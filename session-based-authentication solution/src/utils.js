const { randomBytes } = require("node:crypto");


const SESSION_COOKIE = "sid";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_TTL_MS,
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const newSessionId = () => randomBytes(32).toString("hex");

const expiresAt = () => new Date(Date.now() + SESSION_TTL_MS);

const publicUser = (user) => ({ id: user.id, email: user.email });

module.exports = {
  SESSION_COOKIE,
  cookieOptions,
  normalizeEmail,
  newSessionId,
  expiresAt,
  publicUser,
};
