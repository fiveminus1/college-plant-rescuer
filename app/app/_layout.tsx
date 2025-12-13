  import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
  import { Stack } from 'expo-router';
  import { StatusBar } from 'expo-status-bar';
  import 'react-native-reanimated';
  import { PaperProvider } from 'react-native-paper';

  import { PlantsProvider } from '../context/PlantsContext';
  import { StreaksProvider } from '@/context/StreaksContext';
  import { UserProvider } from '@/context/UserContext';

  export const unstable_settings = {
    anchor: '(tabs)',
  };

  export default function RootLayout() {
    return (
      <PaperProvider>
        <UserProvider>
          <PlantsProvider>
            <StreaksProvider>
              <ThemeProvider value={DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                  name="profile"
                  options={{
                    title: 'Profile',
                    headerBackTitle: 'Home',
                  }}
                />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </StreaksProvider>
          </PlantsProvider> 
        </UserProvider>
      </PaperProvider>

      
    );
  }
