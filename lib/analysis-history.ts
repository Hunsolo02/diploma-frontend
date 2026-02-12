/**
 * History of phenotype analyses per user (stored in localStorage).
 */

const STORAGE_PREFIX = "analysis-history-";
const MAX_ENTRIES = 100;

export type HistoryEntry = {
  id: string;
  createdAt: string;
  result: Record<string, unknown> | string;
};

function storageKey(email: string): string {
  return `${STORAGE_PREFIX}${email}`;
}

export function getAnalysisHistory(email: string): HistoryEntry[] {
  if (typeof window === "undefined" || !email) return [];
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addAnalysisEntry(
  email: string,
  sessionId: string,
  result: Record<string, unknown> | string
): void {
  if (typeof window === "undefined" || !email) return;
  const entry: HistoryEntry = {
    id: sessionId,
    createdAt: new Date().toISOString(),
    result,
  };
  const history = getAnalysisHistory(email);
  history.unshift(entry);
  const trimmed = history.slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(storageKey(email), JSON.stringify(trimmed));
  } catch (e) {
    console.warn("Failed to save analysis history", e);
  }
}

export function formatHistoryDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
