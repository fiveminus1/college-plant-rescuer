import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { PlantType } from '../constants/plants';
import {
  addPlantImage as savePlantImage,
  getPlantImages,
  initializePlantImages,
} from '../db/plant-images';
import {
  getPlants,
  initializeDatabase,
  insertPlant,
  updatePlantMoisture as savePlantMoisture,
} from '../db/plants';

export interface Plant {
  id: string;
  name: string;
  type: PlantType;
  moisture: number | null;
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
  addPlant: (name: string, type: PlantType) => Promise<void>;
  addPlantImage: (id: string, imageUri: string) => Promise<void>;
  updateMoisture: (id: string, value: number) => Promise<void>;
}

const PlantsContext = createContext<PlantsContextValue>(null!);

const defaultPlants: Plant[] = [
  { id: "1", name: "Greg", type: "Cactus", moisture: null, images: [] },
  { id: "2", name: "Gertrude", type: "Succulent", moisture: null, images: [] },
];

export function PlantsProvider({ children }: { children: ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>(defaultPlants);

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
            const images = imageRows
              .filter((image) => image.plantId === row.id)
              .map((image) => ({ uri: image.uri, addedAt: image.createdAt }));

            return {
              id: row.id,
              name: row.name,
              type: row.type as PlantType,
              moisture: row.moisture,
              images,
            };
          });
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

  async function addPlant(name: string, type: PlantType) {
    const id = `${Date.now()}`;
    const plant: Plant = {
      id,
      name: name.trim(),
      type,
      moisture: null,
      images: [],
    };

    try {
      await insertPlant({ id, name: plant.name, type, moisture: null });
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
      value={{ plants, selectedPlant, selectPlant, addPlant, addPlantImage, updateMoisture }}
    >
      {children}
    </PlantsContext.Provider>
  );
}

export function usePlants()  {
  return useContext(PlantsContext);
}