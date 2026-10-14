import Link from "next/link";

/**
 * Home page placeholder.
 *
 * Override this component with your application's landing or main screen.
 * Do not leave the home page empty — replace this content when building the app.
 *
 * Working examples (auth, React Query, server actions, UI) are in:
 * src/app/reference/page.tsx — also available at /reference
 */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-semibold text-foreground mb-2">
        Override this component
      </h1>
      <p className="text-muted-foreground max-w-md mb-6">
        This is the template home page. Replace the content of{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          src/app/page.tsx
        </code>{" "}
        with your application&apos;s main screen. Do not leave it empty.
      </p>
      <p className="text-sm text-muted-foreground">
        See working examples at{" "}
        <Link
          href="/reference"
          className="text-primary underline underline-offset-2 hover:no-underline"
        >
          /reference
        </Link>
        .
      </p>
    </div>
  );
}
