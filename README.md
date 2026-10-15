# NORTH

A career-intelligence platform for discovering engineering opportunities and managing your job search.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** bcrypt and JWT

## Project Structure

- `client/` — Frontend application
- `server/` — Backend API and database configuration

## Development

Run the frontend and backend independently from their respective directories.

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm run dev
```

Configure the required environment variables using the relevant `.env` files. Never commit actual credentials or secrets.
