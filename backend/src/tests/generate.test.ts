import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { pool } from "../db";
import { uploadImage, getImageUrl } from "../s3";

jest.mock("../db", () => ({
  pool: { query: jest.fn() },
}));

jest.mock("../s3", () => ({
  uploadImage: jest.fn(),
  getImageUrl: jest.fn(),
}));

// Mock the OpenAI SDK so tests don't make real API calls (which cost
// money and require a real key).
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    images: {
      generate: jest.fn().mockResolvedValue({
        data: [{ b64_json: Buffer.from("fake-image-bytes").toString("base64") }],
      }),
    },
  }));
});

const mockQuery = pool.query as jest.Mock;
const mockUploadImage = uploadImage as jest.Mock;
const mockGetImageUrl = getImageUrl as jest.Mock;

// Build a valid JWT the same way our auth middleware expects.
function authToken(userId = 1): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!);
}

beforeEach(() => {
  mockQuery.mockReset();
  mockUploadImage.mockReset();
  mockGetImageUrl.mockReset();
});

describe("POST /api/generate", () => {
  it("rejects requests without a token", async () => {
    const response = await request(app).post("/api/generate").send({ prompt: "a cat" });

    expect(response.status).toBe(401);
  });

  it("rejects requests without a prompt", async () => {
    const response = await request(app)
      .post("/api/generate")
      .set("Authorization", `Bearer ${authToken()}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it("generates an image, uploads it to S3, and saves it to the database", async () => {
    mockUploadImage.mockResolvedValueOnce("images/test-key.png");
    mockGetImageUrl.mockResolvedValueOnce("https://example.com/signed-url");
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post("/api/generate")
      .set("Authorization", `Bearer ${authToken(42)}`)
      .send({ prompt: "a cat wearing a hat" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      imageUrl: "https://example.com/signed-url",
      imageKey: "images/test-key.png",
    });

    // Confirm the prompt, image key, and user id were saved together
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
      "a cat wearing a hat",
      "images/test-key.png",
      42,
    ]);
  });
});
