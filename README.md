# AcmePDF

> **DISCLAIMER:** This is a sanitized version of a production project — client-identifying details and secrets have been removed. Original project is live in production. 
> It is intended to showcase architectural decision-making, code quality, and the ability to solve complex technical problems.

AcmePDF is a scalable web application built with a modern TypeScript stack, focused on robust PDF manipulation, secure API architecture, and excellent user experience. 

## Technical Highlights

The project tackles several complex technical challenges, resulting in a highly optimized architecture:

1. **Turborepo Monorepo Architecture:**
   The project is organized into a monorepo utilizing Turborepo to efficiently manage multiple packages (`@acmepdf/api`, `@acmepdf/env`) and applications (landing page, editor SPA). This structure establishes strict module boundaries, enforces code sharing (like configurations and environment validations) while keeping build times extremely low via caching.

2. **End-to-End Type Safety with tRPC & Zod:**
   The backend (Express) and frontend communicate through tRPC, ensuring that API contracts are strictly typed across the entire stack. Inputs are validated rigorously with Zod, preventing invalid data mutations, avoiding brittle REST endpoints, and creating a unified developer experience.

3. **Complex Third-Party API Integration (Stirling-PDF):**
   Robust integration with external services (such as the Stirling-PDF backend) for heavy-lifting tasks. This includes secure transmission of files, streaming large responses back to the client, and graceful handling of failure modes without degrading the core application performance.

## Tech Stack

- **Monorepo:** Turborepo, Bun workspaces
- **Frontend:** React, Vite, TailwindCSS (for the editor SPA), Astro (for landing pages)
- **Backend:** Express.js, tRPC, Bun runtime
- **Validation:** Zod

## Getting Started

First, install the dependencies:

```bash
bun install
```

Run the development server:

```bash
bun run dev
```

## Project Structure

```
AcmePDF/
├── apps/
│   ├── editor/          # Frontend application (React + Vite SPA)
│   └── landing-page/    # Astro based Landing Page
├── packages/
│   ├── api/             # Backend API (Express, tRPC)
│   ├── config/          # Shared configurations
│   └── env/             # Environment validation logic
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run check-types`: Check TypeScript types across all apps
