import * as SQLite from 'expo-sqlite';
import { asc, drizzle } from 'drizzle-orm/expo-sqlite';
import { plantImages, PlantImageRow } from './schema';

const sqliteDatabase = SQLite.openDatabaseSync('college-plant-rescuer.db');
const database = drizzle(sqliteDatabase);

export async function initializePlantImages() {
  await sqliteDatabase.execAsync(`
    CREATE TABLE IF NOT EXISTS plant_images (
      id TEXT PRIMARY KEY NOT NULL,
      plant_id TEXT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
      uri TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
}

export function getPlantImages(): Promise<PlantImageRow[]> {
  return database.select().from(plantImages).orderBy(asc(plantImages.id)).all();
}

export async function addPlantImage(plantId: string, uri: string) {
  const createdAt = Date.now();

  await database.insert(plantImages).values({
    id: `${createdAt}-${Math.random().toString(36).slice(2)}`,
    plantId,
    uri,
    createdAt,
  });

  return createdAt;
}
