const  {prisma}  = require("./db");
const { newSessionId, expiresAt } = require("./utils");

async function createSession(userId) {
  const id = newSessionId();
  await prisma.session.create({ data: { id, userId, expiresAt: expiresAt() } });
  return id;
}

async function getSessionWithUser(id) {
  const session = await prisma.session.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) return null;
  return {
    id: session.id,
    user: { id: session.user.id, email: session.user.email },
  };
}

async function deleteSession(id) {
  await prisma.session.deleteMany({ where: { id } });
}

async function deleteAllUserSessions(userId) {
  const result = await prisma.session.deleteMany({ where: { userId } });
  return result.count;
}

module.exports = {
  createSession,
  getSessionWithUser,
  deleteSession,
  deleteAllUserSessions,
};
