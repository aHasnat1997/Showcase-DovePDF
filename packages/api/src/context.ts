import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export async function createContext(_opts: CreateExpressContextOptions) {
  void _opts;
  return {};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
