import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useAuthStore } from "@/store/authStore";

import { ErrorBoundary } from "./error-boundary";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  
  // Initialize auth store
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);
  
  // Handle authentication state changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedRoute = segments[0] === '(tabs)' || segments[0] === 'modal';
    
    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !isAuthenticated &&
      !inAuthGroup &&
      // Check for segments[0] only when segments.length > 0, otherwise it's the root path
      segments.length > 0
    ) {
      // Redirect to the login page.
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect away from the login page if the user is signed in.
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router, isInitialized]);

  if (!loaded || !isInitialized) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Indietro",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: "Registrazione" }} />
    </Stack>
  );
}

useEffect(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(
        (registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        },
        (error) => {
          console.error('Service Worker registration failed:', error);
        }
      );
    });
  }
}, []);