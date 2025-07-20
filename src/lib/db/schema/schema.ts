import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const schema = pgTable('schema', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Schema = typeof schema.$inferSelect;
export type NewSchema = typeof schema.$inferInsert;
