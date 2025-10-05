# HelpDesk Mini

Small helpdesk app (React + Node + MongoDB) with auth, roles, tickets, comments, and SLA.

## What’s inside
- Client: React, React Router, Axios
- Server: Node/Express, Mongoose, JWT, Helmet, CORS, Rate limit
- DB: MongoDB

## Run locally

1) API server

cd server
npm install
npm run seed
npm start

Environment (create server/.env):
- MONGO_URI=YOUR_CONNECTION_STRING
- JWT_SECRET=YOUR_SECRET
- PORT=5000

2) Web client

cd client
npm install
npm start

Client: http://localhost:3000 → API: http://localhost:5000/api

## Test accounts
- admin@example.com / Password123! (admin)
- agent@example.com / Password123! (agent)
- user@example.com / Password123! (user)

## Notes
- Status: open | in_progress | resolved | closed
- Protected pages redirect to /login
