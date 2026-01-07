// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/contexts/AppContext";
import { I18nManager } from "react-native";
import { Toaster } from 'sonner-native';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "חזרה" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="organizer/create-tender" options={{ title: "צור מכרז" }} />
      <Stack.Screen name="organizer/tender-details" options={{ title: "פרטי מכרז" }} />
      <Stack.Screen name="participant/tender-details" options={{ title: "הצעת עבודה" }} />
      <Stack.Screen name="profile/edit" options={{ title: "ערוך פרופיל" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <AppProvider>
          <RootLayoutNav />
          <Toaster />
        </AppProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
