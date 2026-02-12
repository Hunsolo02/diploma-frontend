"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getAnalysisHistory,
  formatHistoryDate,
  type HistoryEntry,
} from "@/lib/analysis-history";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { User, Mail, History, ChevronDown, ChevronUp } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, signOut, updateUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name !== undefined) setName(user.name ?? "");
  }, [user?.name]);

  useEffect(() => {
    if (user?.email) setHistory(getAnalysisHistory(user.email));
  }, [user?.email]);

  if (!isAuthenticated || !user) {
    router.replace("/");
    return null;
  }

  const handleSaveName = () => {
    setError(null);
    setSaved(false);
    updateUser({ name: name.trim() || undefined });
    setSaved(true);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold">Личный кабинет</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Анализ фенотипа</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Главная</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              signOut();
              router.push("/");
            }}
          >
            Выйти
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Мои данные
            </CardTitle>
            <CardDescription>
              Email и имя учётной записи. Имя можно изменить.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <Mail className="size-4" />
                  Email
                </FieldLabel>
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted/50"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-name">Имя</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSaved(false);
                    }}
                    placeholder="Введите имя"
                  />
                  <Button
                    type="button"
                    onClick={handleSaveName}
                    variant="secondary"
                  >
                    Сохранить
                  </Button>
                </div>
              </Field>
            </FieldGroup>
            {error && <FieldError className="mt-2">{error}</FieldError>}
            {saved && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Изменения сохранены.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-5" />
              История проверок
            </CardTitle>
            <CardDescription>
              Все проведённые вами анализы фенотипа. Новые — сверху.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Пока нет ни одной проверки.{" "}
                <Link href="/dashboard" className="text-primary underline">
                  Сделать первый анализ
                </Link>
              </p>
            ) : (
              <ul className="space-y-2">
                {history.map((entry) => {
                  const result = entry.result;
                  const isObj = typeof result === "object" && result !== null;
                  const phenotype = isObj && "phenotype" in result ? String(result.phenotype) : null;
                  const origin = isObj && "origin" in result ? String(result.origin) : null;
                  const isExpanded = expandedId === entry.id;
                  return (
                    <li
                      key={entry.id}
                      className="rounded-lg border border-border bg-muted/20 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : entry.id)
                        }
                        className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-xs text-muted-foreground">
                            {formatHistoryDate(entry.createdAt)}
                          </span>
                          {(phenotype || origin) && (
                            <span className="text-sm font-medium truncate">
                              {[phenotype, origin].filter(Boolean).join(" · ") ||
                                "Результат анализа"}
                            </span>
                          )}
                          {!phenotype && !origin && (
                            <span className="text-sm">
                              {typeof result === "string"
                                ? result.slice(0, 60) + (result.length > 60 ? "…" : "")
                                : "Результат анализа"}
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border px-3 py-3 bg-muted/10 text-sm">
                          {typeof result === "string" ? (
                            <p className="whitespace-pre-wrap">{result}</p>
                          ) : (
                            <div className="space-y-2">
                              {result.phenotype != null && (
                                <p>
                                  <span className="font-medium">Фенотип: </span>
                                  {String(result.phenotype)}
                                </p>
                              )}
                              {result.origin != null && (
                                <p>
                                  <span className="font-medium">Происхождение: </span>
                                  {String(result.origin)}
                                </p>
                              )}
                              {result.concentration != null && (
                                <p>
                                  <span className="font-medium">Концентрация: </span>
                                  {String(result.concentration)}
                                </p>
                              )}
                              {result.recommendations &&
                                Array.isArray(result.recommendations) && (
                                  <div>
                                    <span className="font-medium">Рекомендации: </span>
                                    <ul className="list-disc list-inside mt-1">
                                      {(result.recommendations as string[]).map(
                                        (r, i) => (
                                          <li key={i}>{r}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              {result.summary != null && (
                                <p className="text-muted-foreground">
                                  {String(result.summary)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Действия</CardTitle>
            <CardDescription>
              Перейти к анализу фенотипа или на главную страницу.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard">Анализ фенотипа</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Главная</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
