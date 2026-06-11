import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app";
import { pool } from "../db";

// Replace the real database pool with a mock so tests don't need a
// live Postgres connection. `pool.query` becomes a Jest mock function
// whose return value we control in each test.
jest.mock("../db", () => ({
  pool: { query: jest.fn() },
}));

const mockQuery = pool.query as jest.Mock;

beforeEach(() => {
  mockQuery.mockReset();
});

describe("POST /api/auth/signup", () => {
  it("creates a new user and returns a token", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1, email: "new@example.com" }],
    });

    const response = await request(app)
      .post("/api/auth/signup")
      .send({ email: "new@example.com", password: "password123" });

    expect(response.status).toBe(201);
    expect(response.body.user).toEqual({ id: 1, email: "new@example.com" });
    expect(response.body.token).toEqual(expect.any(String));
  });

  it("rejects a password shorter than 8 characters", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({ email: "new@example.com", password: "short" });

    expect(response.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 409 when the email is already registered", async () => {
    mockQuery.mockRejectedValueOnce({ code: "23505" });

    const response = await request(app)
      .post("/api/auth/signup")
      .send({ email: "taken@example.com", password: "password123" });

    expect(response.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with the correct email and password", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1, email: "user@example.com", password_hash: passwordHash }],
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
  });

  it("rejects an incorrect password", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1, email: "user@example.com", password_hash: passwordHash }],
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "wrong-password" });

    expect(response.status).toBe(401);
  });

  it("rejects an email that doesn't exist", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(response.status).toBe(401);
  });
});
