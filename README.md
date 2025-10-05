# Helpdesk Mini - Client

A React client for the Helpdesk Mini application.

## Scripts

- `npm start`: Start development server
- `npm run build`: Create production build
- `npm test`: Run tests (if configured)
- `npm run eject`: Eject CRA config (if applicable)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm start
```

The app will run at `http://localhost:3000` by default.

## Project Structure

```text
client/
  package.json
  package-lock.json
  public/
    index.html
  src/
    api.js
    App.js
    index.css
    index.js
    components/
      Navbar.js
      ProtectedRoute.js
    contexts/
      UserContext.js
    pages/
      BreachedTickets.js
      Login.js
      NewTicket.js
      Register.js
      TicketDetail.js
      Tickets.js
```

## Notes

- See `.gitignore` for ignored files (node modules, build artifacts, env files, editor settings).
- Ensure your API base URL/config is set correctly in `src/api.js` for your environment.

## Repository

GitHub: `https://github.com/MohamadxMortuz/Client_HeplDesk-Mini.git`
