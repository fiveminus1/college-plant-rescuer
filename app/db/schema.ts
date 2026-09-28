import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const plants = sqliteTable('plants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  moisture: real('moisture'),
  imageUri: text('image_uri'),
});

export type PlantRow = typeof plants.$inferSelect;
export type PlantInsert = typeof plants.$inferInsert;