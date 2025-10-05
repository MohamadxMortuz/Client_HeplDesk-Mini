# HelpDesk Mini (Tickets + SLA + Comments)

A compact helpdesk application built with React, Node/Express, and MongoDB. It features JWT authentication, role-based access, SLA timers, ticket assignments, threaded comments, a searchable timeline, and pagination.

## Tech Stack
- Client: React (React Router), Axios
- Server: Node.js, Express, Mongoose, JWT, Helmet, CORS, Rate limiting
- DB: MongoDB

## Features
- Authentication: Register, Login, persistent sessions
- Roles: user, agent, admin
- Tickets: create, list with filters/search, detail view, status and agent updates
- Comments: add comments on tickets
- SLA: due date based on priority; breached tickets view (admin)
- Pagination: limit/offset on list endpoints
- Safety: optimistic locking on updates (version), idempotent ticket creation, rate limiting

## Quick Start

1) Backend API

cd server
npm install
# Optional: create .env (see Environment below). Defaults are provided for dev.
npm run seed
npm start

The server starts on http://localhost:5000.

2) Frontend Client

cd client
npm install
npm start

The client starts on http://localhost:3000 and talks to the API at http://localhost:5000/api.

## Environment
The server loads env via dotenv. For convenience, sensible defaults are set in `server/server.js` if no env is present.

Required/Useful variables:
- MONGO_URI: Mongo connection string (default: mongodb://127.0.0.1:27017/helpdesk-mini)
- JWT_SECRET: Secret for signing tokens (default: dev_secret_change_me)
- PORT: API port (default: 5000)

You can create `server/.env` if you want to override defaults.

## Seeding

cd server
npm run seed

Creates sample users and tickets (see credentials below). Run before `npm start` on first setup.

Test accounts:
- admin@example.com / Password123! (admin)
- agent@example.com / Password123! (agent)
- user@example.com / Password123! (user)

## Project Structure

client/
  src/
    components/      Navbar, ProtectedRoute
    contexts/        UserContext (auth state)
    pages/           Login, Register, Tickets, TicketDetail, NewTicket, BreachedTickets
    index.css        Global styles

server/
  controllers/       authController, ticketController, commentController
  middleware/        auth, errorHandler, idempotency, rateLimit
  models/            User, Ticket, Comment, Activity
  routes/            authRoutes, ticketRoutes, commentRoutes
  config/            db (mongoose connect)
  seed.js            Seed script
  server.js          Express app

## Routing Overview
- /login, /register: public
- /tickets: list (protected)
- /tickets/new: create (protected)
- /tickets/:id: ticket detail (protected)
- /breached: breached tickets (admin only)

## API Overview (selected)

Auth
- POST /api/register  { name, email, password }
- POST /api/login     { email, password } → { token, role, email, name }
- GET  /api/me        (auth) → user profile

Tickets
- POST /api/tickets               (auth, idempotent via Idempotency-Key)
- GET  /api/tickets?limit=&offset=&q=&status=  (auth)
- GET  /api/tickets/breached      (auth, admin)
- GET  /api/tickets/:id           (auth)
- PATCH /api/tickets/:id          (auth) body: { status, agent, version }

Comments
- POST /api/tickets/:id/comments  (auth) body: { message }

Notes
- Status values: open, in_progress, resolved, closed
- Optimistic locking: include `version` from the latest ticket when PATCHing; server returns 409 if stale
- Search: `q` matches title, description, and comment messages

## Client Notes
- Protected routes redirect unauthenticated users to /login
- Session is hydrated immediately from localStorage; `/me` is validated in the background
- Code-splitting with React.lazy for faster perceived loads

## Common Tasks

Create a ticket (client uses Idempotency-Key automatically in create flow):

curl -X POST http://localhost:5000/api/tickets \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Printer issue","description":"Paper jam","priority":"high"}'

Update ticket status (include version from the last GET /tickets/:id):

curl -X PATCH http://localhost:5000/api/tickets/<TICKET_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress","version":2}'

Add a comment:

curl -X POST http://localhost:5000/api/tickets/<TICKET_ID>/comments \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Working on it"}'

## Troubleshooting
- Server won’t start: ensure MongoDB is running and `MONGO_URI` is correct (defaults set in `server/server.js`).
- 401/403 errors: verify Authorization header (`Bearer <token>`) and role permissions.
- 409 on PATCH: the ticket was modified by someone else; refetch and retry with the new version.
- CORS: client runs on :3000, server on :5000; CORS is enabled on server.

## License
MIT
