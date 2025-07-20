import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const index = pgTable('index', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Index = typeof index.$inferSelect;
export type NewIndex = typeof index.$inferInsert;
