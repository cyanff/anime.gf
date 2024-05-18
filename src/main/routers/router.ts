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
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

// TODO: sqlite inputs should be declared as a schema
const sqliteRouter = t.router({
  run: t.procedure.input(SQLiteRunSchema).mutation(({ input }) => {
    // Implement your logic here
  }),
  all: t.procedure.input(SQLiteAllSchema).query(({ input }) => {
    // Implement your logic here
  }),
  get: t.procedure.input(SQLiteGetSchema).query(({ input }) => {
    // Implement your logic here
  }),
  runAsTransaction: t.procedure.input(SQLiteRunAsTransactionSchema).mutation(({ input }) => {
    // Implement your logic here
  })
});

const cardsRouter = t.router({
  create: t.procedure.input(CreateCardBundleSchema).mutation(({ input }) => {
    // Implement your logic here
  }),
  read: t.procedure.input(z.number()).query(({ input }) => {
    // Implement your logic here
  }),
  update: t.procedure.input(UpdateCardBundleSchema).mutation(({ input }) => {
    // Implement your logic here
  }),
  del: t.procedure.input(z.number()).mutation(({ input }) => {
    // Implement your logic here
  }),
  export_: t.procedure.input(z.number()).mutation(({ input }) => {
    // Implement your logic here
  }),
  import_: t.procedure.input(z.string()).mutation(({ input }) => {
    // Implement your logic here
  })
});

const personasRouter = t.router({
  create: t.procedure.input(CreatePersonaBundleSchema).mutation(({ input }) => {
    // Implement your logic here
  }),
  read: t.procedure.input(z.number()).query(({ input }) => {
    // Implement your logic here
  }),
  update: t.procedure.input(UpdatePersonaBundleSchema).mutation(({ input }) => {
    // Implement your logic here
  }),
  del: t.procedure.input(z.number()).mutation(({ input }) => {
    // Implement your logic here
  })
});

const xfetchRouter = t.router({
  post: t.procedure.input(XFetchRequestSchema).mutation(({ input }) => {
    // Implement your logic here
  }),
  get: t.procedure.input(XFetchRequestSchema).query(({ input }) => {
    // Implement your logic here
  }),
  abort: t.procedure.input(z.string()).mutation(({ input }) => {
    // Implement your logic here
  })
});

const utilsRouter = t.router({
  openURL: t.procedure.input(z.string()).mutation(({ input }) => {
    // Implement your logic here
  })
});

export const router = t.router({
  sqlite: sqliteRouter,
  cards: cardsRouter,
  personas: personasRouter,
  xfetch: xfetchRouter,
  utils: utilsRouter
});
