import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { Users, Sprout, Sun, Leaf, User, Plus } from 'lucide-react-native';
import { Menu } from 'react-native-paper';
import { usePlants } from '@/context/PlantsContext';
import { PlantType } from '@/constants/plants';
import { HapticTab } from '@/components/haptic-tab';
import { CreatePlantDialog } from '../../components/CreatePlantDialog';


export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);

  const { plants, selectedPlant, selectPlant, addPlant } = usePlants();

  const router = useRouter();

  return (
    <>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.background,
        tabBarInactiveTintColor: Colors.text,
        headerShown: true,
        headerTitle: () => null,
        headerShadowVisible: true,

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
              <Menu.Item
                title="Create plant"
                leadingIcon={() => <Plus size={18} color={Colors.icon} />}
                onPress={() => {
                  setMenuVisible(false);
                  setCreateDialogVisible(true);
                }}
              />
            </Menu>
          </View>
        ),
        headerRight: () => (
          <Pressable
            onPress={() => router.push('/profile')}   
            style={{
              marginRight: 24,
              padding: 8,
            }}
          >
            <User size={26} />
          </Pressable>
        ),
        headerStyle: {
          backgroundColor: Colors.topBarBackground,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(17, 24, 28, 0.08)',
          shadowColor: '#17313A',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.14,
          shadowRadius: 7,
          elevation: 5,
        },
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: 'rgba(17, 24, 28, 0.1)',
          shadowColor: '#17313A',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.16,
          shadowRadius: 8,
          elevation: 8,
          height: 72,
          paddingBottom: 8,
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
      <CreatePlantDialog
        visible={createDialogVisible}
        onDismiss={() => setCreateDialogVisible(false)}
        onCreate={(name, type: PlantType) => {
          addPlant(name, type);
          setCreateDialogVisible(false);
        }}
      />
    </>
  );
}
