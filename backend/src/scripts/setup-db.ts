// One-time setup script: creates/updates our tables. Safe to run more
// than once - every statement only acts "if not exists".
// Run with: npm run db:setup
import dotenv from "dotenv";
dotenv.config();

import { pool } from "../db";

async function setup() {
  // Stores user accounts. Passwords are never stored in plain text -
  // only a bcrypt hash of the password is saved.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS generations (
      id SERIAL PRIMARY KEY,
      prompt TEXT NOT NULL,
      image_key TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Link each generation to the user who created it. Existing rows
  // (from before accounts existed) will have a NULL user_id.
  await pool.query(`
    ALTER TABLE generations
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
  `);

  console.log("Tables 'users' and 'generations' are ready.");
  await pool.end();
}

setup().catch((error) => {
  console.error("Database setup failed:", error);
  process.exit(1);
});
