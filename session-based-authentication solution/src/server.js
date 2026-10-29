require("dotenv/config");
const express = require("express");
const cookieParser = require("cookie-parser");
const  {prisma}  = require("./db");
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
  const { email, password } = req.body;
  if (!email || !password || !email.includes("@") || password.length < 8) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const cleanEmail = normalizeEmail(email);
  const existingUser = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });
  if (existingUser)
    return res.status(409).json({ error: "Email already registered" });

  const user = await prisma.user.create({
    data: { email: cleanEmail, password },
  });
  res.status(201).json({ user: publicUser(user) });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const oldSessionId = req.cookies[SESSION_COOKIE];
  if (oldSessionId) await deleteSession(oldSessionId);

  const sessionId = await createSession(user.id);
  res.cookie(SESSION_COOKIE, sessionId, cookieOptions);
  res.json({ user: publicUser(user) });
});

app.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.post("/auth/logout", async (req, res) => {
  const sessionId = req.cookies[SESSION_COOKIE];
  if (sessionId) await deleteSession(sessionId);
  res.clearCookie(SESSION_COOKIE, cookieOptions);
  res.status(204).send();
});

app.post("/auth/logout-all", requireAuth, async (req, res) => {
  const count = await deleteAllUserSessions(req.user.id);
  res.clearCookie(SESSION_COOKIE, cookieOptions);
  res.json({ loggedOutSessions: count });
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running on port 3000"),
);
