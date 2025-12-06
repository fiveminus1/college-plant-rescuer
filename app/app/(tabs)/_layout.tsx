import { Tabs, useRouter } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { Users, Sprout, Sun, Leaf, User } from 'lucide-react-native';


export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.background,
        tabBarInactiveTintColor: Colors.text,
        headerShown: true,
        headerTitle: () => null,
        headerLeft: () => (
          <Leaf 
            size={26} 
            style={{ marginLeft: 32, marginBottom: 16, }}
            onPress={() => router.push("/plant-selector")}
          />
        ),
        headerRight: () => (
          <User size={26} style={{ 
            marginRight: 32,
            marginBottom: 16, }}/>
        ),
        headerStyle: { backgroundColor: Colors.topBarBackground },
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
