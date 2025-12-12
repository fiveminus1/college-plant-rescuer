import { createContext, ReactNode, useContext, useState } from "react";

export interface Plant {
  id: string;
  name: string;
  type: "Cactus" | "Succulent";
  moisture: number | null;
  minMoisture: number;
  maxMoisture: number;
}

interface PlantsContextValue {
  plants: Plant[]
  selectedPlant: Plant | null;
  selectPlant: (id: string) => void;
  updateMoisture: (id: string, value: number) => void;
}

const PlantsContext = createContext<PlantsContextValue>(null!);

const defaultPlants: Plant[] = [
  { id: "1", name: "Greg", type: "Cactus", moisture: null, minMoisture: 40, maxMoisture: 70 }, // cactus, adjust moisture minMoisture and maxMoisture later
  { id: "2", name: "Gertrude", type: "Succulent", moisture: null, minMoisture: 30, maxMoisture: 60 },
];

export function PlantsProvider({ children }: { children: ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>(defaultPlants);

  const [selectedPlantId, setSelectedPlantId] = useState("1");
  const selectedPlant = plants.find(p => p.id === selectedPlantId) ?? null;

  function selectPlant(id: string) {
    setSelectedPlantId(id);
  }

  function updateMoisture(id: string, value: number){
    setPlants(prev => 
      prev.map(p => (p.id === id ? { ...p, moisture: value }: p))
    );
  }

  return (
    <PlantsContext.Provider
      value={{ plants, selectedPlant, selectPlant, updateMoisture }}
    >
      {children}
    </PlantsContext.Provider>
  );
}

export function usePlants()  {
  return useContext(PlantsContext);
}