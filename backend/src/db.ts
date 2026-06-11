import { Pool } from "pg";

// A "pool" manages multiple database connections for us, reusing them
// across requests instead of opening a new connection every time -
// this is the standard way to talk to Postgres from a Node app.
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // RDS requires SSL connections by default
  ssl: { rejectUnauthorized: false },
});
