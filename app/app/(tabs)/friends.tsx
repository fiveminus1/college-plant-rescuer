import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useStreaks } from '@/context/StreaksContext';
import { useUser } from '@/context/UserContext';
import { getLongestStreak } from '@/helpers/streaks';
import { Flame, Trophy, TrendingUp, TrendingDown } from 'lucide-react-native';
import { FriendCard } from '@/components/FriendCard';

const MOCK_FRIENDS = [
  {
    id: '1',
    name: 'Jeremiah Soe',
    bestStreak: 1,
    currentStreak: 1,
  },
  {
    id: '2',
    name: 'John Plant',
    bestStreak: 28,
    currentStreak: 28,
  },
];

export default function Friends() {
  const { user } = useUser();
  const { getAllStreaks } = useStreaks();
  
  const allStreaks = getAllStreaks();
  const myLongestStreak = getLongestStreak(allStreaks);
  const myBestStreak = myLongestStreak?.longestStreak || 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Friends</Text>

        <FriendCard 
            name={user!.name}
            bestStreak={myBestStreak}
            currentStreak={myLongestStreak?.currentStreak}
            isYou={true}
            showComparison={false}
        />

        {MOCK_FRIENDS.map((friend) => (
          <FriendCard
            key={friend.id}
            name={friend.name}
            bestStreak={friend.bestStreak}
            currentStreak={friend.currentStreak}
            isYou={false}
            myBestStreak={myBestStreak}
            showComparison={true}
          />
        ))}

      </ScrollView>
    </SafeAreaView>
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
});