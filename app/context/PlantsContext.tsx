import { createContext, ReactNode, useContext, useState } from "react";
import { PlantType } from '../constants/plants';

export interface Plant {
  id: string;
  name: string;
  type: PlantType;
  moisture: number | null;
}

interface PlantsContextValue {
  plants: Plant[]
  selectedPlant: Plant | null;
  selectPlant: (id: string) => void;
  addPlant: (name: string, type: PlantType) => void;
  updateMoisture: (id: string, value: number) => void;
}

const PlantsContext = createContext<PlantsContextValue>(null!);

const defaultPlants: Plant[] = [
  { id: "1", name: "Greg", type: "Cactus", moisture: null },
  { id: "2", name: "Gertrude", type: "Succulent", moisture: null },
];

export function PlantsProvider({ children }: { children: ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>(defaultPlants);

  const [selectedPlantId, setSelectedPlantId] = useState("1");
  const selectedPlant = plants.find(p => p.id === selectedPlantId) ?? null;

  function selectPlant(id: string) {
    setSelectedPlantId(id);
  }

  function addPlant(name: string, type: PlantType) {
    const id = `${Date.now()}`;
    const plant: Plant = {
      id,
      name: name.trim(),
      type,
      moisture: null,
    };

    setPlants(prev => [...prev, plant]);
    setSelectedPlantId(id);
  }

  function updateMoisture(id: string, value: number){
    setPlants(prev => 
      prev.map(p => (p.id === id ? { ...p, moisture: value }: p))
    );
  }

  return (
    <PlantsContext.Provider
      value={{ plants, selectedPlant, selectPlant, addPlant, updateMoisture }}
    >
      {children}
    </PlantsContext.Provider>
  );
}

export function usePlants()  {
  return useContext(PlantsContext);
}