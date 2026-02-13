/**
 * API client for phenotype analysis and other backend calls.
 * Set NEXT_PUBLIC_API_URL in .env.local for your backend base URL.
 * If empty, requests go to relative /api paths (Next.js API routes).
 */

import { getAuthHeaders } from "./api-auth";

const BASE =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ?? ""
    : process.env.NEXT_PUBLIC_API_URL ?? "";

const api = (path: string) => `${BASE}${path}`;

function parseError(res: Response, body: string): string {
  try {
    const data = JSON.parse(body);
    const detail = data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((e: { msg?: string; loc?: unknown[] }) => e.msg ?? JSON.stringify(e.loc))
        .join("; ");
    }
  } catch {
    // ignore
  }
  return body || `Request failed: ${res.status}`;
}

export type AnalysisQuestion = {
  id: string;
  label: string;
  type: "text" | "select" | "number";
  options?: string[] | null;
};

export type AnalyzeResponse = {
  sessionId: string;
  questions: AnalysisQuestion[];
};

export type SubmitAnswersResponse = {
  result: Record<string, unknown> | string;
};

export async function analyzeImage(imageDataUrl: string): Promise<AnalyzeResponse> {
  const res = await fetch(api("/api/analyze"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ image: imageDataUrl }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseError(res, text));
  }
  return JSON.parse(text) as AnalyzeResponse;
}

export async function submitAnswers(
  sessionId: string,
  answers: Record<string, string | number>
): Promise<SubmitAnswersResponse> {
  const res = await fetch(api("/api/analyze/answers"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ sessionId, answers }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseError(res, text));
  }
  return JSON.parse(text) as SubmitAnswersResponse;
}
