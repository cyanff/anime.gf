import {
  CreateCardBundleSchema,
  CreatePersonaBundleSchema,
  SQLiteAllSchema,
  SQLiteGetSchema,
  SQLiteRunAsTransactionSchema,
  SQLiteRunSchema,
  UpdateCardBundleSchema,
  UpdatePersonaBundleSchema,
  XFetchRequestSchema
} from "@shared/schema/ipc";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import test from "node:test";
import { z } from "zod";

const t = initTRPC.create({ isServer: true });

const sqliteRouter = t.router({
  run: t.procedure.input(SQLiteRunSchema).mutation(({ input }) => {}),
  all: t.procedure.input(SQLiteAllSchema).query(({ input }) => {}),
  get: t.procedure.input(SQLiteGetSchema).query(({ input }) => {}),
  runAsTransaction: t.procedure.input(SQLiteRunAsTransactionSchema).mutation(({ input }) => {})
});

const cardsRouter = t.router({
  create: t.procedure.input(CreateCardBundleSchema).mutation(({ input }) => {}),
  read: t.procedure.input(z.number()).query(({ input }) => {}),
  update: t.procedure.input(UpdateCardBundleSchema).mutation(({ input }) => {}),
  del: t.procedure.input(z.number()).mutation(({ input }) => {}),
  export_: t.procedure.input(z.number()).mutation(({ input }) => {}),
  import_: t.procedure.input(z.string()).mutation(({ input }) => {})
});

const personasRouter = t.router({
  create: t.procedure.input(CreatePersonaBundleSchema).mutation(({ input }) => {}),
  read: t.procedure.input(z.number()).query(({ input }) => {}),
  update: t.procedure.input(UpdatePersonaBundleSchema).mutation(({ input }) => {}),
  del: t.procedure.input(z.number()).mutation(({ input }) => {})
});

const xfetchRouter = t.router({
  post: t.procedure.input(XFetchRequestSchema).mutation(({ input }) => {}),
  get: t.procedure.input(XFetchRequestSchema).query(({ input }) => {}),
  abort: t.procedure.input(z.string()).mutation(({ input }) => {})
});

const utilsRouter = t.router({
  openURL: t.procedure.input(z.string()).mutation(({ input }) => {})
});

export const router = t.router({
  // sqlite: sqliteRouter,
  // cards: cardsRouter,
  // personas: personasRouter,
  // xfetch: xfetchRouter,
  // utils: utilsRouter
  test: t.procedure.query(() => {
    return { kind: "ok", data: "Hello World!" };
  }),
  test2: t.procedure.query(() => {
    return "Hello World!";
  }),
  test3: t.procedure.query(() => {
    return Math.random() % 2 === 0 ? { kind: "ok", data: "Hello World!" } : { kind: "error", data: "Hello World!" };
  })
});

export type AppRouter = typeof router;
