# AI Image Generator

A beginner-friendly full-stack project for generating AI images from text prompts.
Users sign up, type a prompt, generate an image with OpenAI's image API, and the
result is stored in AWS S3 with a record in PostgreSQL so it shows up in their
personal gallery.

## Project structure

- `frontend/` — React + TypeScript app (built with Vite). The user interface where
  people sign up/log in, type prompts, click "Generate", and view their image gallery.
- `backend/` — Node.js + Express + TypeScript API. Handles requests from the frontend,
  talks to the AI image API, AWS S3, and the PostgreSQL database.

## Tech stack

- **Frontend:** React, TypeScript, Vite, plain CSS (CSS variables, no frameworks)
- **Backend:** Node.js, Express, TypeScript
- **AI API:** OpenAI (image generation)
- **Storage:** AWS S3 (generated images)
- **Database:** AWS RDS (PostgreSQL) — prompt history and image metadata
- **Auth:** JWT-based user accounts
- **Testing:** Jest + Supertest
- **CI/CD:** GitHub Actions

## Architecture overview

```
                ┌──────────────┐        ┌─────────────────────┐
  Browser ───▶  │  React (Vite) │ ─────▶ │  Express API (Node)  │
                │  frontend     │  REST  │  backend             │
                └──────────────┘        └─────────────────────┘
                                              │        │      │
                                              │        │      │
                                       JWT auth   OpenAI   AWS S3
                                       (signup/   images    (image
                                        login)    API       storage)
                                              │
                                              ▼
                                       AWS RDS (PostgreSQL)
                                       - users
                                       - generations
                                       (prompt + image key + user_id)
```

**Request flow for "Generate":**

1. The user types a prompt on the Home page and clicks **Generate**.
2. The frontend sends `POST /api/generate` with the prompt and the user's JWT.
3. The backend calls OpenAI's image API to generate the image.
4. The image bytes are uploaded to an S3 bucket.
5. The prompt, S3 object key, and user ID are saved to the `generations` table.
6. A signed S3 URL is returned to the frontend and displayed.
7. The Gallery page lists all of a user's past generations via `GET /api/gallery`.

## Getting started

### Prerequisites

- Node.js 22+
- An OpenAI API key
- An AWS account with an S3 bucket and an RDS PostgreSQL instance (or a local
  Postgres database for development)

### 1. Clone and install dependencies

```bash
git clone <this-repo-url>
cd AI-image-generator

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

**Backend** — copy `backend/.env.example` to `backend/.env` and fill in real values:

```bash
cd backend
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `PORT` | Port the API server listens on (default `5000`) |
| `OPENAI_API_KEY` | API key from https://platform.openai.com/api-keys |
| `AWS_REGION` | Region of your S3 bucket, e.g. `us-east-1` |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS credentials with S3 read/write access |
| `S3_BUCKET_NAME` | Name of the bucket where generated images are stored |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | PostgreSQL connection details (RDS or local) |
| `JWT_SECRET` | Random string used to sign auth tokens — generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

```bash
cd frontend
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | URL of the backend API (default `http://localhost:5000`) |

### 3. Set up the database

Run the setup script once to create the `users` and `generations` tables:

```bash
cd backend
npm run db:setup
```

This is safe to re-run — every statement only creates tables/columns "if not exists".

### 4. Run the app

In one terminal, start the backend:

```bash
cd backend
npm run dev
```

In another terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`), sign up for an account,
and start generating images.

## Available scripts

**Backend** (`backend/`)

- `npm run dev` — start the API with hot reload
- `npm run build` — type-check and compile to `dist/`
- `npm start` — run the compiled server
- `npm run db:setup` — create/update database tables
- `npm test` — run the Jest + Supertest test suite

**Frontend** (`frontend/`)

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally

## API endpoints

| Method | Path | Auth required | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/signup` | No | Create an account, returns a JWT |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| POST | `/api/generate` | Yes | Generate an image from a prompt |
| GET | `/api/gallery` | Yes | List the current user's past generations |

Authenticated requests send the JWT as `Authorization: Bearer <token>`.

## Pages

- **Sign Up / Log In** — create an account or log in; sessions are stored as a JWT
  in `localStorage`.
- **Home** — enter a prompt, generate an image, and preview the result with loading
  and error states.
- **Gallery** — browse all images you've generated, with prompts as captions. Shows
  a retry option if loading fails.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request to
`main`:

- **Backend** — installs dependencies, type-checks/builds, and runs the test suite.
- **Frontend** — installs dependencies, lints, and type-checks/builds.

## Status

All planned phases are complete: project scaffolding, authentication, image
generation, S3 storage, the database-backed gallery, CI/CD, and a final styling and
error-handling polish pass.
