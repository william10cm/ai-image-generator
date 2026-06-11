import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { uploadImage, getImageUrl } from "../s3";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// The OpenAI client reads OPENAI_API_KEY from process.env automatically,
// as long as dotenv.config() has run before this file is loaded (it has,
// since index.ts calls it first).
const openai = new OpenAI();

// POST /api/generate
// Body: { prompt: string }
// Response: { imageUrl: string }
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { prompt } = req.body;

  // Basic validation - make sure the client actually sent a prompt
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "A text 'prompt' is required." });
  }

  try {
    // Ask OpenAI to generate one image for this prompt.
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageData = response.data?.[0];

    if (!imageData?.b64_json) {
      return res.status(502).json({ error: "No image was returned by the AI service." });
    }

    // gpt-image-1 returns the image as base64 text. Decode it into raw
    // bytes so we can upload it to S3 as a normal image file.
    const imageBuffer = Buffer.from(imageData.b64_json, "base64");

    const imageKey = await uploadImage(imageBuffer, "image/png");
    const imageUrl = await getImageUrl(imageKey);

    // Save the prompt and image key so this generation shows up in the
    // gallery later. We store the key (not the signed URL) since signed
    // URLs expire after an hour.
    await pool.query(
      "INSERT INTO generations (prompt, image_key, user_id) VALUES ($1, $2, $3)",
      [prompt, imageKey, req.userId]
    );

    res.json({ imageUrl, imageKey });
  } catch (error) {
    console.error("Image generation failed:", error);
    res.status(500).json({ error: "Failed to generate image." });
  }
});

export default router;
