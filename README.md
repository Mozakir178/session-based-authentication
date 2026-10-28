# Lab: Build Login & Logout Using Sessions

## Problem

You are building a website where users can register, log in, view their profile, and log out.

Once a user logs in, they should not need to enter their password again for every request.

You will solve this using **cookies and server-side sessions**.

A starter project is provided with Express, Prisma, PostgreSQL configuration, and utility functions. Your task is to complete the missing `TODO` sections.

## How It Works

1. **Register:** Create a new user using an email and password.
2. **Login:** Verify the credentials, create a session in the database, and send its ID to the browser using a cookie.
3. **Stay logged in:** The browser automatically sends the session cookie with future requests.
4. **Verify session:** The server looks up the session ID in the database and checks whether it is valid.
5. **Logout:** Delete the session from the database and clear the browser cookie.
6. **Logout all devices:** Delete every session belonging to the logged-in user.

## Provided Utility Functions

The following are already implemented in `src/utils.js`. **Do not modify or reimplement them.**

| Function / Constant     | Purpose                                                |
| ----------------------- | ------------------------------------------------------ |
| `SESSION_COOKIE`        | Cookie name: `sid`                                     |
| `SESSION_TTL_MS`        | Session duration: 7 days                               |
| `cookieOptions`         | Cookie settings such as HttpOnly, SameSite, and expiry |
| `normalizeEmail(email)` | Trims spaces and converts email to lowercase           |
| `newSessionId()`        | Generates a random session ID                          |
| `expiresAt()`           | Returns the session expiry date, 7 days from now       |
| `publicUser(user)`      | Returns only the user's ID and email                   |

You must use these utilities wherever required.

---

## Your Tasks

### Task 1: Register a User

**File:** `src/server.js`

**Endpoint:** `POST /auth/register`

Request:

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

Complete the registration route:

1. Read the email and password from `req.body`.
2. Validate the email and password. Email must be a string containing `@`, and password must be a string with at least 8 characters. Return `400` for invalid input.
3. Use `normalizeEmail(email)` to normalize the email.
4. Use `prisma.user.findUnique()` to check whether the email is already registered.
5. Return `409` if the email already exists.
6. Use `prisma.user.create()` to save the user.
7. Return `201` with the user's `id`, `email`, and `createdAt`, without the password.

**Provided utility to use:** `normalizeEmail()`

### Task 2: Implement Session Functions

**File:** `src/session.js`

Complete the following four functions.

**A. `createSession(userId)`**

- Call `newSessionId()` to generate a random session ID.
- Call `expiresAt()` to calculate its expiry.
- Use `prisma.session.create()` to save `id`, `userId`, and `expiresAt`.
- Return the generated session ID.

**B. `getSessionWithUser(id)`**

- Use `prisma.session.findUnique()` to find the session by ID.
- Include the associated user, selecting only `id`, `email`, and `createdAt`.
- Return `null` if the session does not exist.
- If the session has expired, delete it using `deleteSession(id)` and return `null`.
- Otherwise, return the session with its user.

**C. `deleteSession(id)`**

- Use `prisma.session.deleteMany()` to delete the session by ID.
- The function must not throw an error when the session does not exist.

**D. `deleteAllUserSessions(userId)`**

- Use `prisma.session.deleteMany()` to delete every session belonging to the given user.
- Return the number of deleted sessions.

**Provided utilities to use:** `newSessionId()`, `expiresAt()`

### Task 3: Login and Set Session Cookie

**File:** `src/server.js`

**Endpoint:** `POST /auth/login`

Complete the login route:

1. Read email and password from `req.body`. Return `400` if either is not a string.
2. Use `normalizeEmail(email)` to normalize the email.
3. Use `prisma.user.findUnique()` to find the user.
4. Verify the password. Return `401` with `Invalid email or password` if credentials are incorrect.
5. Read the existing session ID from `req.cookies[SESSION_COOKIE]`.
6. If an old session ID exists, call `deleteSession(oldSessionId)`.
7. Call `createSession(user.id)` to create a new session.
8. Use `res.cookie(SESSION_COOKIE, sessionId, cookieOptions)` to send the session ID to the browser.
9. Return `200` with `{ user: publicUser(user) }`.

