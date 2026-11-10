# Maize & Brew — the client

The store's front end: React + TypeScript, built with Vite. It runs on
**sample data in memory** until we connect it to the server in class.

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

Sample logins: `casey` / `casey-password` (customer) and `staff` /
`staff-password` (staff). You can also create a customer account.

## Where things are

| | |
|---|---|
| `src/api/` | **Everything that will talk to the server.** The only folder we change in class |
| `src/api/sample-data.ts` | The in-memory stand-in. Deleted once nothing imports it |
| `src/api/session.ts` | The logged-in user and their token, in `sessionStorage` |
| `src/components/` | The screens. We don't change these |
| `src/types.ts` | `Product`, `Order`, `User` — the same shapes the server uses |
| `src/format.ts`, `src/styles.css` | Display helpers and layout. Nothing to do with the server |

Styling is [Pico CSS](https://picocss.com) (classless), plus `styles.css`.
