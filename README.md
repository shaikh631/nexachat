# NexaChat

NexaChat is a full-stack AI chat application with a React frontend and an Express API. It supports account login, streamed Gemini responses, Markdown rendering, and MongoDB-backed conversation history.

## Features

- Register and sign in with JWT-based authentication.
- Create, search, rename, and delete saved conversations.
- Stream AI replies from Gemini through the backend.
- Render Markdown, tables, and code blocks in chat messages.
- Switch between a midnight olive dark theme and a cream light theme.

## Stack

- Frontend: React 19, Vite, Tailwind CSS, Lucide, React Markdown.
- Backend: Node.js, Express, Mongoose, JWT, Gemini API.
- Database: MongoDB local or MongoDB Atlas.

## Requirements

- Node.js 20 or later and npm.
- A MongoDB instance. For persistent hosted storage, use MongoDB Atlas.
- A Gemini API key for AI-generated replies.

## Setup

Install the frontend and backend dependencies from the project root:

```sh
npm install --prefix backend
npm install --prefix frontend
```

Create the backend environment file without overwriting an existing one:

```sh
cp -n backend/.env.example backend/.env
```

Edit `backend/.env` and set:

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port. The frontend proxy expects `5001`. |
| `MONGODB_URI` | Local MongoDB URI or your Atlas connection string. |
| `JWT_SECRET` | A long, randomly generated secret for signing login tokens. |
| `GEMINI_API_KEY` | Gemini API key used only by the backend. |
| `NODE_ENV` | Use `development` for local development. |

For Atlas, create a database user and allow your IP address in Atlas Network Access. Put the URI in `MONGODB_URI`; URL-encode special characters in the database password. Never place API keys or database credentials in frontend files or commit `backend/.env`.

## Run Locally

Start the backend and frontend in separate terminals from the project root.

Terminal 1:

```sh
npm run backend
```

Terminal 2:

```sh
npm run frontend
```

Open [http://localhost:5000](http://localhost:5000). The frontend proxies `/api` requests to the backend on port `5001`. Check backend availability at [http://localhost:5001/api/health](http://localhost:5001/api/health).

## Production Build

Build the frontend bundle:

```sh
npm run build
```

Then start the Express server, which serves `frontend/dist` when the bundle exists:

```sh
npm --prefix backend start
```

## Notes

- The Gemini key is read by the backend; Gemini model configuration lives in `backend/services/geminiService.js`.
- The backend can fall back to an in-memory MongoDB if the configured database cannot be reached. That data is temporary, so configure a working `MONGODB_URI` to keep conversations across restarts.