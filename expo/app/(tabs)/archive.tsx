import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import {
  Archive,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
  TrendingUp,
  Package,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/formatting';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import EmptyState from '@/components/EmptyState';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FilterMode = 'all' | 'organized' | 'worked';

export default function ArchiveScreen() {
  const { currentUser, tenders } = useApp();
  const { t } = useLanguage();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const completedTenders = useMemo(() => {
    if (!currentUser) return [];

    const now = new Date();

    return tenders.filter((tender) => {
      const isPast = tender.date < now;
      const isOrganizer = tender.organizerId === currentUser.id;
      const isParticipant = tender.invites.some((inv) => inv.userId === currentUser.id);

      return isPast && (isOrganizer || isParticipant);
    });
  }, [currentUser, tenders]);

  const filteredTenders = useMemo(() => {
    if (filterMode === 'all') return completedTenders;
    if (filterMode === 'organized') {
      return completedTenders.filter((t) => t.organizerId === currentUser?.id);
    }
    if (filterMode === 'worked') {
      return completedTenders.filter((t) =>
        t.invites.some(
          (inv) => inv.userId === currentUser?.id && inv.status === 'accepted'
        )
      );
    }
    return completedTenders;
  }, [completedTenders, filterMode, currentUser]);

  const stats = useMemo(() => {
    const organized = completedTenders.filter((t) => t.organizerId === currentUser?.id);
    const worked = completedTenders.filter((t) =>
      t.invites.some((inv) => inv.userId === currentUser?.id && inv.status === 'accepted')
    );
    const totalEarned = worked.reduce((sum, t) => sum + t.pay, 0);

    return {
      totalCompleted: completedTenders.length,
      organized: organized.length,
      worked: worked.length,
      totalEarned,
    };
  }, [completedTenders, currentUser]);

  const handleFilterChange = (mode: FilterMode) => {
    if (mode !== filterMode) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFilterMode(mode);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F3E8FF', '#EDE9FE', '#FFFFFF']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BlurView intensity={90} tint="light" style={styles.header}>
          <View style={styles.headerContent}>
            <Archive size={32} color="#7C3AED" />
            <Text style={styles.headerTitle}>{t('archive.title')}</Text>
          </View>
        </BlurView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 400 }}
                style={styles.statCard}
              >
                <View style={styles.statCardContent}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}>
                    <Package size={24} color="#7C3AED" />
                  </View>
                  <Text style={styles.statValue}>{stats.totalCompleted}</Text>
                  <Text style={styles.statLabel}>{t('archive.totalCompleted')}</Text>
                </View>
              </MotiView>

              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 400, delay: 100 }}
                style={styles.statCard}
              >
                <View style={styles.statCardContent}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Users size={24} color={colors.blue} />
                  </View>
                  <Text style={styles.statValue}>{stats.organized}</Text>
                  <Text style={styles.statLabel}>{t('archive.organized')}</Text>
                </View>
              </MotiView>
            </View>

            <View style={styles.statsRow}>
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 400, delay: 200 }}
                style={styles.statCard}
              >
                <View style={styles.statCardContent}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Briefcase size={24} color="#10B981" />
                  </View>
                  <Text style={styles.statValue}>{stats.worked}</Text>
                  <Text style={styles.statLabel}>{t('archive.worked')}</Text>
                </View>
              </MotiView>

              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 400, delay: 300 }}
                style={styles.statCard}
              >
                <LinearGradient
                  colors={[colors.success, '#059669']}
                  style={styles.statCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                    <TrendingUp size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.statValueWhite}>₪{stats.totalEarned.toLocaleString()}</Text>
                  <Text style={styles.statLabelWhite}>{t('archive.totalEarned')}</Text>
                </LinearGradient>
              </MotiView>
            </View>
          </View>

          <BlurView intensity={80} tint="light" style={styles.filterContainer}>
            <Pressable
              style={[
                styles.filterButton,
                filterMode === 'all' && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange('all')}
            >
              {filterMode === 'all' && (
                <LinearGradient
                  colors={[colors.archivePrimary, colors.archiveDark]}
                  style={styles.filterButtonGradient}
                />
              )}
              <Text
                style={[
                  styles.filterButtonText,
                  filterMode === 'all' && styles.filterButtonTextActive,
                ]}
              >
                {t('archive.filterAll')} ({stats.totalCompleted})
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterButton,
                filterMode === 'organized' && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange('organized')}
            >
              {filterMode === 'organized' && (
                <LinearGradient
                  colors={[colors.archivePrimary, colors.archiveDark]}
                  style={styles.filterButtonGradient}
                />
              )}
              <Text
                style={[
                  styles.filterButtonText,
                  filterMode === 'organized' && styles.filterButtonTextActive,
                ]}
              >
                {t('archive.filterOrganized')} ({stats.organized})
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterButton,
                filterMode === 'worked' && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange('worked')}
            >
              {filterMode === 'worked' && (
                <LinearGradient
                  colors={[colors.archivePrimary, colors.archiveDark]}
                  style={styles.filterButtonGradient}
                />
              )}
              <Text
                style={[
                  styles.filterButtonText,
                  filterMode === 'worked' && styles.filterButtonTextActive,
                ]}
              >
                {t('archive.filterWorked')} ({stats.worked})
              </Text>
            </Pressable>
          </BlurView>

          {filteredTenders.length === 0 ? (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500 }}
            >
              <EmptyState
                icon={Archive}
                title={t('archive.noItems')}
                subtitle={
                  filterMode === 'all'
                    ? t('archive.noItemsDesc')
                    : filterMode === 'organized'
                    ? t('archive.noItemsOrganizedDesc')
                    : t('archive.noItemsWorkedDesc')
                }
                iconColor={colors.archiveLight}
              />
            </MotiView>
          ) : (
            <View style={styles.tendersSection}>
              <Text style={styles.sectionTitle}>
                {filteredTenders.length} {filteredTenders.length === 1 ? t('archive.tender') : t('archive.tenders')}
              </Text>

              {filteredTenders.map((tender, index) => {
                const isOrganizer = tender.organizerId === currentUser?.id;
                const myInvite = tender.invites.find(
                  (invite) => invite.userId === currentUser?.id
                );

                return (
                  <MotiView
                    key={tender.id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: index * 80 }}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.tenderCard,
                        pressed && styles.tenderCardPressed,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const route = isOrganizer
                          ? `/organizer/tender-details?id=${tender.id}`
                          : `/participant/tender-details?id=${tender.id}`;
                        router.push(route as any);
                      }}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderRight}>
                          {isOrganizer ? (
                            <View
                              style={[
                                styles.roleBadge,
                                { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
                              ]}
                            >
                              <Users size={14} color={colors.blue} />
                              <Text style={[styles.roleBadgeText, { color: colors.blue }]}>
                                {t('archive.organizedBadge')}
                              </Text>
                            </View>
                          ) : (
                            <View
                              style={[
                                styles.roleBadge,
                                {
                                  backgroundColor:
                                    myInvite?.status === 'accepted'
                                      ? 'rgba(16, 185, 129, 0.15)'
                                      : 'rgba(239, 68, 68, 0.15)',
                                },
                              ]}
                            >
                              {myInvite?.status === 'accepted' ? (
                                <>
                                  <CheckCircle2 size={14} color="#10B981" />
                                  <Text style={[styles.roleBadgeText, { color: colors.success }]}>
                                    {t('archive.participatedBadge')}
                                  </Text>
                                </>
                              ) : (
                                <>
                                  <XCircle size={14} color={colors.errorLight} />
                                  <Text style={[styles.roleBadgeText, { color: colors.errorLight }]}>
                                    {t('archive.rejectedBadge')}
                                  </Text>
                                </>
                              )}
                            </View>
                          )}
                        </View>
                        <Text style={styles.cardTitle}>{tender.title}</Text>
                      </View>

                      <View style={styles.cardDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailText}>{formatDate(tender.date)}</Text>
                          <Calendar size={16} color="#9CA3AF" />
                        </View>

                        <View style={styles.detailRow}>
                          <Text style={styles.detailText}>
                            {tender.startTime} - {tender.endTime}
                          </Text>
                          <Clock size={16} color="#9CA3AF" />
                        </View>

                        {isOrganizer ? (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailTextBold}>
                              {tender.invites.filter((inv) => inv.status === 'accepted').length} /{' '}
                              {tender.quota} {t('dashboard.workers')}
                            </Text>
                            <Users size={16} color="#7C3AED" />
                          </View>
                        ) : (
                          myInvite?.status === 'accepted' && (
                            <View style={styles.detailRow}>
                              <Text style={[styles.detailTextBold, { color: colors.success }]}>
                                ₪{tender.pay.toLocaleString()}
                              </Text>
                              <DollarSign size={16} color="#10B981" />
                            </View>
                          )
                        )}
                      </View>

                      {isOrganizer && (
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${Math.min(
                                    (tender.invites.filter((inv) => inv.status === 'accepted')
                                      .length /
                                      tender.quota) *
                                      100,
                                    100
                                  )}%`,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      )}
                    </Pressable>
                  </MotiView>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
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
  },
  headerContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 120,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.archivePrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  statCardContent: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
  },
  statCardGradient: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500' as const,
  },
  statValueWhite: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabelWhite: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500' as const,
  },
  filterContainer: {
    flexDirection: 'row-reverse',
    borderRadius: 16,
    padding: 4,
    gap: 4,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    shadowColor: colors.archivePrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  filterButtonGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 12,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textMuted,
    zIndex: 1,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: colors.archivePrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  emptyIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  tendersSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textMuted,
    marginBottom: 8,
    textAlign: 'right',
  },
  tenderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    shadowColor: colors.archivePrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  tenderCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderRight: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
    marginRight: 12,
  },
  roleBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  cardDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500' as const,
  },
  detailTextBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.archivePrimary,
    borderRadius: 3,
  },
});
