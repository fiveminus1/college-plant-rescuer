import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { Flame, TrendingUp, TrendingDown } from 'lucide-react-native';
import { Avatar } from './Avatar';

interface FriendCardProps {
  name: string;
  bestStreak: number;
  currentStreak: number;
  isYou?: boolean;
  myBestStreak?: number;
  showComparison?: boolean;
}

export function FriendCard({
  name,
  bestStreak,
  currentStreak,
  isYou = false,
  myBestStreak = 0,
  showComparison = true,
}: FriendCardProps) {
  const streakDifference = myBestStreak - bestStreak;
  const isAhead = streakDifference > 0;
  const isTied = streakDifference === 0;
  
  const absStreakDifference = Math.abs(streakDifference);

  return (
    <View style={[styles.friendCard, isYou && styles.yourCard]}>
      <View style={styles.cardHeader}>
        <View style={{ marginRight: 12 }}>
            <Avatar
                name={name}
                color={isYou ? Colors.primary : Colors.secondary}
            />
        </View>
        
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>
            {name}
            {isYou && ' (You)'}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Flame size={16} color={Colors.accent} />
              <Text style={styles.statText}>{bestStreak} day streak</Text>
            </View>
          </View>
        </View>
      </View>

      {!isYou && showComparison && (
        <View style={styles.comparison}>
          {isTied ? (
            <View style={[styles.comparisonBadge, styles.tiedBadge]}>
              <Text style={styles.comparisonText}>Tied!</Text>
            </View>
          ) : isAhead ? (
            <View style={[styles.comparisonBadge, styles.aheadBadge]}>
              <TrendingUp size={14} color={Colors.primary} />
              <Text style={styles.comparisonText}>
                {absStreakDifference} days ahead
              </Text>
            </View>
          ) : (
            <View style={[styles.comparisonBadge, styles.behindBadge]}>
              <TrendingDown size={14} color={Colors.accent} />
              <Text style={styles.comparisonText}>
                {absStreakDifference} days behind
              </Text>
            </View>
          )}
        </View>
      )}

      {currentStreak > 0 && !isYou && (
        <View style={styles.currentStreakBar}>
          <View style={styles.currentStreakInfo}>
            <Text style={styles.currentStreakText}>
              Current: {currentStreak} days
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  friendCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  yourCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  comparison: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  comparisonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  aheadBadge: {
    backgroundColor: `${Colors.primary}20`,
  },
  behindBadge: {
    backgroundColor: `${Colors.accent}20`,
  },
  tiedBadge: {
    backgroundColor: `${Colors.secondary}20`,
  },
  comparisonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  currentStreakBar: {
    marginTop: 8,
  },
  currentStreakInfo: {
    backgroundColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  currentStreakText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});