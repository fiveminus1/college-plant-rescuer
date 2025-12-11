  import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
  import { Stack } from 'expo-router';
  import { StatusBar } from 'expo-status-bar';
  import 'react-native-reanimated';
  import { PaperProvider } from 'react-native-paper';

  import { PlantsProvider } from '../context/PlantsContext';

  export const unstable_settings = {
    anchor: '(tabs)',
  };

  export default function RootLayout() {
    return (
      <PaperProvider>

        <PlantsProvider>
          <ThemeProvider value={DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </PlantsProvider>
      </PaperProvider>

      
    );
  }
