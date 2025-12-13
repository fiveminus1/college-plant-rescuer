import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { usePlants } from '@/context/PlantsContext';
import { useStreaks } from '@/context/StreaksContext';
import { Colors } from '@/constants/theme';
import { Droplet, Flame, Trophy, Calendar } from 'lucide-react-native';
import { PlantStreakCard } from '@/components/PlantStreakCard';

export default function StreaksScreen() {
  const { plants } = usePlants();
  const { getPlantStreak, hasWateredToday, recordWatering } = useStreaks();

  const handleWaterPress = async (plantId: string) => {
    await recordWatering(plantId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Streaks</Text>
        <Text style={styles.subtitle}>
          Water your plants daily!
        </Text>

        {plants.map((plant) => {
          const streak = getPlantStreak(plant.id);
          const wateredToday = hasWateredToday(plant.id);

          return (
            <PlantStreakCard 
              key={plant.id}
              plantName={plant.name}
              plantType={plant.type}
              currentStreak={streak.currentStreak}
              longestStreak={streak.longestStreak}
              totalWaterings={streak.totalWaterings}
              lastWatered={streak.lastWatered}
              wateredToday={wateredToday}
              onWaterPress={() => handleWaterPress(plant.id)}
              showWaterButton={true} 
            />
          )
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
});