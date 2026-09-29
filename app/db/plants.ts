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
      thirsty REAL,
      watered REAL,
      interval_days INTEGER,
      last_watered INTEGER,
      last_reading_at INTEGER
    );
  `);

}

export function getPlants(): Promise<PlantRow[]> {
  return Promise.resolve(database.select().from(plants).orderBy(asc(plants.id)).all());
}

export async function insertPlant(plant: PlantInsert) {
  await database.insert(plants).values(plant);
}

export async function updatePlantMoisture(id: string, moisture: number) {
  await database.update(plants).set({ moisture, lastReadingAt: Date.now() }).where(eq(plants.id, id));
}

export async function updatePlant(id: string, values: Partial<PlantInsert>) {
  await database.update(plants).set(values).where(eq(plants.id, id));
}

export async function deletePlant(id: string) {
  await database.delete(plants).where(eq(plants.id, id));
}

