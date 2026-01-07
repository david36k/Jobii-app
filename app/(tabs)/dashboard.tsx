import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign,
  Plus,
  TrendingUp,
  CalendarClock,
  ChevronLeft
} from 'lucide-react-native';
import { Tender } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/utils/formatting';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Mode = 'work' | 'hire';

export default function UnifiedDashboard() {
  const { currentUser, tenders } = useApp();
  const [mode, setMode] = useState<Mode>('work');

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {currentUser?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>שלום, {currentUser?.name || 'משתמש'}</Text>
            <Text style={styles.subtitle}>
              {mode === 'work' ? 'מצא עבודה' : 'גייס עובדים'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.modeToggleContainer}>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'work' && styles.modeButtonActive,
            ]}
            onPress={() => handleModeChange('work')}
            activeOpacity={0.7}
          >
            <Briefcase
              size={20}
              color={mode === 'work' ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.modeButtonText,
                mode === 'work' && styles.modeButtonTextActive,
              ]}
            >
              מחפש עבודה
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'hire' && styles.modeButtonActive,
            ]}
            onPress={() => handleModeChange('hire')}
            activeOpacity={0.7}
          >
            <Users
              size={20}
              color={mode === 'hire' ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.modeButtonText,
                mode === 'hire' && styles.modeButtonTextActive,
              ]}
            >
              מגייס עובדים
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {mode === 'work' ? (
          <WorkView
            tenders={myWork}
            currentUser={currentUser}
            monthlyEarnings={monthlyEarnings}
            upcomingShifts={upcomingShifts}
          />
        ) : (
          <HireView tenders={myTenders} />
        )}
      </ScrollView>
    </SafeAreaView>
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
        return { text: 'ממתין', color: '#F59E0B', bg: '#FEF3C7' };
      case 'accepted':
        return { text: 'אושר', color: '#059669', bg: '#D1FAE5' };
      case 'rejected':
        return { text: 'נדחה', color: '#DC2626', bg: '#FEE2E2' };
      default:
        return { text: invite.status, color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  return (
    <>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.statValue}>₪{monthlyEarnings.toLocaleString()}</Text>
          <Text style={styles.statLabel}>רווח החודש</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, styles.statIconSecondary]}>
            <CalendarClock size={24} color="#4F46E5" />
          </View>
          <Text style={styles.statValueSecondary}>{upcomingShifts}</Text>
          <Text style={styles.statLabelSecondary}>משמרות קרובות</Text>
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
          tenders.map((tender) => {
            const status = getStatusBadge(tender);
            const invite = getInviteForUser(tender);

            if (!status || !invite) return null;

            return (
              <TouchableOpacity
                key={tender.id}
                style={styles.tenderCard}
                onPress={() => router.push(`/participant/tender-details?id=${tender.id}` as any)}
                activeOpacity={0.7}
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
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </>
  );
}

function HireView({ tenders }: { tenders: Tender[] }) {
  const getAcceptedCount = (tender: Tender) => {
    return tender.invites.filter((inv) => inv.status === 'accepted').length;
  };

  return (
    <>
      <TouchableOpacity
        style={styles.createTenderCTA}
        onPress={() => router.push('/organizer/create-tender' as any)}
        activeOpacity={0.8}
      >
        <View style={styles.ctaIconContainer}>
          <Plus size={32} color="#FFFFFF" />
        </View>
        <View style={styles.ctaContent}>
          <Text style={styles.ctaTitle}>צור מכרז חדש</Text>
          <Text style={styles.ctaSubtitle}>גייס עובדים במהירות ובקלות</Text>
        </View>
        <ChevronLeft size={24} color="#FFFFFF" />
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
          tenders.map((tender) => {
            const acceptedCount = getAcceptedCount(tender);
            const progress = tender.quota > 0 ? (acceptedCount / tender.quota) * 100 : 0;

            return (
              <TouchableOpacity
                key={tender.id}
                style={styles.tenderCard}
                onPress={() => router.push(`/organizer/tender-details?id=${tender.id}` as any)}
                activeOpacity={0.7}
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
              </TouchableOpacity>
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
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
    backgroundColor: '#4F46E5',
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
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  modeToggleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modeToggle: {
    flexDirection: 'row-reverse',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardPrimary: {
    backgroundColor: '#4F46E5',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIconSecondary: {
    backgroundColor: '#EEF2FF',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'right',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  statValueSecondary: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
    textAlign: 'right',
  },
  statLabelSecondary: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  createTenderCTA: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    gap: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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
    borderTopColor: '#F3F4F6',
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
