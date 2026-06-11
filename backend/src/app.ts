// Sets up the Express app and its routes, but does NOT start the
// server. Splitting this out from index.ts lets our tests import
// `app` directly (with supertest) without opening a real network port.
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import generateRouter from "./routes/generate";
import galleryRouter from "./routes/gallery";

const app = express();

// Allow the frontend (running on a different port) to call this API
app.use(cors());

// Parse incoming JSON request bodies into req.body
app.use(express.json());

// Health-check route: lets us (and tools like uptime monitors) confirm
// the server is up and responding
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Auth endpoints (signup/login) - delegates to routes/auth.ts
app.use("/api/auth", authRouter);

// Image generation endpoint - delegates to routes/generate.ts
app.use("/api/generate", generateRouter);

// Gallery endpoint - delegates to routes/gallery.ts
app.use("/api/gallery", galleryRouter);

export default app;
