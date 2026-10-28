require("dotenv/config");
const express = require("express");
const cookieParser = require("cookie-parser");
const { prisma } = require("./db");
const {
  SESSION_COOKIE,
  cookieOptions,
  normalizeEmail,
  publicUser,
} = require("./utils");
const {
  createSession,
  deleteSession,
  deleteAllUserSessions,
} = require("./session");
const { requireAuth } = require("./auth");
const app = express();
app.use(express.json());
app.use(cookieParser());
app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/auth/register", async (req, res) => {
  // TODO: Validate, normalize, check duplicate, create user, return 201 without password.
  return res.status(501).json({ error: "TODO: register" });
});
app.post("/auth/login", async (req, res) => {
  // TODO: Validate credentials, remove old session, create new session, set cookie, return user.
  return res.status(501).json({ error: "TODO: login" });
});
app.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));
app.post("/auth/logout", async (req, res) => {
  // TODO: Delete current session if any, clear cookie, return 204.
  return res.status(501).json({ error: "TODO: logout" });
});
app.post("/auth/logout-all", requireAuth, async (req, res) => {
  // TODO: Delete every session for req.user.id, clear cookie, return count.
  return res.status(501).json({ error: "TODO: logout-all" });
});

const PORT = process.env.PORT ?? 3000;
if (require.main === module)
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`),
  );
module.exports = { app };
