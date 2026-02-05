"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { validateEmail } from "@/lib/utils";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const emailError = validateEmail(email);
  const emailValid = !emailError;
  const canSubmit = emailValid && password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    signIn(email, password);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to sign in
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="signin-email">Email</FieldLabel>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  aria-invalid={emailTouched && !!emailError}
                />
                {emailTouched && emailError && (
                  <FieldError>{emailError}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="signin-password">Password</FieldLabel>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!canSubmit}
            >
              Sign in
            </Button>
            <div className="flex items-center gap-2 w-full">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-sm">or</span>
              <Separator className="flex-1" />
            </div>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/auth/signup">Don&apos;t have an account? Sign up</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
