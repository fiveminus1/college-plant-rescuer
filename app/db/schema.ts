import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const plants = sqliteTable('plants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  moisture: real('moisture'),
  thirsty: real('thirsty'),
  watered: real('watered'),
  intervalDays: integer('interval_days'),
  lastWatered: integer('last_watered'),
  lastReadingAt: integer('last_reading_at'),
});

export const plantImages = sqliteTable('plant_images', {
  id: text('id').primaryKey(),
  plantId: text('plant_id')
    .notNull()
    .references(() => plants.id, { onDelete: 'cascade' }),
  uri: text('uri').notNull(),
  createdAt: integer('created_at').notNull(),
});

export type PlantRow = typeof plants.$inferSelect;
export type PlantInsert = typeof plants.$inferInsert;
export type PlantImageRow = typeof plantImages.$inferSelect;