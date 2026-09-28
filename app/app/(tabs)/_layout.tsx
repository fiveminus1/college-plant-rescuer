import { HapticTab } from '@/components/haptic-tab';
import { PlantType } from '@/constants/plants';
import { Colors } from '@/constants/theme';
import { usePlants } from '@/context/PlantsContext';
import { Tabs, useRouter } from 'expo-router';
import { Leaf, Plus, Sprout, Sun, User, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Menu } from 'react-native-paper';
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
          <View>
            <Menu
              key={menuVisible ? 'open' : 'closed'}
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchorPosition='bottom'
              anchor={
                <Pressable
                  onPress={() => setMenuVisible(true)}
                  style={styles.topIconButton}
                >
                  <Leaf size={26} />

                </Pressable>
              }
            >
              {plants.map((plant) => (
                <Menu.Item
                  key={plant.id}
                  title={plant.name}
                  leadingIcon={() => {
                    const isSelected = selectedPlant?.id === plant.id;

                    return (
                      <Sprout
                        size={18}
                        color={isSelected ? Colors.primary : Colors.icon}
                        fill={isSelected ? Colors.primary : 'none'}
                        strokeWidth={isSelected ? 2.5 : 2}
                      />
                    );
                  }}
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
            style={styles.topIconButton}
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
        headerLeftContainerStyle: {
          paddingLeft: 24,
        },
        headerRightContainerStyle: {
          paddingRight: 24,
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
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
              <Users size={24} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
              <Sprout size={24} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="streaks"
        options={{
          title: 'Streaks',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
              <Sun size={24} color={color} />
            </View>
          ),
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

const styles = StyleSheet.create({
  topIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    shadowColor: '#17313A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 3,
  },
  tabIcon: {
    width: 48,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#17313A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 3,
  },
});
