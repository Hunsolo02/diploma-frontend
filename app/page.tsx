"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  if (isAuthenticated && user) {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-3xl font-semibold">Welcome</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Get started by signing in or creating an account.
      </p>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/auth">Sign in</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/auth/signup">Sign up</Link>
        </Button>
      </div>
    </div>
  );
}
