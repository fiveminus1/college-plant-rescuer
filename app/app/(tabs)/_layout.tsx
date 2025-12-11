import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { Users, Sprout, Sun, Leaf, User } from 'lucide-react-native';
import { Menu } from 'react-native-paper';
import { usePlants } from '@/context/PlantsContext';


export default function TabLayout() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const { plants, selectedPlant, selectPlant } = usePlants();


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.background,
        tabBarInactiveTintColor: Colors.text,
        headerShown: true,
        headerTitle: () => null,

        headerLeft: () => (
          <View style={{ marginLeft: 24 }}>
            <Menu
              key={menuVisible ? 'open' : 'closed'}
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchorPosition='bottom'
              anchor={
                <Pressable
                  onPress={() => setMenuVisible(true)}
                  style={{ 
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Leaf size={26} />

                </Pressable>
                
              }
            >
              {plants.map((plant) => (
                <Menu.Item
                  key={plant.id}
                  title={plant.name}
                  leadingIcon={() =>
                    selectedPlant?.id === plant.id ? (
                      <Sprout size={18} color={Colors.icon} />
                    ) : null
                  }
                  onPress={() => {
                    selectPlant(plant.id);
                    setMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
          </View>
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
        name="streaks"
        options={{
          title: 'Streaks',
          tabBarIcon: ({ color }) => <Sun size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
