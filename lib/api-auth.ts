/**
 * Auth API client for backend.
 * Uses NEXT_PUBLIC_API_URL from .env.local.
 */

const BASE =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ?? ""
    : process.env.NEXT_PUBLIC_API_URL ?? "";

const api = (path: string) => `${BASE}${path}`;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth-token");
}

export type UserResponse = {
  id: number;
  email: string;
  username: string;
  name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  username: string;
  password: string;
  name?: string | null;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

function parseError(res: Response, body: string): string {
  try {
    const data = JSON.parse(body);
    const detail = data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((e: { msg?: string; loc?: unknown[] }) => e.msg ?? JSON.stringify(e.loc)).join("; ");
    }
  } catch {
    // ignore
  }
  return body || `Request failed: ${res.status}`;
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const res = await fetch(api("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseError(res, text));
  }
  return JSON.parse(text) as TokenResponse;
}

export async function register(data: RegisterRequest): Promise<UserResponse> {
  const res = await fetch(api("/api/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseError(res, text));
  }
  return JSON.parse(text) as UserResponse;
}

export async function fetchMe(token: string): Promise<UserResponse> {
  const res = await fetch(api("/api/auth/me"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseError(res, text));
  }
  return JSON.parse(text) as UserResponse;
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
