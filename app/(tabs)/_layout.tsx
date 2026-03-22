import { Stack } from 'expo-router';
import { View } from 'react-native';
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  Settings,
  Layers3,
} from 'lucide-react-native';
import BottomNavBar from '@/components/BottomNavBar';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="contacts" />
        <Stack.Screen name="groups" />
        <Stack.Screen name="archive" />
        <Stack.Screen name="feed" />
        <Stack.Screen name="settings" />
      </Stack>
      
      <BottomNavBar
        items={[
          {
            route: '/dashboard',
            label: 'דשבורד',
            icon: LayoutDashboard,
          },
          {
            route: '/contacts',
            label: 'אנשי קשר',
            icon: Users,
          },
          {
            route: '/groups',
            label: 'קבוצות',
            icon: Layers3,
          },
          {
            route: '/archive',
            label: 'ארכיון',
            icon: BriefcaseBusiness,
          },
          {
            route: '/feed',
            label: 'לוח משרות',
            icon: BriefcaseBusiness,
          },
          {
            route: '/settings',
            label: 'הגדרות',
            icon: Settings,
          },
        ]}
      />
    </View>
  );
}
