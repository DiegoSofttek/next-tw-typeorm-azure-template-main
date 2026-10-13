# Project Summary: Next.js + Azure Durable Functions Template

## What's Already Implemented

This project is a **complete, enterprise-grade template** with the following pre-built components and systems. Review what is already done before adding new features.

### Core Infrastructure

- **Next.js 15 Application** — Fully configured with App Router and TypeScript
- **Tailwind CSS v4** — Styling system ready to use
- **shadcn/ui Components** — Pre-installed in `src/components/ui/`
- **Toast Notifications** — Ready via `import { toast } from "sonner";`
- **next-themes Integration** — Dark/light mode toggle
- **TanStack Query** — Server state management and caching via `src/lib/queryClient.tsx`
- **Biome** — Linting and formatting (`biome.json`)

### Monorepo Structure

```
/
├── src/                         # Next.js app (UI + API routes)
├── functions/                   # Azure Durable Functions (separate Node.js runtime)
├── packages/
│   ├── domain/                  # Pure business logic (no framework dependencies)
│   └── infra/                   # DB clients, storage clients, HTTP clients
├── prisma/                      # Prisma schema and migrations
├── docker/                      # Additional Dockerfiles (optional)
├── docker-compose.yml           # Local dev services (SQL Server + Azurite)
├── docs/                        # Architecture and usage documentation
└── scripts/                     # Local setup and DB helpers
```

### Authentication System (FULLY FUNCTIONAL)

- **Custom JWT-based auth** via Next.js API Route Handlers
- **bcryptjs** for password hashing (no native bindings — works on all platforms)
- **Login Page** — `src/app/auth/login/page.tsx`
- **Signup Page** — `src/app/auth/signup/page.tsx`
- **useAuth hook** — `src/lib/hooks/useAuth.ts` — fetches current session from `/api/auth/me`
- **ProtectedRoute component** — `src/components/protected-route/index.tsx`

### Database Layer (READY TO USE)

- **Prisma ORM** with **Azure SQL / SQL Server**
- **Schema** — `prisma/schema.prisma`
- **Prisma client singleton** — `packages/infra/src/database/index.ts`
- **Repository pattern** — `packages/infra/src/repositories/` (e.g., `UserRepository.ts`)
- **User model** already defined with `id`, `email`, `name`, `hashedPassword`, `createdAt`, `updatedAt`

### File Storage (READY TO USE)

- **Azure Blob Storage** client in `packages/infra/src/storage/index.ts`
- **Azurite** emulator for local development (started by `docker-compose`)
- Set `AZURE_STORAGE_CONNECTION_STRING=UseDevelopmentStorage=true` in `.env` for local use

### Durable Functions (READY TO RUN LOCALLY)

- Located in `/functions` — separate Node.js runtime
- Orchestrators in `functions/src/orchestrators/`
- Activities in `functions/src/activities/`
- Communicates with Next.js via HTTP (`DURABLE_FUNCTIONS_URL`)
- Started with `func start` (requires Azure Functions Core Tools)

### REST API Endpoints

| Method   | Endpoint           | Description                        |
| -------- | ------------------ | ---------------------------------- |
| `POST`   | `/api/auth/signup` | Create new user account            |
| `POST`   | `/api/auth/login`  | Authenticate user                  |
| `POST`   | `/api/auth/logout` | Clear session                      |
| `GET`    | `/api/auth/me`     | Get current authenticated user     |
| `GET`    | `/api/users`       | List all users                     |
| `GET`    | `/api/users/[id]`  | Get user by ID                     |
| `PATCH`  | `/api/users/[id]`  | Update user                        |
| `DELETE` | `/api/users/[id]`  | Delete user                        |
| `GET`    | `/api/health`      | Health check (tests DB connection) |
| `POST`   | `/api/workflows`   | Start a Durable Function workflow  |

---

## How to Run Locally

### Prerequisites

- **Node.js 18+**
- **Docker Desktop** (running)
- **Azure Functions Core Tools** v4 — for Durable Functions (`npm install -g azure-functions-core-tools@4`)

### First-Time Setup

1. Copy the environment file:

   ```bash
   cp .env.local.example .env
   ```

2. Run the setup script (cross-platform, requires Node.js):

   ```bash
   npm run setup
   ```

   This script will:
   - Start Docker services (SQL Server + Azurite)
   - Wait for services to be ready
   - Create the `myapp` database
   - Install all npm dependencies
   - Apply Prisma schema to the database (`prisma db push`)

3. Start development:

   ```bash
   npm run dev:all
   ```

   This starts **both** Next.js and Azure Durable Functions concurrently.

### Available Scripts

