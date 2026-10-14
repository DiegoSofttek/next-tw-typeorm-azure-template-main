"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import { ModeToggle } from "@/components/mode-toggle";
import { Database, Palette, Shield, Upload } from "lucide-react";

// Type for user from API
interface ApiUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Fetch users from the new REST API
async function fetchUsersFromApi(): Promise<ApiUser[]> {
  const response = await fetch("/api/users", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users from API");
  }

  return response.json();
}

// Upload file to Azure Blob Storage via API
async function uploadFileToStorage(
  file: File,
  userId: string,
): Promise<{ url: string; path: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);

  const response = await fetch("/api/storage/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file to storage");
  }

  return response.json();
}

export default function ReferencePage() {
  const router = useRouter();

  // Get the authenticated user
  const { user } = useAuth();

  // Query data with React Query (REST API)
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsersFromApi,
    enabled: !!user, // Only fetch if user is authenticated
  });

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error logging out";
      toast.error("Error logging out", { description: message });
      console.error(err);
    }
  };

  // Toast example
  const showToastExample = () => {
    toast.success("Success! This is a success toast", {
      description: "This is how you show notifications to users",
    });
  };

  // Storage: file upload & retrieval
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file ?? null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return;

    setIsUploading(true);

    try {
      const result = await uploadFileToStorage(selectedFile, user.id);

      const link = document.createElement("a");
      link.href = result.url;
      link.download = selectedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSelectedFile(null);

      toast.success("File uploaded and downloaded successfully", {
        description: result.path,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "There was an error uploading the file";

      toast.error("Error uploading file", { description: message });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">Error loading users</div>;

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome, {user?.name || user?.email?.split("@")[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              Your authentication is working perfectly. This template is ready
              to use.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
            <ModeToggle />
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Reference & Examples
            </CardTitle>
            <CardDescription>
              This page lives at{" "}
              <code className="bg-muted px-1 py-0.5 rounded">/reference</code>{" "}
              and shows working examples of the template. Build your app in{" "}
              <code className="bg-muted px-1 py-0.5 rounded">
                src/app/page.tsx
              </code>
              .
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Authentication Example */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Authentication</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">
                ✅ Custom JWT-based auth via Next.js API routes
              </p>
              <p className="text-muted-foreground">
                ✅ Protected routes with{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  ProtectedRoute
                </code>
              </p>
              <p className="text-muted-foreground">
                ✅ User hook:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">useAuth()</code>
              </p>
              <div className="pt-2 text-xs">
                <p className="font-mono bg-muted p-2 rounded">
                  const &#123; user, isLoading &#125; = useAuth();
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Database Example */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Database & Queries</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">
                ✅ Prisma ORM with Azure SQL
              </p>
              <p className="text-muted-foreground">
                ✅ React Query for data fetching
              </p>
              <p className="text-muted-foreground">
                ✅ REST API via Next.js Route Handlers
              </p>
              <div className="pt-2 text-xs">
                <p className="font-mono bg-muted p-2 rounded">
                  useQuery(&#123; queryKey, queryFn &#125;)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* UI Components Example */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-lg">UI Components</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">✅ shadcn/ui components</p>
              <p className="text-muted-foreground">
                ✅ Dark mode with{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  next-themes
                </code>
              </p>
              <p className="text-muted-foreground">✅ Tailwind CSS v4</p>
              <p className="text-muted-foreground">
                ✅ Toast notifications ready
              </p>
              <div className="pt-2">
                <Button onClick={showToastExample} size="sm" variant="outline">
                  Try Toast Notification
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Storage Example */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Storage</CardTitle>
              </div>
              <CardDescription>
                Upload files to Azure Blob Storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select a file</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                size="sm"
                className="w-full sm:w-auto"
              >
                {isUploading ? "Uploading..." : "Upload file"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Data Query Example */}
        <Card>
          <CardHeader>
            <CardTitle>Example: Data Fetching with React Query</CardTitle>
            <CardDescription>
              This demonstrates how to query data from your database via REST
              API. The query automatically handles loading states, caching, and
              refetching.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="text-muted-foreground">Loading users...</div>
            )}

            {error && (
              <div className="text-destructive">
                Error loading users from API
              </div>
            )}

            {users && users.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Users in database ({users.length}):
                </p>
                <ul className="space-y-2">
                  {users.map((dbUser) => (
                    <li
                      key={dbUser.id}
                      className="flex items-center justify-between border-b pb-2 text-sm"
                    >
                      <span className="font-medium">{dbUser.name}</span>
                      <span className="text-muted-foreground">
                        {dbUser.email}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {users && users.length === 0 && (
              <div className="text-muted-foreground text-sm">
                No users found in database. Add some to see them here!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Architecture Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Architecture Overview</CardTitle>
            <CardDescription>
              This template uses a modern, scalable architecture based on
              Next.js and Azure services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">Frontend</h4>
                <p className="text-xs text-muted-foreground">
                  React components with Next.js. Uses React Query for data
                  fetching and custom hooks for auth.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  Backend (Next.js API Routes)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Route Handlers in{" "}
                  <code className="bg-muted px-1">app/api/</code> handle auth,
                  users, storage, and workflow orchestration.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Database</h4>
                <p className="text-xs text-muted-foreground">
                  Azure SQL (or local SQL Server) accessed via Prisma ORM.
                  Schema managed through migrations.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Storage</h4>
                <p className="text-xs text-muted-foreground">
                  Azure Blob Storage for files and images. Accessible via API
                  endpoint for secure uploads.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Workflows</h4>
                <p className="text-xs text-muted-foreground">
                  Azure Durable Functions for long-running tasks. Started via
                  HTTP from Next.js API routes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Ready to Build? 🚀</CardTitle>
            <CardDescription>
              Everything is set up and ready to go. Here&apos;s what you can do
              next:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <p>
                Override{" "}
                <code className="bg-background px-1 py-0.5 rounded">
                  src/app/page.tsx
                </code>{" "}
                with your app&apos;s home page
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <p>
                Add Prisma schema in{" "}
                <code className="bg-background px-1 py-0.5 rounded">
                  prisma/schema.prisma
                </code>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <p>
                Create API routes in{" "}
                <code className="bg-background px-1 py-0.5 rounded">
                  src/app/api/
                </code>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">4.</span>
              <p>
                Add database clients and repositories in{" "}
                <code className="bg-background px-1 py-0.5 rounded">
                  packages/infra/src/database/
                </code>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">5.</span>
              <p>Build your UI with the pre-installed shadcn/ui components</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">6.</span>
              <p>
                Check the documentation in{" "}
                <code className="bg-background px-1 py-0.5 rounded">/docs</code>{" "}
                for more details
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
