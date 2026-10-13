# Next.js + Azure Durable Functions — Enterprise Template

A reusable, production-oriented starter for full-stack applications on Azure.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Prisma ORM · Azure SQL · Azure Durable Functions · Azure Blob Storage · TanStack Query

---

## Overview

This template implements a **Next.js + Azure Durable Functions** architecture designed to be extended for different business domains. Next.js acts as the Backend-for-Frontend (BFF) and API layer. Long-running or retryable workflows are offloaded to Azure Durable Functions running as a separate runtime.

### Key design principles

- Next.js handles all UI and synchronous API routes (`app/api`)
- Azure Durable Functions handle async/retryable workflows (called via HTTP from Next.js)
- Prisma ORM with Azure SQL for relational data — one shared connection strategy
- Azure Blob Storage (Azurite locally) for file storage
- Monorepo structure: `packages/domain` (pure business logic) and `packages/infra` (DB, storage, HTTP clients)

---

## Project Structure

```
/
├── src/                        # Next.js application (UI + API routes)
│   ├── app/                    # App Router pages and API handlers
│   │   ├── api/                # Route handlers (auth, users, workflows, health)
│   │   ├── auth/               # Login and signup pages
│   │   └── reference/          # Component and pattern reference page
│   ├── components/             # Reusable UI components (shadcn/ui, data-table, etc.)
│   ├── hooks/                  # Shared React hooks
│   └── lib/                    # Utilities, auth hooks, query client
├── functions/                  # Azure Durable Functions (Node.js)
│   ├── src/
│   │   ├── orchestrators/      # Durable orchestrator functions
│   │   └── activities/         # Activity functions
│   ├── host.json
│   └── local.settings.json
├── packages/
│   ├── domain/                 # Pure business logic (framework-free)
│   │   └── src/services/       # Domain services (e.g. UserService)
│   └── infra/                  # Infrastructure clients
│       └── src/
│           ├── database/       # Prisma client singleton
│           ├── repositories/   # Data access repositories
│           ├── storage/        # Azure Blob Storage client
│           └── http/           # HTTP client for Durable Functions
├── prisma/
│   └── schema.prisma           # Prisma schema (SQL Server provider)
├── docker-compose.yml          # SQL Server + Azurite local services
├── docs/                       # Architecture and usage documentation
└── scripts/                    # Local setup and database init scripts
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- Docker Desktop
- Azure Functions Core Tools v4: `npm install -g azure-functions-core-tools@4`

### 1. Install dependencies

```bash
cd next-tw-typeorm-azure-template
npm install
cd functions && npm install && cd ..
```

### 2. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

For local development the defaults work out of the box with Docker.

### 3. Start local services

```bash
npm run setup
```

This starts SQL Server and Azurite via Docker Compose, waits for them to be ready, and runs the Prisma migration to create the database schema.

### 4. Start the application

```bash
npm run dev:all
```

This runs Next.js and Azure Functions Core Tools concurrently.

| Service         | URL                    |
| --------------- | ---------------------- |
| Next.js app     | http://localhost:3000  |
| Azure Functions | http://localhost:7071  |
| Azurite Blob    | http://localhost:10000 |
| SQL Server      | localhost:1433         |

Open [http://localhost:3000/reference](http://localhost:3000/reference) to explore available UI components and test auth flows.

---

## Environment Variables

| Variable                          | Description                         | Local default                                                                               |
| --------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                    | Prisma SQL Server connection string | `sqlserver://localhost:1433;database=myapp;user=sa;password=YourPassword123!;encrypt=false` |
| `AZURE_STORAGE_CONNECTION_STRING` | Blob Storage connection string      | `UseDevelopmentStorage=true`                                                                |
| `DURABLE_FUNCTIONS_BASE_URL`      | Base URL for Durable Functions      | `http://localhost:7071`                                                                     |
| `JWT_SECRET`                      | Secret for JWT token signing        | any random string                                                                           |
| `AZURITE_ACCOUNT_NAME`            | Azurite storage account name        | `devstoreaccount1`                                                                          |
| `AZURITE_ACCOUNT_KEY`             | Azurite storage account key         | (see `.env.local.example`)                                                                  |

---

## Available Scripts

| Script                  | Description                                |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Start Next.js dev server                   |
| `npm run dev:functions` | Start Azure Functions (`func start`)       |
| `npm run dev:all`       | Start Next.js + Functions concurrently     |
| `npm run setup`         | Start Docker services and run DB migration |
| `npm run build`         | Build Next.js and all packages             |
| `npm run db:migrate`    | Run Prisma migrations                      |
| `npm run db:seed`       | Seed the database                          |
| `npm test`              | Run Vitest tests                           |

---

## API Endpoints

| Method | Path               | Description                         |
| ------ | ------------------ | ----------------------------------- |
| GET    | `/api/health`      | Health check (DB connectivity)      |
| POST   | `/api/auth/signup` | Register a new user                 |
| POST   | `/api/auth/login`  | Authenticate and receive JWT        |
| GET    | `/api/users`       | List all users (protected)          |
| GET    | `/api/users/[id]`  | Get user by ID (protected)          |
| POST   | `/api/workflows`   | Trigger a Durable Function workflow |

---

## Architecture

```
Browser → Next.js (UI + API Routes)
               │
               ├── packages/domain    (business logic)
               ├── packages/infra/db  (Prisma → Azure SQL)
               ├── packages/infra/storage (Azure Blob)
               └── HTTP → Azure Durable Functions
                              │
                         Orchestrators → Activities
```

Next.js **never** imports Durable Functions code directly. Communication is always over HTTP (`fetch`).

---

## Documentation

- **[docs/TemplateUsageInstructions.md](docs/TemplateUsageInstructions.md)** — Full conventions, patterns, and extension guide (adding models, repositories, domain services, UI components, workflows).

---

## Learn More

- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [Azure Durable Functions](https://learn.microsoft.com/azure/azure-functions/durable/durable-functions-overview)
- [Azure Blob Storage](https://learn.microsoft.com/azure/storage/blobs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com)
