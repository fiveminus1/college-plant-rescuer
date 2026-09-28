import * as SQLite from 'expo-sqlite';
import { asc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { plants, PlantInsert, PlantRow } from './schema';

const sqliteDatabase = SQLite.openDatabaseSync('college-plant-rescuer.db');
const database = drizzle(sqliteDatabase);

export async function initializeDatabase() {
  await sqliteDatabase.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS plants (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      moisture REAL,
      image_uri TEXT
    );
  `);
}

export function getPlants(): Promise<PlantRow[]> {
  return database.select().from(plants).orderBy(asc(plants.id)).all();
}

export async function insertPlant(plant: PlantInsert) {
  await database.insert(plants).values(plant);
}

export async function updatePlantMoisture(id: string, moisture: number) {
  await database.update(plants).set({ moisture }).where(eq(plants.id, id));
}

export async function updatePlantImage(id: string, imageUri: string | null) {
  await database.update(plants).set({ imageUri }).where(eq(plants.id, id));
}