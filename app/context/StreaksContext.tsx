import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    
    const getTodayString = () => {
        return new Date().toISOString().split('T')[0];
    };

    const recordWatering = async (plantId: string) => {
        const today = getTodayString();

        // check if watered today
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

    const calculateStreak = (plantId: string): PlantStreak => {
        const plantWaterings = waterings
            .filter(w => w.plantId === plantId)
            .map(w => w.date)
            .sort()
            .reverse(); // Most recent first

        if (plantWaterings.length === 0) {
            return {
                plantId,
                currentStreak: 0,
                longestStreak: 0,
                lastWatered: null,
                totalWaterings: 0,
            };
        }

        const uniqueDates = [...new Set(plantWaterings)];
        const lastWatered = uniqueDates[0];

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < uniqueDates.length; i++) {
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            const expectedDateStr = expectedDate.toISOString().split('T')[0];

            if (uniqueDates[i] === expectedDateStr) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 1;

        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const currentDate = new Date(uniqueDates[i]);
            const nextDate = new Date(uniqueDates[i + 1]);
            const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        return {
            plantId,
            currentStreak,
            longestStreak,
            lastWatered,
            totalWaterings: plantWaterings.length,
        };
    };

    const getPlantStreak = (plantId: string): PlantStreak => {
        return calculateStreak(plantId);
    };

    const getAllStreaks = (): PlantStreak[] => {
        const plantIds = [...new Set(waterings.map(w => w.plantId))];
        return plantIds.map(id => calculateStreak(id));
    };


    useEffect(() => {
        loadWaterings();
    }, []);

    useEffect(() => {
        if (loaded)
            saveWaterings();
    }, [waterings, loaded]);

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