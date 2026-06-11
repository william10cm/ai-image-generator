// Runs before every test file. Sets fake environment variables so our
// app code (e.g. jwt.sign/verify) has what it needs, without touching
// real secrets or requiring a .env file.
process.env.JWT_SECRET = "test-secret";

// The OpenAI client throws if no API key is set, even though we mock
// it in tests that need it. A fake value satisfies that check.
process.env.OPENAI_API_KEY = "test-key";
