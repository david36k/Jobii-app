import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useState, useMemo, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign,
  Plus,
  TrendingUp,
  CalendarClock,
  ChevronLeft,
  Coins,
  Sparkles,
  Languages,
  LogOut,
} from 'lucide-react-native';
import { Tender } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/utils/formatting';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Mode = 'work' | 'hire';

export default function UnifiedDashboard() {
  const { currentUser, tenders, addCredits, logout } = useApp();
  const [mode, setMode] = useState<Mode>('work');
  const [language, setLanguage] = useState<'he' | 'en'>('he');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const myWork = useMemo(() => {
    if (!currentUser) return [];
    return tenders.filter((t) =>
      t.invites.some((invite) => invite.userId === currentUser.id)
    );
  }, [currentUser, tenders]);

  const myTenders = useMemo(() => {
    if (!currentUser) return [];
    return tenders.filter((t) => t.organizerId === currentUser.id);
  }, [currentUser, tenders]);

  const handleModeChange = (newMode: Mode) => {
    if (newMode !== mode) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMode(newMode);
    }
  };

  const monthlyEarnings = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return myWork
      .filter((t) => {
        const invite = t.invites.find((inv) => inv.userId === currentUser?.id);
        const tenderMonth = t.date.getMonth();
        const tenderYear = t.date.getFullYear();
        return (
          invite?.status === 'accepted' &&
          tenderMonth === currentMonth &&
          tenderYear === currentYear &&
          t.date <= now
        );
      })
      .reduce((sum, t) => sum + t.pay, 0);
  }, [myWork, currentUser]);

  const upcomingShifts = useMemo(() => {
    const now = new Date();
    return myWork.filter((t) => {
      const invite = t.invites.find((inv) => inv.userId === currentUser?.id);
      return invite?.status === 'accepted' && t.date >= now;
    }).length;
  }, [myWork, currentUser]);

  const hasLowCredits = currentUser && currentUser.credits < 3;
  const hasNoCredits = currentUser && currentUser.credits === 0;

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
        colors={mode === 'work' ? ['#ECFDF5', '#F0FDF4', '#FFFFFF'] : ['#EEF2FF', '#F8FAFC', '#FFFFFF']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BlurView intensity={90} tint="light" style={styles.header}>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setLanguage(language === 'he' ? 'en' : 'he');
              }}
            >
              <Languages size={20} color={mode === 'work' ? '#10B981' : '#4F46E5'} />
              <Text style={[styles.languageText, { color: mode === 'work' ? '#059669' : '#4F46E5' }]}>
                {language === 'he' ? 'EN' : 'HE'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.logoutButton, { borderColor: mode === 'work' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.3)' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert(
                  'התנתק',
                  'האם אתה בטוח שברצונך להתנתק?',
                  [
                    {
                      text: 'ביטול',
                      style: 'cancel',
                    },
                    {
                      text: 'התנתק',
                      style: 'destructive',
                      onPress: async () => {
                        await logout();
                        router.replace('/' as any);
                      },
                    },
                  ]
                );
              }}
            >
              <LogOut size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={[styles.avatarPlaceholder, { shadowColor: mode === 'work' ? '#10B981' : '#4F46E5' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/settings' as any);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={mode === 'work' ? ['#10B981', '#059669'] : ['#6366F1', '#4F46E5']}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {currentUser?.name?.charAt(0) || 'U'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>שלום, {currentUser?.name || 'משתמש'}</Text>
              {mode === 'hire' && (
                <View style={styles.creditsRow}>
                  <TouchableOpacity 
                    style={[
                      styles.creditsButton,
                      {
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        borderColor: 'rgba(251, 191, 36, 0.3)',
                      }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (currentUser) {
                        addCredits(currentUser.id, 10);
                      }
                    }}
                  >
                    <Coins size={16} color="#F59E0B" />
                    <Text style={[styles.creditsText, { color: '#D97706' }]}>{currentUser?.credits || 0} קרדיטים</Text>
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
                mode === 'work' && { shadowColor: '#10B981' },
              ]}
              onPress={() => {
                animateButton();
                handleModeChange('work');
              }}
            >
              {mode === 'work' && (
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.modeButtonGradient}
                />
              )}
              <Briefcase
                size={20}
                color={mode === 'work' ? '#FFFFFF' : '#6B7280'}
                style={{ zIndex: 1 }}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'work' && styles.modeButtonTextActive,
                ]}
              >
                מחפש עבודה
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.modeButton,
                mode === 'hire' && styles.modeButtonActive,
              ]}
              onPress={() => {
                animateButton();
                handleModeChange('hire');
              }}
            >
              {mode === 'hire' && (
                <LinearGradient
                  colors={['#6366F1', '#4F46E5']}
                  style={styles.modeButtonGradient}
                />
              )}
              <Users
                size={20}
                color={mode === 'hire' ? '#FFFFFF' : '#6B7280'}
                style={{ zIndex: 1 }}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'hire' && styles.modeButtonTextActive,
                ]}
              >
                מגייס עובדים
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
            />
          ) : (
            <HireView tenders={myTenders} hasNoCredits={hasNoCredits || false} hasLowCredits={hasLowCredits || false} />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function WorkView({
  tenders,
  currentUser,
  monthlyEarnings,
  upcomingShifts,
}: {
  tenders: Tender[];
  currentUser: any;
  monthlyEarnings: number;
  upcomingShifts: number;
}) {
  const getInviteForUser = (tender: Tender) => {
    return tender.invites.find((inv) => inv.userId === currentUser?.id);
  };

  const getStatusBadge = (tender: Tender) => {
    const invite = getInviteForUser(tender);
    if (!invite) return null;

    switch (invite.status) {
      case 'pending':
        return { text: 'ממתין', color: '#F59E0B', bg: 'rgba(251, 191, 36, 0.15)' };
      case 'accepted':
        return { text: 'אושר', color: '#059669', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'rejected':
        return { text: 'נדחה', color: '#DC2626', bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { text: invite.status, color: '#6B7280', bg: 'rgba(156, 163, 175, 0.15)' };
    }
  };

  return (
    <>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary, { shadowColor: '#10B981' }]}>
          <LinearGradient
            colors={['#10B981', '#059669', '#047857']}
            style={styles.statCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.statValue}>₪{monthlyEarnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>רווח החודש</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <BlurView intensity={60} tint="light" style={styles.statCardBlur}>
            <View style={[styles.statIconContainer, styles.statIconSecondary]}>
              <CalendarClock size={24} color="#10B981" />
            </View>
            <Text style={styles.statValueSecondary}>{upcomingShifts}</Text>
            <Text style={styles.statLabelSecondary}>משמרות קרובות</Text>
          </BlurView>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>הזמנות פתוחות</Text>

        {tenders.length === 0 ? (
          <View style={styles.emptyState}>
            <Briefcase size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>אין הזמנות פעילות</Text>
            <Text style={styles.emptyStateSubtext}>
              הזמנות לעבודה יופיעו כאן
            </Text>
          </View>
        ) : (
          tenders.map((tender, index) => {
            const status = getStatusBadge(tender);
            const invite = getInviteForUser(tender);

            if (!status || !invite) return null;

            return (
              <MotiView
                key={tender.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400, delay: index * 100 }}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.tenderCard,
                    pressed && styles.tenderCardPressed,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/participant/tender-details?id=${tender.id}` as any);
                  }}
                >
                  <View style={styles.tenderHeader}>
                    <View
                      style={[styles.statusBadge, { backgroundColor: status.bg }]}
                    >
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.text}
                      </Text>
                    </View>
                    <Text style={styles.tenderTitle}>{tender.title}</Text>
                  </View>

                  <View style={styles.organizerInfo}>
                    <Text style={styles.organizerText}>
                      מאת {tender.organizerName}
                    </Text>
                  </View>

                  <View style={styles.tenderDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailText}>{formatDate(tender.date)}</Text>
                      <Calendar size={16} color="#6B7280" />
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailText}>
                        {tender.startTime} - {tender.endTime}
                      </Text>
                      <Clock size={16} color="#6B7280" />
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.payText}>₪{tender.pay}</Text>
                      <DollarSign size={16} color="#059669" />
                    </View>
                  </View>

                  {invite.status === 'pending' && (
                    <View style={styles.pendingIndicator}>
                      <Text style={styles.pendingText}>לחץ לתגובה</Text>
                    </View>
                  )}
                </Pressable>
              </MotiView>
            );
          })
        )}
      </View>
    </>
  );
}

function HireView({ tenders, hasNoCredits, hasLowCredits }: { tenders: Tender[]; hasNoCredits: boolean; hasLowCredits: boolean }) {
  const getAcceptedCount = (tender: Tender) => {
    return tender.invites.filter((inv) => inv.status === 'accepted').length;
  };

  return (
    <>
      {hasLowCredits && (
        <TouchableOpacity style={styles.creditsBanner} activeOpacity={0.8}>
          <LinearGradient
            colors={hasNoCredits ? ['#EF4444', '#DC2626'] : ['#F59E0B', '#D97706']}
            style={styles.creditsBannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Sparkles size={24} color="#FFFFFF" />
            <View style={styles.creditsBannerContent}>
              <Text style={styles.creditsBannerTitle}>
                {hasNoCredits ? 'אזלו הקרדיטים' : 'קרדיטים נמוכים'}
              </Text>
              <Text style={styles.creditsBannerSubtitle}>
                {hasNoCredits ? 'לחץ על הקרדיטים למעלה להוסיף' : 'מומלץ להוסיף קרדיטים'}
              </Text>
            </View>
            <ChevronLeft size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.createTenderCTA}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/organizer/create-tender' as any);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          style={styles.ctaGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.ctaIconContainer}>
            <Plus size={32} color="#FFFFFF" />
          </View>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>צור מכרז חדש</Text>
            <Text style={styles.ctaSubtitle}>גייס עובדים במהירות ובקלות</Text>
          </View>
          <ChevronLeft size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>המכרזים שלי</Text>

        {tenders.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>אין מכרזים פעילים</Text>
            <Text style={styles.emptyStateSubtext}>
              צור מכרז ראשון כדי להתחיל
            </Text>
          </View>
        ) : (
          tenders.map((tender, index) => {
            const acceptedCount = getAcceptedCount(tender);
            const progress = tender.quota > 0 ? (acceptedCount / tender.quota) * 100 : 0;

            return (
              <MotiView
                key={tender.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400, delay: index * 100 }}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.tenderCard,
                    pressed && styles.tenderCardPressed,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/organizer/tender-details?id=${tender.id}` as any);
                  }}
                >
                  <View style={styles.tenderHeader}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(tender.status)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(tender.status) },
                        ]}
                      >
                        {getStatusText(tender.status)}
                      </Text>
                    </View>
                    <Text style={styles.tenderTitle}>{tender.title}</Text>
                  </View>

                  <View style={styles.tenderDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailText}>{formatDate(tender.date)}</Text>
                      <Calendar size={16} color="#6B7280" />
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailText}>
                        {tender.startTime} - {tender.endTime}
                      </Text>
                      <Clock size={16} color="#6B7280" />
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressCount}>
                        {acceptedCount} / {tender.quota}
                      </Text>
                      <Text style={styles.progressLabel}>עובדים</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor:
                              progress >= 100
                                ? '#059669'
                                : progress >= 70
                                ? '#F59E0B'
                                : '#4F46E5',
                          },
                        ]}
                      />
                    </View>
                  </View>
                </Pressable>
              </MotiView>
            );
          })
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    position: 'relative',
  },
  headerButtons: {
    position: 'absolute',
    top: 16,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  headerContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  creditsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  creditsButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  creditsText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  modeToggleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modeToggle: {
    flexDirection: 'row-reverse',
    borderRadius: 16,
    padding: 4,
    gap: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    position: 'relative',
  },
  modeButtonActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modeButtonGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 12,
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#6B7280',
    zIndex: 1,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  statCardPrimary: {},
  statCardGradient: {
    padding: 20,
  },
  statCardBlur: {
    padding: 20,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIconSecondary: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'right',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'right',
    fontWeight: '500' as const,
  },
  statValueSecondary: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
    textAlign: 'right',
  },
  statLabelSecondary: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    fontWeight: '500' as const,
  },
  creditsBanner: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  creditsBannerGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  creditsBannerContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  creditsBannerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  creditsBannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  createTenderCTA: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  ctaIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  tenderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  tenderCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  tenderHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tenderTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    flex: 1,
    marginRight: 8,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  organizerInfo: {
    marginBottom: 12,
  },
  organizerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  tenderDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  payText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#059669',
  },
  pendingIndicator: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#F59E0B',
  },
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#374151',
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
