import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { pool } from "../db";
import { getImageUrl } from "../s3";

jest.mock("../db", () => ({
  pool: { query: jest.fn() },
}));

jest.mock("../s3", () => ({
  uploadImage: jest.fn(),
  getImageUrl: jest.fn(),
}));

const mockQuery = pool.query as jest.Mock;
const mockGetImageUrl = getImageUrl as jest.Mock;

function authToken(userId = 1): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!);
}

beforeEach(() => {
  mockQuery.mockReset();
  mockGetImageUrl.mockReset();
});

describe("GET /api/gallery", () => {
  it("rejects requests without a token", async () => {
    const response = await request(app).get("/api/gallery");

    expect(response.status).toBe(401);
  });

  it("returns the current user's generations with signed URLs", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          prompt: "a cat wearing a hat",
          image_key: "images/test-key.png",
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    mockGetImageUrl.mockResolvedValueOnce("https://example.com/signed-url");

    const response = await request(app)
      .get("/api/gallery")
      .set("Authorization", `Bearer ${authToken(42)}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        prompt: "a cat wearing a hat",
        imageUrl: "https://example.com/signed-url",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    // The query should be scoped to the logged-in user's id
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [42]);
  });
});
