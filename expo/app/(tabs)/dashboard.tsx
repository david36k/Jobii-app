import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDashboardMode } from '@/hooks/useDashboardMode';
import { useWorkViewData } from '@/hooks/useWorkViewData';
import { useHireViewData } from '@/hooks/useHireViewData';
import WorkView from '@/components/dashboard/WorkView';
import HireView from '@/components/dashboard/HireView';
import { dashboardScreenStyles as styles } from '@/components/dashboard/dashboardScreenStyles';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  UIManager,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Users, Coins } from 'lucide-react-native';
import RequireAuthModal from '@/components/ui/RequireAuthModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function UnifiedDashboard() {
  const { currentUser, tenders } = useApp();
  const { mode, handleModeChange } = useDashboardMode();
  const { myWork, monthlyEarnings, upcomingShifts } = useWorkViewData(currentUser, tenders);
  const { myTenders, hasNoCredits, hasLowCredits } = useHireViewData(currentUser, tenders);
  const { t } = useLanguage();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [showRequireAuthModal, setShowRequireAuthModal] = useState(false);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          mode === 'work'
            ? [colors.gradientWorkStart, colors.gradientWorkMid, colors.background]
            : [colors.gradientHireStart, colors.gradientHireMid, colors.background]
        }
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BlurView intensity={90} tint="light" style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={[
                styles.avatarPlaceholder,
                { shadowColor: mode === 'work' ? colors.success : colors.primary },
              ]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/settings');
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={mode === 'work' ? [colors.success, colors.successDark] : [colors.primaryLight, colors.primary]}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>{currentUser?.name?.charAt(0) || 'U'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                {t('dashboard.greeting')}, {currentUser?.name || t('dashboard.userFallback')}
              </Text>
              {mode === 'hire' && (
                <View style={styles.creditsRow}>
                  <TouchableOpacity
                    style={[
                      styles.creditsButton,
                      {
                        backgroundColor: colors.creditsButtonBg,
                        borderColor: colors.creditsButtonBorder,
                      },
                    ]}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (!currentUser) {
                        setShowRequireAuthModal(true);
                        return;
                      }
                      router.push('/tokens');
                    }}
                  >
                    <Coins size={16} color={colors.warning} />
                    <Text style={[styles.creditsText, { color: colors.warningDark }]}>
                      {currentUser?.credits || 0} {t('dashboard.credits')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </BlurView>

        <View style={styles.modeToggleContainer}>
          <BlurView intensity={80} tint="light" style={styles.modeToggle}>
            <Pressable
              style={[
                styles.modeButton,
                mode === 'work' && styles.modeButtonActive,
                mode === 'work' && { shadowColor: colors.success },
              ]}
              onPress={() => {
                animateButton();
                handleModeChange('work');
              }}
            >
              {mode === 'work' && (
                <LinearGradient
                  colors={[colors.success, colors.successDark]}
                  style={styles.modeButtonGradient}
                />
              )}
              <Briefcase
                size={20}
                color={mode === 'work' ? colors.background : colors.textMuted}
                style={{ zIndex: 1 }}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'work' && styles.modeButtonTextActive,
                ]}
              >
                {t('dashboard.modeWork')}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.modeButton, mode === 'hire' && styles.modeButtonActive]}
              onPress={() => {
                animateButton();
                handleModeChange('hire');
              }}
            >
              {mode === 'hire' && (
                <LinearGradient
                  colors={[colors.primaryLight, colors.primary]}
                  style={styles.modeButtonGradient}
                />
              )}
              <Users
                size={20}
                color={mode === 'hire' ? colors.background : colors.textMuted}
                style={{ zIndex: 1 }}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'hire' && styles.modeButtonTextActive,
                ]}
              >
                {t('dashboard.modeHire')}
              </Text>
            </Pressable>
          </BlurView>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {mode === 'work' ? (
            <WorkView
              tenders={myWork}
              currentUser={currentUser}
              monthlyEarnings={monthlyEarnings}
              upcomingShifts={upcomingShifts}
              t={t}
            />
          ) : (
            <HireView
              tenders={myTenders}
              hasNoCredits={hasNoCredits}
              hasLowCredits={hasLowCredits}
              t={t}
              isGuest={!currentUser}
              onRequireAuth={() => setShowRequireAuthModal(true)}
            />
          )}
        </ScrollView>
      </SafeAreaView>
      <RequireAuthModal visible={showRequireAuthModal} onClose={() => setShowRequireAuthModal(false)} />
    </View>
  );
}