| Script                  | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `npm run setup`         | First-time local environment setup             |
| `npm run dev`           | Start Next.js only                             |
| `npm run dev:functions` | Start Durable Functions only                   |
| `npm run dev:all`       | Start Next.js + Durable Functions concurrently |
| `npm run build`         | Build Next.js + all packages                   |
| `npm run db:migrate`    | Run database migrations (`scripts/migrate.ts`) |
| `npm run db:seed`       | Seed the database (`scripts/seed.ts`)          |
| `npm run lint`          | Run ESLint                                     |
| `npm run test`          | Run tests with Vitest                          |

### Local Services

| Service           | URL / Port             |
| ----------------- | ---------------------- |
| Next.js app       | http://localhost:3000  |
| Durable Functions | http://localhost:7071  |
| SQL Server        | localhost:1433         |
| Azurite Blob      | http://localhost:10000 |
| Azurite Queue     | http://localhost:10001 |
| Azurite Table     | http://localhost:10002 |

---

## Environment Variables

Copy `.env.local.example` to `.env` and fill in the values.

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (SQL Server — local via Docker)
DATABASE_URL="sqlserver://localhost:1433;database=myapp;user=sa;password=YourPassword123!;encrypt=false;trustServerCertificate=true"

# Azure Storage (local via Azurite)
AZURE_STORAGE_CONNECTION_STRING=UseDevelopmentStorage=true

# Durable Functions
DURABLE_FUNCTIONS_URL=http://localhost:7071

# Azure Services (production only)
AZURE_TENANT_ID=your-tenant-id
AZURE_SUBSCRIPTION_ID=your-subscription-id
```

> **Note:** For production, `DATABASE_URL` should point to your Azure SQL instance. For local development, the Docker SQL Server is used automatically with the connection string above.

---

## Development Guidelines

### Authentication State Access

**CRITICAL:** Always use the `useAuth` hook to access the current user's authentication state. Never create custom authentication state management.

**Hook location:** `src/lib/hooks/useAuth.ts`

**Returns:**

```typescript
{
  user: AuthUser | null,        // { id, email, name }
  isAuthenticated: boolean,     // true when user is logged in
  loading: boolean              // true during initial session fetch
}
```

**✅ DO:**

```typescript
import { useAuth } from "@/lib/hooks/useAuth";

function MyComponent() {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;
  return <div>Hello, {user?.name}</div>;
}
```

**❌ DON'T:**

```typescript
// Don't call auth APIs directly in components
const [user, setUser] = useState(null);
useEffect(() => {
  fetch("/api/auth/me").then(...);
}, []);
```

---

### Protected Routes

**CRITICAL:** Wrap every page that requires authentication with `<ProtectedRoute>`. Use it at the page level.

**Component location:** `src/components/protected-route/index.tsx`

**Behavior:**

- Uses `useAuth` to check authentication state
- Redirects to `/auth/login` if not authenticated (configurable via `redirectTo` prop)
- Handles loading state automatically

**✅ DO:**

```typescript
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
      </div>
    </ProtectedRoute>
  );
}
```

**❌ DON'T:**

```typescript
// Never implement manual redirect logic
export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user) router.push("/auth/login");
  }, [user]);
  return <div>Content</div>;
}
```

---

### Database Access

**CRITICAL RULES:**

- All database access MUST go through `packages/infra/src/repositories/`
- The Prisma client is a singleton at `packages/infra/src/database/index.ts`
- API routes import repositories, never `db` directly
- React components NEVER access the database directly
- Business logic (validation, password hashing) lives in `packages/domain/src/services/`

**Layer responsibilities:**

```
React Component
  → fetch() to /api/...
      → Next.js Route Handler (src/app/api/)
          → UserService (packages/domain) — business logic
          → UserRepository (packages/infra) — DB access via Prisma
              → PrismaClient (packages/infra/src/database/index.ts)
```

**Importing the database in API routes:**

```typescript
// ✅ Import from infra package via path alias
import { UserRepository } from "@/infra/repositories/UserRepository";
import { db } from "@/infra/database";

// ❌ Never import db directly in client components
```

---

### Adding a New Database Model

**Step 1 — Add model to Prisma schema:**

```prisma
// prisma/schema.prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Step 2 — Push schema to local database:**

```bash
npx prisma db push
```

**Step 3 — Create a Repository in `packages/infra/src/repositories/`:**

```typescript
// packages/infra/src/repositories/PostRepository.ts
import { db } from "../database";

export class PostRepository {
  static async findAll() {
    return db.post.findMany();
  }

  static async create(title: string, content: string, authorId: number) {
    return db.post.create({ data: { title, content, authorId } });
  }
}
```

**Step 4 — Create API route handlers in `src/app/api/`:**

```typescript
// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PostRepository } from "@/infra/repositories/PostRepository";

export async function GET() {
  const posts = await PostRepository.findAll();
  return NextResponse.json(posts);
}
```

