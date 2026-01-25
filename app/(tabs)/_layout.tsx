import { Stack } from 'expo-router';
import { View } from 'react-native';
import { LayoutDashboard, Archive, Users } from 'lucide-react-native';
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
        <Stack.Screen name="archive" />
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
            route: '/archive',
            label: 'מידע',
            icon: Archive,
          },
        ]}
      />
    </View>
  );
}
