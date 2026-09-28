import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { PlantType } from '../constants/plants';
import {
  getPlants,
  initializeDatabase,
  insertPlant,
  updatePlantImage as savePlantImage,
  updatePlantMoisture as savePlantMoisture,
} from '../db/plants';

export interface Plant {
  id: string;
  name: string;
  type: PlantType;
  moisture: number | null;
  imageUri: string | null;
}

interface PlantsContextValue {
  plants: Plant[]
  selectedPlant: Plant | null;
  selectPlant: (id: string) => void;
  addPlant: (name: string, type: PlantType, imageUri?: string | null) => Promise<void>;
  updatePlantImage: (id: string, imageUri: string | null) => Promise<void>;
  updateMoisture: (id: string, value: number) => Promise<void>;
}

const PlantsContext = createContext<PlantsContextValue>(null!);

const defaultPlants: Plant[] = [
  { id: "1", name: "Greg", type: "Cactus", moisture: null, imageUri: null },
  { id: "2", name: "Gertrude", type: "Succulent", moisture: null, imageUri: null },
];

export function PlantsProvider({ children }: { children: ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>(defaultPlants);

  useEffect(() => {
    let isMounted = true;

    async function loadPlants() {
      try {
        await initializeDatabase();
        const rows = await getPlants();
        let loadedPlants: Plant[];

        if (rows.length > 0) {
          loadedPlants = rows.map((row) => ({
            id: row.id,
            name: row.name,
            type: row.type as PlantType,
            moisture: row.moisture,
            imageUri: row.imageUri,
          }));
        } else {
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

  const [selectedPlantId, setSelectedPlantId] = useState("1");
  const selectedPlant = plants.find(p => p.id === selectedPlantId) ?? null;

  function selectPlant(id: string) {
    setSelectedPlantId(id);
  }

  async function addPlant(name: string, type: PlantType, imageUri: string | null = null) {
    const id = `${Date.now()}`;
    const plant: Plant = {
      id,
      name: name.trim(),
      type,
      moisture: null,
      imageUri,
    };

    try {
      await insertPlant(plant);
    } catch (error) {
      console.warn('Could not add plant', error);
      return;
    }

    setPlants(prev => [...prev, plant]);
    setSelectedPlantId(id);
  }

  const updateMoisture = useCallback((id: string, value: number) => {
    return savePlantMoisture(id, value)
      .then(() => {
        setPlants(prev =>
          prev.map(p => (p.id === id ? { ...p, moisture: value } : p))
        );
      })
      .catch((error) => console.warn('Could not update plant moisture', error));
  }, []);

  const updatePlantImage = useCallback((id: string, imageUri: string | null) => {
    return savePlantImage(id, imageUri)
      .then(() => {
        setPlants(prev =>
          prev.map(p => (p.id === id ? { ...p, imageUri } : p))
        );
      })
      .catch((error) => console.warn('Could not update plant image', error));
  }, []);

  return (
    <PlantsContext.Provider
      value={{ plants, selectedPlant, selectPlant, addPlant, updatePlantImage, updateMoisture }}
    >
      {children}
    </PlantsContext.Provider>
  );
}

export function usePlants()  {
  return useContext(PlantsContext);
}