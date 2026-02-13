"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { login as apiLogin, register as apiRegister, fetchMe } from "./api-auth";
import type { UserResponse } from "./api-auth";

type User = {
  id: number;
  email: string;
  username: string;
  name?: string | null;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (email: string, username: string, password: string, name?: string) => Promise<void>;
  signOut: () => void;
  updateUser: (data: { name?: string }) => void;
  error: string | null;
  clearError: () => void;
};

const TOKEN_KEY = "auth-token";
const USER_KEY = "auth-user";

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function userFromResponse(u: UserResponse): User {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    name: u.name ?? undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const restoreSession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const u = await fetchMe(token);
      setUser(userFromResponse(u));
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const signIn = useCallback(
    async (username: string, password: string) => {
      setError(null);
      try {
        const { access_token } = await apiLogin(username, password);
        localStorage.setItem(TOKEN_KEY, access_token);
        const u = await fetchMe(access_token);
        const usr = userFromResponse(u);
        setUser(usr);
        if (typeof window !== "undefined") {
          localStorage.setItem(USER_KEY, JSON.stringify(usr));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign in failed");
        throw e;
      }
    },
    []
  );

  const signUp = useCallback(
    async (email: string, username: string, password: string, name?: string) => {
      setError(null);
      try {
        await apiRegister({ email, username, password, name: name || null });
        await signIn(username, password);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Registration failed");
        throw e;
      }
    },
    [signIn]
  );

  const signOut = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const updateUser = useCallback((data: { name?: string }) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateUser,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
