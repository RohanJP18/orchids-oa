import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const DatabaseManager_tsx = pgTable('DatabaseManager_tsx', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type DatabaseManager.tsx = typeof DatabaseManager_tsx.$inferSelect;
export type NewDatabaseManager.tsx = typeof DatabaseManager_tsx.$inferInsert;
