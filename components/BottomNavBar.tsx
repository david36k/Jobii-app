import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter, usePathname } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { MotiView } from 'moti';

export interface NavItem {
  route: string;
  label: string;
  icon: LucideIcon;
}

interface BottomNavBarProps {
  items: NavItem[];
}

export default function BottomNavBar({ items }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const handlePress = (route: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  const isActive = (route: string) => {
    if (route === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    if (route === '/groups') {
      return pathname === '/groups';
    }
    return pathname === route;
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={95} tint="light" style={styles.blur}>
        <View style={styles.innerContainer}>
          {items.map((item, index) => {
            const active = isActive(item.route);
            const Icon = item.icon;
            
            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => handlePress(item.route)}
                style={styles.itemContainer}
                activeOpacity={0.7}
              >
                <MotiView
                  animate={{
                    scale: active ? 1 : 0.9,
                    opacity: active ? 1 : 0.6,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 200,
                  }}
                  style={styles.item}
                >
                  {active && (
                    <MotiView
                      from={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: 'spring',
                        damping: 12,
                      }}
                      style={styles.activeBackground}
                    />
                  )}
                  <Icon
                    size={24}
                    color={active ? '#4F46E5' : '#6B7280'}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <Text
                    style={[
                      styles.label,
                      { 
                        color: active ? '#4F46E5' : '#6B7280',
                        fontWeight: active ? '700' : '600',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </MotiView>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  blur: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.1)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    position: 'relative',
    minWidth: 70,
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
