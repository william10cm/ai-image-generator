# AI Image Generator

A beginner-friendly full-stack project for generating AI images from text prompts.

## Project structure

- `frontend/` — React + TypeScript app (built with Vite). The user interface where
  people type prompts, click "Generate", and view their image gallery.
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

## Status

Project is being built step by step, phase by phase. See commit history for progress.
