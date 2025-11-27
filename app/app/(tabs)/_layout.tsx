import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Users, Sprout, Sun } from 'lucide-react-native';


export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.background,
        tabBarInactiveTintColor: Colors.text,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
        },
        tabBarItemStyle: {
          paddingTop: 12,
        }
      }}>
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color }) => <Users size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Sprout size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Streaks',
          tabBarIcon: ({ color }) => <Sun size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
