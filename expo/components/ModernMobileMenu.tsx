import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text, Platform, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LucideIcon } from 'lucide-react-native';

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  onPress?: () => void;
}

export interface ModernMobileMenuProps {
  items: MenuItem[];
  accentColor?: string;
  inactiveColor?: string;
  backgroundColor?: string;
}

export default function ModernMobileMenu({
  items,
  accentColor = '#6366F1',
  inactiveColor = '#64748B',
  backgroundColor = '#FFFFFF',
}: ModernMobileMenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  const bounceAnims = useRef(items.map(() => new Animated.Value(1))).current;
  const underlinePosition = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (itemWidths.length === items.length && itemWidths[activeIndex] > 0) {
      const containerWidth = screenWidth - 48;
      const itemWidth = containerWidth / items.length;
      const targetPosition = itemWidth * activeIndex + (itemWidth / 2);
      const targetWidth = itemWidths[activeIndex];

      Animated.parallel([
        Animated.spring(underlinePosition, {
          toValue: targetPosition - targetWidth / 2,
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
  }, [activeIndex, itemWidths, items.length, screenWidth]);

  const handleItemPress = (index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.sequence([
      Animated.timing(bounceAnims[index], {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnims[index], {
        toValue: 1,
        damping: 6,
        stiffness: 250,
        useNativeDriver: true,
      }),
    ]).start();

    setActiveIndex(index);
    items[index].onPress?.();
  };

  const handleTextLayout = (event: any, index: number) => {
    const { width } = event.nativeEvent.layout;
    setItemWidths((prev) => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.menuContainer}>
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleItemPress(index)}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  {
                    transform: [{ scale: bounceAnims[index] }],
                  },
                ]}
              >
                <Icon
                  size={24}
                  color={isActive ? accentColor : inactiveColor}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </Animated.View>
              <Text
                onLayout={(e) => handleTextLayout(e, index)}
                style={[
                  styles.menuText,
                  {
                    color: isActive ? accentColor : inactiveColor,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Animated.View
        style={[
          styles.underline,
          {
            backgroundColor: accentColor,
            left: underlinePosition,
            width: underlineWidth,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconWrapper: {
    marginBottom: 6,
  },
  menuText: {
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  underline: {
    position: 'absolute',
    bottom: 4,
    height: 2.5,
    borderRadius: 2,
  },
});
