import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Adds a `userId` field to Express's Request type, so TypeScript knows
// about req.userId after our middleware runs.
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

// Protects a route by requiring a valid JWT in the Authorization header,
// in the form: "Authorization: Bearer <token>"
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}
