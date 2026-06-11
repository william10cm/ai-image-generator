import { Router, Request, Response } from "express";
import { pool } from "../db";
import { getImageUrl } from "../s3";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/gallery
// Returns the current user's past generations (newest first), each with
// a freshly signed S3 URL (signed URLs expire after an hour, so we
// generate a new one every time this endpoint is called).
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, prompt, image_key, created_at FROM generations WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );

    const items = await Promise.all(
      result.rows.map(async (row) => ({
        id: row.id,
        prompt: row.prompt,
        imageUrl: await getImageUrl(row.image_key),
        createdAt: row.created_at,
      }))
    );

    res.json(items);
  } catch (error) {
    console.error("Failed to load gallery:", error);
    res.status(500).json({ error: "Failed to load gallery." });
  }
});

export default router;
