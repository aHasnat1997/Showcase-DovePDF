FROM oven/bun:1.3.9 AS base
WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json bun.lock turbo.json tsconfig.json bts.jsonc ./
COPY apps/editor/package.json apps/editor/package.json
COPY apps/landing-page/package.json apps/landing-page/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/env/package.json packages/env/package.json
COPY packages/config/package.json packages/config/package.json

# Install all workspace dependencies
RUN bun install --frozen-lockfile --ignore-scripts

# Copy source and build all required apps/packages
COPY . .
RUN bun run build

# Run API from its package directory so relative paths in server.ts resolve correctly
WORKDIR /app/packages/api
EXPOSE 5050
CMD ["bun", "src/server.ts"]
