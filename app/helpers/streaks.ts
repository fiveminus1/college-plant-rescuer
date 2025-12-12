import { usePlants } from "@/context/PlantsContext";
import { PlantStreak, WateringRecord } from "@/context/StreaksContext";

export const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
};

export const calculateStreak = (waterings: WateringRecord[], plantId: string): PlantStreak => {
    const plantWaterings = waterings
        .filter(w => w.plantId === plantId)
        .map(w => w.date)
        .sort()
        .reverse(); 

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

export const getLongestStreak = (allStreaks: PlantStreak[]): PlantStreak => {
    const longestStreak = allStreaks.reduce((max, streak) => {
        return streak.longestStreak > max.value 
            ? { value: streak.longestStreak, plantId: streak.plantId } 
            : max;
    }, { value: 0, plantId: '' });

    return allStreaks.find(s => s.plantId === longestStreak.plantId)!;
}