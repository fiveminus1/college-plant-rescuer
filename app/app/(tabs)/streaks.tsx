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
        <Text style={styles.title}>Your Streaks</Text>
        <Text style={styles.subtitle}>
          Keep your plants happy by watering them daily!
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

        {plants.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No plants yet! Add some plants to start tracking streaks.
            </Text>
          </View>
        )}
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
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
  },
  plantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  plantType: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  lastWatered: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  waterButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  waterButtonDisabled: {
    backgroundColor: Colors.border,
  },
  waterButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  waterButtonTextDisabled: {
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});