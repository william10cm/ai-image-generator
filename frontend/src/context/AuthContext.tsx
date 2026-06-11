import { useState, type ReactNode } from "react";
import * as api from "../services/api";
import type { AuthUser } from "../services/api";
import { AuthContext } from "./auth-context";

// Reads the saved user from localStorage so a page refresh doesn't
// log the user out.
function loadStoredUser(): AuthUser | null {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);

  function saveSession(token: string, user: AuthUser) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }

  async function login(email: string, password: string) {
    const { token, user } = await api.login(email, password);
    saveSession(token, user);
  }

  async function signup(email: string, password: string) {
    const { token, user } = await api.signup(email, password);
    saveSession(token, user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
