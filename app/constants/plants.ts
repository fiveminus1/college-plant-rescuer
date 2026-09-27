export type PlantType = 'Cactus' | 'Succulent';

export interface PlantTypeConfig {
  label: string;
  minMoisture: number;
  maxMoisture: number;
}

export const PLANT_TYPES: Record<PlantType, PlantTypeConfig> = {
  Cactus: {
    label: 'Cactus',
    minMoisture: 40,
    maxMoisture: 70,
  },
  Succulent: {
    label: 'Succulent',
    minMoisture: 30,
    maxMoisture: 60,
  },
};

export function getPlantTypeConfig(type: PlantType): PlantTypeConfig {
  return PLANT_TYPES[type];
}