import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-6 py-12">
      <main className="w-full max-w-3xl">
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Shadcn UI is ready</CardTitle>
            <CardDescription>
              Use the new shadcn UI components to build your interface faster.
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              <Badge>New</Badge>
              <Badge variant="secondary">Toolkit</Badge>
              <Badge variant="outline">UI</Badge>
              <Badge variant="muted">v0.1</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                The project now includes a shared utility, theming tokens, and
                starter components like buttons, inputs, and badges.
              </p>
              <p>
                Compose these building blocks to quickly assemble forms, cards,
                and dashboards.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="title">
                  Project title
                </label>
                <Input id="title" placeholder="Enter a name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="owner">
                  Owner
                </label>
                <Input id="owner" placeholder="Add a teammate" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="notes">
                Notes
              </label>
              <Textarea id="notes" placeholder="Share updates with the team..." />
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3">
            <Button variant="link" asChild>
              <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">
                Browse components
              </a>
            </Button>
            <Button variant="destructive">Delete draft</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
