"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { analyzeImage, submitAnswers, type AnalysisQuestion } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AnalysisQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [result, setResult] = useState<Record<string, unknown> | string | null>(
    null
  );

  const { user, isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.replace("/");
    return null;
  }

  const handleFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
  };

  const handleRemove = () => {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeImage(image);
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setAnswers(
        Object.fromEntries(data.questions.map((q) => [q.id, ""]))
      );
      setQuestionsOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка анализа");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnswerChange = (id: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmitAnswers = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await submitAnswers(sessionId, answers);
      setResult(
        typeof data.result === "string" ? data.result : (data.result as Record<string, unknown>)
      );
      setQuestionsOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка отправки ответов");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (q: AnalysisQuestion) => {
    if (q.type === "select" && q.options) {
      return (
        <Field key={q.id}>
          <FieldLabel htmlFor={q.id}>{q.label}</FieldLabel>
          <Select
            value={String(answers[q.id] ?? "")}
            onValueChange={(v) => handleAnswerChange(q.id, v)}
          >
            <SelectTrigger id={q.id}>
              <SelectValue placeholder="Выберите..." />
            </SelectTrigger>
            <SelectContent>
              {q.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      );
    }
    if (q.type === "number") {
      return (
        <Field key={q.id}>
          <FieldLabel htmlFor={q.id}>{q.label}</FieldLabel>
          <Input
            id={q.id}
            type="number"
            value={answers[q.id] ?? ""}
            onChange={(e) =>
              handleAnswerChange(q.id, e.target.value ? Number(e.target.value) : "")
            }
          />
        </Field>
      );
    }
    return (
      <Field key={q.id}>
        <FieldLabel htmlFor={q.id}>{q.label}</FieldLabel>
        <Textarea
          id={q.id}
          value={String(answers[q.id] ?? "")}
          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
          rows={3}
        />
      </Field>
    );
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6">
      <header className="flex items-center justify-between mb-8">
        <p className="text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">{user?.email}</span>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              signOut();
              router.push("/");
            }}
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full gap-6">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Phenotype analysis</CardTitle>
            <CardDescription>
              Analyze your phenotype — please add the face picture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            {image ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30 aspect-square max-h-80 mx-auto">
                  <img
                    src={image}
                    alt="Face for analysis"
                    className="w-full h-full object-contain"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Анализ...
                      </>
                    ) : (
                      "Анализировать"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change image
                  </Button>
                  <Button variant="ghost" onClick={handleRemove}>
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "w-full rounded-lg border-2 border-dashed py-16 px-6 transition-colors",
                  "hover:border-primary/50 hover:bg-muted/30",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isDragging && "border-primary bg-muted/50"
                )}
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-60"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <span className="text-sm font-medium">
                    {isDragging ? "Drop image here" : "Click or drag image here"}
                  </span>
                  <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
                </div>
              </button>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Результат анализа</CardTitle>
              <CardDescription>
                Результаты на основе вашего фото и ответов
              </CardDescription>
            </CardHeader>
            <CardContent>
              {typeof result === "string" ? (
                <p className="text-sm whitespace-pre-wrap">{result}</p>
              ) : (
                <div className="space-y-4 text-sm">
                  {result.phenotype ? (
                    <div>
                      <p className="font-medium mb-1">Фенотип</p>
                      <p className="text-muted-foreground">{String(result.phenotype)}</p>
                    </div>
                  ) : null}
                  {result.origin ? (
                    <div>
                      <p className="font-medium mb-1">Предположительное происхождение</p>
                      <p className="text-muted-foreground">{String(result.origin)}</p>
                    </div>
                  ) : null}
                  {result.concentration ? (
                    <div>
                      <p className="font-medium mb-1">Наибольшая концентрация</p>
                      <p className="text-muted-foreground">{String(result.concentration)}</p>
                    </div>
                  ) : null}
                  {result.recommendations && Array.isArray(result.recommendations) ? (
                    <div>
                      <p className="font-medium mb-2">Рекомендации:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {(result.recommendations as string[]).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {result.summary ? (
                    <p className="text-muted-foreground">{String(result.summary)}</p>
                  ) : null}
                  <pre className="text-xs bg-muted/50 p-3 rounded-md overflow-auto max-h-48">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setResult(null)}
              >
                Новый анализ
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={questionsOpen} onOpenChange={setQuestionsOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Дополнительные вопросы</DialogTitle>
            <DialogDescription>
              Ответьте на несколько вопросов для более точного анализа
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitAnswers();
            }}
            className="space-y-4"
          >
            <FieldGroup>{questions.map(renderQuestion)}</FieldGroup>
            {error && (
              <FieldError>{error}</FieldError>
            )}
            <DialogFooter showCloseButton={false}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuestionsOpen(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  "Отправить"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
