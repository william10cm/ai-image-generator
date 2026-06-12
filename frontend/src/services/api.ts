// Base URL of our backend API. Vite exposes env vars prefixed with
// VITE_ to the browser via import.meta.env.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Shape of each item returned by GET /api/gallery
export interface GalleryItem {
  id: number;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

// Shape of the user object returned by signup/login
export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Builds the Authorization header from the token saved in localStorage.
// Every request that needs the user's identity includes this header.
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Wraps fetch() so that network failures (server down, no internet, CORS
// misconfiguration, etc.) throw the same friendly Error type as a normal
// API error response, instead of a raw "Failed to fetch" TypeError.
async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error("Unable to reach the server. Check your connection and try again.");
  }
}

// POST /api/auth/signup - creates a new account and returns a token
export async function signup(email: string, password: string): Promise<AuthResponse> {
  return authRequest("/api/auth/signup", email, password);
}

// POST /api/auth/login - logs in and returns a token
export async function login(email: string, password: string): Promise<AuthResponse> {
  return authRequest("/api/auth/login", email, password);
}

async function authRequest(path: string, email: string, password: string): Promise<AuthResponse> {
  const response = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

// Calls our backend's /api/generate endpoint, which talks to the AI
// image API and returns the resulting image's URL.
export async function generateImage(prompt: string): Promise<string> {
  const response = await apiFetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate image.");
  }

  return data.imageUrl;
}

// Calls our backend's /api/gallery endpoint to fetch past generations.
export async function fetchGallery(): Promise<GalleryItem[]> {
  const response = await apiFetch("/api/gallery", {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load gallery.");
  }

  return response.json();
}