**Step 5 — Consume from frontend via React Query:**

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchPosts() {
  const res = await fetch("/api/posts");
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

function PostsList() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  if (isLoading) return <div>Loading...</div>;
  return <ul>{posts?.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

**❌ FORBIDDEN:**

```typescript
// Never access Prisma from a React component or client-side code
import { db } from "@/infra/database"; // ❌ Will crash in browser

// Never mix ORMs or raw queries scattered across files
import sql from "mssql"; // ❌ Not part of this template
```

---

### Adding Domain Business Logic

Business logic (validation, computations, transformations) belongs in `packages/domain/src/services/`. These must be **framework-free** — no Next.js, no Prisma.

```typescript
// packages/domain/src/services/PostService.ts
export class PostService {
  static validateTitle(title: string): boolean {
    return title.trim().length >= 3 && title.trim().length <= 200;
  }

  static sanitizeContent(content: string): string {
    return content.trim();
  }
}
```

---

### Durable Functions Workflows

**How it works:**

1. Next.js API route receives a request (`POST /api/workflows`)
2. Route uses `HttpClient` to call the Durable Functions HTTP trigger
3. Durable Functions orchestrator runs the workflow asynchronously
4. Next.js can poll status using the management URLs returned by Durable Functions

**Starting a workflow from Next.js:**

```typescript
// src/app/api/workflows/route.ts (already implemented)
import { HttpClient } from "@infra/http";

const response = await HttpClient.post(
  `${DURABLE_FUNCTIONS_URL}/api/orchestrators/${workflowName}`,
  input,
);
```

**Adding a new workflow in `/functions`:**

1. Create an orchestrator in `functions/src/orchestrators/myWorkflow.ts`
2. Create activities in `functions/src/activities/`
3. Register them in `functions/src/index.ts`
4. Start the functions runtime: `cd functions && func start`

**Local Durable Functions requirements:**

- Azure Functions Core Tools v4 installed globally
- `functions/local.settings.json` must contain `UseDevelopmentStorage=true`
- Azurite must be running (started by `docker-compose up -d`)

---

### File Storage

Use Azure Blob Storage for files and images. Locally, Azurite emulates the service.

**Storage client:** `packages/infra/src/storage/index.ts`

```typescript
import { uploadBlob } from "@infra/storage";

// Upload a file buffer to a container
const url = await uploadBlob("uploads", "user-123/photo.jpg", fileBuffer);
```

**Creating an upload API endpoint:**

```typescript
// src/app/api/storage/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadBlob } from "@/infra/storage";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadBlob("uploads", file.name, buffer);
  return NextResponse.json({ url });
}
```

---

### Using UI Components

shadcn/ui components are pre-installed in `src/components/ui/`. Import them directly:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Toast notifications
toast.success("Action completed!");
toast.error("Something went wrong", { description: "More details here" });

// Theme toggle
import { ModeToggle } from "@/components/mode-toggle";
<ModeToggle />
```

---

### Data Fetching Pattern

Always follow this pattern: **fetch to API route → API route queries DB → return JSON → React Query on client**.

```typescript
// 1. Client component fetches via React Query
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function UsersPage() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted");
    },
  });
}
```

---

## Where to Build

- **Your app home page:** `src/app/page.tsx` — this is the `/` route. Override it with your domain's main screen.
- **Reference examples:** `src/app/reference/page.tsx` — available at `/reference`. Shows auth, React Query, data table, file upload, and architecture examples. Use as a guide; do not use as your app home.
- **New pages:** Add in `src/app/[your-route]/page.tsx`
- **New API routes:** Add in `src/app/api/[your-route]/route.ts`
- **New repositories:** Add in `packages/infra/src/repositories/`
- **New domain services:** Add in `packages/domain/src/services/`
- **New UI components:** Add in `src/components/`

---

## Architecture Summary

```
Browser
  ↓ fetch()
Next.js Route Handler (src/app/api/)
  ↓ calls
Domain Services (packages/domain)    ← business logic, validation
  +
Infra Repositories (packages/infra/repositories)   ← Prisma DB queries
  ↓
Prisma Client (packages/infra/database)
  ↓
Azure SQL / SQL Server (Docker locally)

Next.js API → HTTP → Azure Durable Functions   ← long-running workflows
Next.js API → HTTP → Azure Blob Storage        ← file uploads (Azurite locally)
```

**Rules:**

- Frontend (React) → only communicates via `fetch()` to `/api/...`
- API Routes → call Domain Services and Infra Repositories
- Domain Services → pure TypeScript, no framework imports
- Repositories → only Prisma, never raw SQL
- Prisma schema → only in `prisma/schema.prisma`
- Direct DB access from client components → **never allowed**
