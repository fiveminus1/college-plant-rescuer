import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateStreak, getTodayString } from "../helpers/streaks";

const STORAGE_KEY = '@plant_waterings';

export interface PlantStreak {
    plantId: string;
    currentStreak: number;
    longestStreak: number;
    lastWatered: string | null;
    totalWaterings: number;
}

export interface WateringRecord {
    plantId: string;
    date: string;
}

interface StreakContextType {
    recordWatering: (plantId: string) => Promise<void>;
    getPlantStreak: (plantId: string) => PlantStreak;
    getAllStreaks: () => PlantStreak[];
    hasWateredToday: (plantId: string) => boolean;
}

const StreaksContext = createContext<StreakContextType | undefined>(undefined);

export function StreaksProvider({ children }: { children: React.ReactNode }) {
    const [waterings, setWaterings] = useState<WateringRecord[]>([]);
    const [loaded, setLoaded] = useState(false);

    const loadWaterings = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setWaterings(JSON.parse(stored));
            }
            setLoaded(true);
        } catch (error) {
            console.error('Failed to load waterings:', error);
            setLoaded(true);
        }
    }

    const saveWaterings = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(waterings));
        } catch (error) {
            console.error('Failed to save waterings:', error);
        }
    }

    useEffect(() => {
        loadWaterings();
    }, []);

    useEffect(() => {
        if (loaded)
            saveWaterings();
    }, [waterings, loaded]);


    const recordWatering = async (plantId: string) => {
        const today = getTodayString();

        const alreadyWatered = waterings.some(
            w => w.plantId === plantId && w.date === today
        );

        if (!alreadyWatered) {
            setWaterings(prev => [...prev, { plantId, date: today }]);
        }
    };

    const hasWateredToday = (plantId: string): boolean => {
        const today = getTodayString();
        return waterings.some(w => w.plantId === plantId && w.date === today);
    };
   

    const getPlantStreak = (plantId: string): PlantStreak => {
        return calculateStreak(waterings, plantId);
    };

    const getAllStreaks = (): PlantStreak[] => {
        const plantIds = [...new Set(waterings.map(w => w.plantId))];
        return plantIds.map(id => calculateStreak(waterings, id));
    };


    return (
        <StreaksContext.Provider
            value={{
                recordWatering,
                getPlantStreak,
                getAllStreaks,
                hasWateredToday,
            }}
        >
            {children}
        </StreaksContext.Provider>
    );
}

export function useStreaks() {
    const context = useContext(StreaksContext);
    if (!context) {
        throw new Error('must be used within StreaksProvider');
    }
    return context;
}