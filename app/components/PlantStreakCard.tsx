import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { Droplet, Flame, Trophy, Calendar } from 'lucide-react-native';

interface PlantStreakCardProps {
  plantName: string;
  plantType: string;
  currentStreak: number;
  longestStreak: number;
  totalWaterings: number;
  lastWatered: string | null;
  wateredToday: boolean;
  onWaterPress?: () => void;
  showWaterButton?: boolean;
  compact?: boolean;
}

export function PlantStreakCard({
  plantName,
  plantType,
  currentStreak,
  longestStreak,
  totalWaterings,
  lastWatered,
  wateredToday,
  onWaterPress,
  showWaterButton = true,
  compact = false,
}: PlantStreakCardProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.cardHeader}>
        <Text style={styles.plantName}>{plantName}</Text>
        <Text style={styles.plantType}>{plantType}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Flame size={compact ? 18 : 20} color={Colors.accent} />
          <Text style={[styles.statValue, compact && styles.statValueCompact]}>
            {currentStreak}
          </Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>

        <View style={styles.statItem}>
          <Trophy size={compact ? 18 : 20} color={Colors.secondary} />
          <Text style={[styles.statValue, compact && styles.statValueCompact]}>
            {longestStreak}
          </Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>

        <View style={styles.statItem}>
          <Calendar size={compact ? 18 : 20} color={Colors.icon} />
          <Text style={[styles.statValue, compact && styles.statValueCompact]}>
            {totalWaterings}
          </Text>
          <Text style={styles.statLabel}>Total Waters</Text>
        </View>
      </View>

      {lastWatered && (
        <Text style={styles.lastWatered}>
          Last watered: {new Date(lastWatered).toLocaleDateString()}
        </Text>
      )}

      {showWaterButton && onWaterPress && (
        <Pressable
          style={[
            styles.waterButton,
            wateredToday && styles.waterButtonDisabled,
          ]}
          onPress={onWaterPress}
          disabled={wateredToday}
        >
          <Droplet
            size={20}
            color={wateredToday ? Colors.text : Colors.background}
            fill={wateredToday ? Colors.text : Colors.background}
          />
          <Text
            style={[
              styles.waterButtonText,
              wateredToday && styles.waterButtonTextDisabled,
            ]}
          >
            {wateredToday ? 'Watered Today ✓' : 'Water Today'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  cardCompact: {
    padding: 16,
    marginBottom: 12,
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
  statValueCompact: {
    fontSize: 20,
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
});