**Provided utilities to use:** `normalizeEmail()`, `SESSION_COOKIE`, `cookieOptions`, `publicUser()`

**Session functions to use:** `deleteSession()`, `createSession()`

The session ID must be sent through the cookie, not the JSON response.

### Task 4: Implement Authentication Middleware

**File:** `src/auth.js`

**Function:** `requireAuth(req, res, next)`

Complete the middleware:

1. Read the session ID from `req.cookies[SESSION_COOKIE]`.
2. If no session ID exists, return `401` with `Not logged in`.
3. Call `getSessionWithUser(sessionId)` to retrieve the session.
4. If the session is invalid or expired, clear the cookie using `res.clearCookie(SESSION_COOKIE, cookieOptions)` and return `401` with `Session expired or invalid`.
5. If the session is valid, assign `session.user` to `req.user`.
6. Assign `session.id` to `req.sessionId`.
7. Call `next()`.

**Provided utilities to use:** `SESSION_COOKIE`, `cookieOptions`

**Session function to use:** `getSessionWithUser()`

### Task 5: View Logged-in User

**Endpoint:** `GET /me`

This route is **already implemented** in the starter code.

```js
app.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
```

You do not need to modify this route.

Once your `requireAuth` middleware works correctly, this endpoint should return the logged-in user's details for valid sessions and reject unauthorized requests.

### Task 6: Logout from Current Device

**File:** `src/server.js`

**Endpoint:** `POST /auth/logout`

Complete the logout route:

1. Read the session ID from `req.cookies[SESSION_COOKIE]`.
2. If the ID exists, call `deleteSession(sessionId)`.
3. Clear the browser cookie using `res.clearCookie(SESSION_COOKIE, cookieOptions)`.
4. Return `204 No Content`, even when the user is already logged out.

**Provided utilities to use:** `SESSION_COOKIE`, `cookieOptions`

**Session function to use:** `deleteSession()`

After logout, the old session ID must no longer provide access to protected routes.

### Task 7: Logout from All Devices

**File:** `src/server.js`

**Endpoint:** `POST /auth/logout-all`

This route is already protected using `requireAuth`.

Complete the route:

1. Read the logged-in user's ID from `req.user.id`.
2. Call `deleteAllUserSessions(req.user.id)`.
3. Store the returned number of deleted sessions.
4. Clear the current browser's cookie using `res.clearCookie(SESSION_COOKIE, cookieOptions)`.
5. Return `200` with the number of deleted sessions.

**Provided utilities to use:** `SESSION_COOKIE`, `cookieOptions`

**Session function to use:** `deleteAllUserSessions()`

Expected response:

```json
{
  "loggedOutSessions": 3
}
```

---

## API Requirements

| Method | Endpoint           | Expected behavior                              |
| ------ | ------------------ | ---------------------------------------------- |
| POST   | `/auth/register`   | Create a new user                              |
| POST   | `/auth/login`      | Verify credentials, create session, set cookie |
| GET    | `/me`              | Return user if session is valid                |
| POST   | `/auth/logout`     | Delete current session and clear cookie        |
| POST   | `/auth/logout-all` | Delete all sessions belonging to the user      |

## Testing

Test your implementation using Postman, Thunder Client, or curl.

| Scenario                                          | Expected status  |
| ------------------------------------------------- | ---------------- |
| Register a new user                               | 201              |
| Register duplicate email                          | 409              |
| Register with invalid input                       | 400              |
| Login with correct credentials                    | 200 + Set-Cookie |
| Login with wrong password                         | 401              |
| Access `/me` without cookie                       | 401              |
| Access `/me` with valid cookie                    | 200              |
| Access `/me` with invalid or expired session      | 401              |
| Logout current device                             | 204              |
| Access `/me` using old session after logout       | 401              |
| Logout from all devices                           | 200              |
| Access `/me` from any previously logged-in device | 401              |

## Expected Result

Your implementation should allow users to register, log in, access protected routes, and log out using sessions stored in PostgreSQL.

You must complete all **9 TODO sections** across `src/server.js`, `src/session.js`, and `src/auth.js`.

**Important:** This is an educational lab focused on session authentication. Passwords are stored as plain text for simplicity. Real applications must hash passwords and implement additional security protections.
