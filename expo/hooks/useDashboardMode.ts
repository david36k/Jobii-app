import { useState, useCallback } from 'react';
import { LayoutAnimation } from 'react-native';
import * as Haptics from 'expo-haptics';

export type DashboardMode = 'work' | 'hire';

export function useDashboardMode() {
  const [mode, setMode] = useState<DashboardMode>('work');

  const handleModeChange = useCallback((newMode: DashboardMode) => {
    if (newMode !== mode) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMode(newMode);
    }
  }, [mode]);

  return { mode, setMode, handleModeChange };
}
