import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db";

const router = Router();

// How many "salt rounds" bcrypt uses when hashing passwords.
// Higher = slower but more secure against brute-force attacks.
// 10 is a common, safe default.
const SALT_ROUNDS = 10;

// POST /api/auth/signup
// Body: { email: string, password: string }
router.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  try {
    // Hash the password before storing it - we never save plain-text passwords.
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash]
    );

    const user = result.rows[0];
    const token = createToken(user.id);

    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    // Postgres error code 23505 = unique constraint violation (duplicate email)
    if (error.code === "23505") {
      return res.status(409).json({ error: "An account with that email already exists." });
    }
    console.error("Signup failed:", error);
    res.status(500).json({ error: "Failed to create account." });
  }
});

// POST /api/auth/login
// Body: { email: string, password: string }
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const result = await pool.query("SELECT id, email, password_hash FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    // Use the same error message whether the email or password is wrong -
    // this avoids revealing which emails are registered.
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = createToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Failed to log in." });
  }
});

// Creates a signed JWT containing the user's id, valid for 7 days.
function createToken(userId: number): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

export default router;
