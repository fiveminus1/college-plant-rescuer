import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { PlantType } from '../constants/plants';

const PLANTS_STORAGE_KEY = '@college-plant-rescuer/plants';

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
  addPlant: (name: string, type: PlantType, imageUri?: string | null) => void;
  updatePlantImage: (id: string, imageUri: string | null) => void;
  updateMoisture: (id: string, value: number) => void;
}

const PlantsContext = createContext<PlantsContextValue>(null!);

const defaultPlants: Plant[] = [
  { id: "1", name: "Greg", type: "Cactus", moisture: null, imageUri: null },
  { id: "2", name: "Gertrude", type: "Succulent", moisture: null, imageUri: null },
];

export function PlantsProvider({ children }: { children: ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>(defaultPlants);
  const [hasLoadedPlants, setHasLoadedPlants] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PLANTS_STORAGE_KEY)
      .then((storedPlants) => {
        if (storedPlants) {
          setPlants(JSON.parse(storedPlants));
        }
      })
      .catch((error) => console.warn('Could not load plants', error))
      .finally(() => setHasLoadedPlants(true));
  }, []);

  useEffect(() => {
    if (!hasLoadedPlants) return;

    AsyncStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(plants)).catch((error) => {
      console.warn('Could not save plants', error);
    });
  }, [hasLoadedPlants, plants]);

  const [selectedPlantId, setSelectedPlantId] = useState("1");
  const selectedPlant = plants.find(p => p.id === selectedPlantId) ?? null;

  function selectPlant(id: string) {
    setSelectedPlantId(id);
  }

  function addPlant(name: string, type: PlantType, imageUri: string | null = null) {
    const id = `${Date.now()}`;
    const plant: Plant = {
      id,
      name: name.trim(),
      type,
      moisture: null,
      imageUri,
    };

    setPlants(prev => [...prev, plant]);
    setSelectedPlantId(id);
  }

  const updateMoisture = useCallback((id: string, value: number) => {
    setPlants(prev => 
      prev.map(p => (p.id === id ? { ...p, moisture: value }: p))
    );
  }, []);

  const updatePlantImage = useCallback((id: string, imageUri: string | null) => {
    setPlants(prev =>
      prev.map(p => (p.id === id ? { ...p, imageUri } : p))
    );
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