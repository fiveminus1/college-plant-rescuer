import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { getPlantTypeConfig, PlantType } from '../constants/plants';
import {
  addPlantImage as savePlantImage,
  getPlantImages,
  initializePlantImages,
} from '../db/plant-images';
import {
  getPlants,
  initializeDatabase,
  insertPlant,
  deletePlant as removePlant,
  updatePlant,
  updatePlantMoisture as savePlantMoisture,
} from '../db/plants';

export interface Plant {
  id: string;
  name: string;
  type: PlantType;
  moisture: number | null;
  thirsty: number;
  watered: number;
  intervalDays: number | null;
  lastWatered: number | null;
  lastReadingAt: number | null;
  images: PlantPhoto[];
}

export interface PlantPhoto {
  uri: string;
  addedAt: number;
}

interface PlantsContextValue {
  plants: Plant[]
  selectedPlant: Plant | null;
  selectPlant: (id: string) => void;
  addPlant: (name: string, type: PlantType) => Promise<string | null>;
  updatePlant: (id: string, values: Partial<Pick<Plant, 'name' | 'intervalDays' | 'thirsty' | 'watered'>>) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  updateLastWatered: (id: string, timestamp: number) => Promise<void>;
  addPlantImage: (id: string, imageUri: string) => Promise<void>;
  updateMoisture: (id: string, value: number) => Promise<void>;
}

const PlantsContext = createContext<PlantsContextValue>(null!);

const defaultPlants: Plant[] = [
  { id: "1", name: "Greg", type: "Cactus", moisture: null, thirsty: 40, watered: 70, intervalDays: null, lastWatered: null, lastReadingAt: null, images: [] },
  { id: "2", name: "Gertrude", type: "Succulent", moisture: null, thirsty: 30, watered: 60, intervalDays: null, lastWatered: null, lastReadingAt: null, images: [] },
];

export function PlantsProvider({ children }: { children: ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>(defaultPlants);
  const [selectedPlantId, setSelectedPlantId] = useState("1");
  const selectedPlant = plants.find(p => p.id === selectedPlantId) ?? null;

  useEffect(() => {
    let isMounted = true;

    async function loadPlants() {
      try {
        await initializeDatabase();
        await initializePlantImages();
        const [rows, imageRows] = await Promise.all([getPlants(), getPlantImages()]);
        let loadedPlants: Plant[];

        if (rows.length > 0) {
          loadedPlants = rows.map((row) => {
            const type = row.type as PlantType;
            const defaults = getPlantTypeConfig(type);
            const images = imageRows
              .filter((image) => image.plantId === row.id)
              .map((image) => ({ uri: image.uri, addedAt: image.createdAt }));

            return {
              id: row.id,
              name: row.name,
              type,
              moisture: row.moisture,
              thirsty: row.thirsty ?? defaults.minMoisture,
              watered: row.watered ?? defaults.maxMoisture,
              intervalDays: row.intervalDays,
              lastWatered: row.lastWatered,
              lastReadingAt: row.lastReadingAt,
              images,
            };
          });
        } else {
          await Promise.all(defaultPlants.map((plant) => insertPlant({
            id: plant.id,
            name: plant.name,
            type: plant.type,
            moisture: plant.moisture,
            thirsty: plant.thirsty,
            watered: plant.watered,
          })));
          loadedPlants = defaultPlants;
        }

        if (!isMounted) return;

        setPlants(loadedPlants);
        setSelectedPlantId((currentId) =>
          loadedPlants.some((plant) => plant.id === currentId)
            ? currentId
            : loadedPlants[0]?.id ?? currentId
        );
      } catch (error) {
        console.warn('Could not load plants from SQLite', error);
      }
    }

    loadPlants();

    return () => {
      isMounted = false;
    };
  }, []);

  function selectPlant(id: string) {
    setSelectedPlantId(id);
  }

  async function addPlant(name: string, type: PlantType) {
    const id = `${Date.now()}`;
    const plant: Plant = {
      id,
      name: name.trim(),
      type,
      moisture: null,
      thirsty: 0,
      watered: 100,
      intervalDays: null,
      lastWatered: null,
      lastReadingAt: null,
      images: [],
    };

    try {
      await insertPlant({ id, name: plant.name, type, moisture: null, thirsty: 0, watered: 100 });
    } catch (error) {
      console.warn('Could not add plant', error);
      return null;
    }

    setPlants(prev => [...prev, plant]);
    setSelectedPlantId(id);
    return id;
  }

  const savePlant = useCallback(async (id: string, values: Partial<Pick<Plant, 'name' | 'intervalDays' | 'thirsty' | 'watered'>>) => {
    await updatePlant(id, values);
    setPlants(prev => prev.map(plant => plant.id === id ? { ...plant, ...values } : plant));
  }, []);

  const deletePlant = useCallback(async (id: string) => {
    await removePlant(id);
    setPlants(prev => prev.filter(plant => plant.id !== id));
    setSelectedPlantId(current => current === id ? (plants.find(plant => plant.id !== id)?.id ?? '') : current);
  }, [plants, setSelectedPlantId]);

  const updateLastWatered = useCallback(async (id: string, timestamp: number) => {
    await updatePlant(id, { lastWatered: timestamp });
    setPlants(prev => prev.map(plant => plant.id === id ? { ...plant, lastWatered: timestamp } : plant));
  }, []);

  const updateMoisture = useCallback((id: string, value: number) => {
    return savePlantMoisture(id, value)
      .then(() => {
        setPlants(prev =>
          prev.map(p => (p.id === id ? { ...p, moisture: value, lastReadingAt: Date.now() } : p))
        );
      })
      .catch((error) => console.warn('Could not update plant moisture', error));
  }, []);

  const addPlantImage = useCallback((id: string, imageUri: string) => {
    return savePlantImage(id, imageUri)
      .then((addedAt) => {
        setPlants(prev =>
          prev.map(p => (p.id === id
            ? {
                ...p,
                images: [...p.images, { uri: imageUri, addedAt }],
              }
            : p))
        );
      })
      .catch((error) => console.warn('Could not add plant image', error));
  }, []);

  return (
    <PlantsContext.Provider
      value={{ plants, selectedPlant, selectPlant, addPlant, updatePlant: savePlant, deletePlant, updateLastWatered, addPlantImage, updateMoisture }}
    >
      {children}
    </PlantsContext.Provider>
  );
}

export function usePlants()  {
  return useContext(PlantsContext);
}