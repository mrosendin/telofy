import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import { useAutoTaskGeneration } from '@/lib/hooks/useAutoTaskGeneration';
import { useTaskNotifications } from '@/lib/hooks/useTaskNotifications';
import { useNotifications } from '@/lib/hooks/useNotifications';

import '../global.css';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Custom dark theme for Telofy
const TelofyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#22c55e',
    background: '#0a0a0b',
    card: '#141416',
    text: '#fafafa',
    border: '#27272a',
    notification: '#ef4444',
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function AppServices() {
  // Run app-wide services
  useAutoTaskGeneration(); // Auto-generate daily tasks
  useTaskNotifications();  // Schedule push notifications
  useNotifications();      // Register for push notifications
  return null;
}

function RootLayoutNav() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={TelofyTheme}>
        <StatusBar style="light" />
        <AppServices />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="create-objective" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="objective" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal',
              headerShown: false,
            }} 
          />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
