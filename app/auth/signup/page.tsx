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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { validateEmail } from "@/lib/utils";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_RULES = {
  minLength: (p: string) => p.length >= PASSWORD_MIN_LENGTH,
  hasUppercase: (p: string) => /[A-Z]/.test(p),
  hasLowercase: (p: string) => /[a-z]/.test(p),
  hasNumber: (p: string) => /\d/.test(p),
};

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (!PASSWORD_RULES.minLength(password))
    errors.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
  if (!PASSWORD_RULES.hasUppercase(password))
    errors.push("At least one uppercase letter");
  if (!PASSWORD_RULES.hasLowercase(password))
    errors.push("At least one lowercase letter");
  if (!PASSWORD_RULES.hasNumber(password))
    errors.push("At least one number");
  return errors;
}

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [name, setName] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    passwordRepeat: false,
  });
  const { signIn } = useAuth();
  const router = useRouter();

  const emailError = validateEmail(email);
  const emailValid = !emailError;
  const passwordErrors = validatePassword(password);
  const passwordValid = passwordErrors.length === 0;
  const passwordsMatch = password === passwordRepeat;
  const passwordRepeatError =
    touched.passwordRepeat && passwordRepeat && !passwordsMatch
      ? "Passwords do not match"
      : null;

  const canSubmit =
    name &&
    emailValid &&
    email &&
    passwordValid &&
    passwordsMatch &&
    passwordRepeat.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    signIn(email, password, name);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="signup-name">Name</FieldLabel>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={touched.email && !!emailError}
                />
                {touched.email && emailError && (
                  <FieldError>{emailError}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <FieldDescription>
                  Min {PASSWORD_MIN_LENGTH} chars, uppercase, lowercase, number
                </FieldDescription>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() =>
                    setTouched((t) => ({ ...t, password: true }))
                  }
                  aria-invalid={touched.password && !passwordValid}
                />
                {touched.password && !passwordValid && (
                  <FieldError
                    errors={passwordErrors.map((m) => ({ message: m }))}
                  />
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-password-repeat">
                  Repeat password
                </FieldLabel>
                <Input
                  id="signup-password-repeat"
                  type="password"
                  placeholder="••••••••"
                  value={passwordRepeat}
                  onChange={(e) => setPasswordRepeat(e.target.value)}
                  onBlur={() =>
                    setTouched((t) => ({ ...t, passwordRepeat: true }))
                  }
                  aria-invalid={!!passwordRepeatError}
                />
                {passwordRepeatError && (
                  <FieldError>{passwordRepeatError}</FieldError>
                )}
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
              Sign up
            </Button>
            <div className="flex items-center gap-2 w-full">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-sm">or</span>
              <Separator className="flex-1" />
            </div>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/auth">Already have an account? Sign in</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
