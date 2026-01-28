import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter, usePathname } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';

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
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  const bounceAnims = useRef(items.map(() => new Animated.Value(1))).current;
  const underlinePosition = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  const getActiveIndex = () => {
    const index = items.findIndex(item => {
      if (item.route === '/dashboard') {
        return pathname === '/' || pathname === '/dashboard';
      }
      return pathname === item.route;
    });
    return index >= 0 ? index : 0;
  };

  const activeIndex = getActiveIndex();

  useEffect(() => {
    if (itemWidths.length === items.length && itemWidths[activeIndex] > 0) {
      const containerWidth = screenWidth - 64;
      const itemWidth = containerWidth / items.length;
      const targetPosition = itemWidth * activeIndex + (itemWidth / 2);
      const targetWidth = itemWidths[activeIndex] * 0.7;

      Animated.parallel([
        Animated.spring(underlinePosition, {
          toValue: targetPosition - (targetWidth / 2),
          useNativeDriver: false,
          damping: 20,
          stiffness: 150,
        }),
        Animated.spring(underlineWidth, {
          toValue: targetWidth,
          useNativeDriver: false,
          damping: 20,
          stiffness: 150,
        }),
      ]).start();
    }
  }, [activeIndex, itemWidths, items.length, screenWidth, underlinePosition, underlineWidth]);

  const handlePress = (route: string, index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.sequence([
      Animated.timing(bounceAnims[index], {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnims[index], {
        toValue: 1,
        damping: 5,
        stiffness: 200,
        useNativeDriver: true,
      }),
    ]).start();

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

  const handleTextLayout = (event: any, index: number) => {
    const { width } = event.nativeEvent.layout;
    setItemWidths(prev => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={80} tint="light" style={styles.blur}>
        <View style={styles.innerContainer}>
          {items.map((item, index) => {
            const active = isActive(item.route);
            const Icon = item.icon;
            
            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => handlePress(item.route, index)}
                style={styles.itemContainer}
                activeOpacity={0.7}
              >
                <View style={styles.item}>
                  <Animated.View
                    style={[
                      styles.iconContainer,
                      {
                        transform: [{ scale: bounceAnims[index] }],
                        opacity: active ? 1 : 0.5,
                      },
                    ]}
                  >
                    <Icon
                      size={26}
                      color={active ? '#6366F1' : '#64748B'}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </Animated.View>
                  <Text
                    onLayout={(e) => handleTextLayout(e, index)}
                    style={[
                      styles.label,
                      { 
                        color: active ? '#6366F1' : '#64748B',
                        fontWeight: active ? '700' : '500',
                        opacity: active ? 1 : 0.7,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <Animated.View
          style={[
            styles.underline,
            {
              left: underlinePosition,
              width: underlineWidth,
            },
          ]}
        />
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
    borderRadius: 28,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 28,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  blur: {
    paddingVertical: 16,
    paddingTop: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    position: 'relative',
    minWidth: 60,
  },
  iconContainer: {
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  underline: {
    position: 'absolute',
    top: 8,
    height: 3,
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
});
