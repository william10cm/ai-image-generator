import { createContext, useContext } from "react";
import type { AuthUser } from "../services/api";

export interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// React Context lets us share auth state (the current user) across the
// whole app without passing it down through every component's props.
export const AuthContext = createContext<AuthContextValue | null>(null);

// Custom hook for components to access auth state and actions.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
