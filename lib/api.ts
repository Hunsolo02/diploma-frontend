/**
 * API client for phenotype analysis.
 * Set NEXT_PUBLIC_API_URL in .env.local for your backend base URL.
 * If empty, requests go to relative /api paths (Next.js API routes).
 */

const BASE = typeof window !== "undefined" 
  ? (process.env.NEXT_PUBLIC_API_URL ?? "") 
  : process.env.NEXT_PUBLIC_API_URL ?? "";

const api = (path: string) => `${BASE}${path}`;

export type AnalysisQuestion = {
  id: string;
  label: string;
  type: "text" | "select" | "number";
  options?: string[];
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageDataUrl }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Analyze failed: ${res.status}`);
  }
  return res.json();
}

export async function submitAnswers(
  sessionId: string,
  answers: Record<string, string | number>
): Promise<SubmitAnswersResponse> {
  const res = await fetch(api("/api/analyze/answers"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, answers }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Submit failed: ${res.status}`);
  }
  return res.json();
}
