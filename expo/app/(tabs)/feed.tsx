import { useMemo } from 'react';
import { router } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { BriefcaseBusiness, CalendarDays, Clock3, MapPin, Coins, Users } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/formatting';
import EmptyState from '@/components/EmptyState';
import { Tender } from '@/types';

export default function FeedScreen() {
  const { tenders, currentUser } = useApp();

  const openTenders = useMemo(() => {
    const now = new Date();
    const filtered = tenders
      .filter((tender) => tender.date >= now && tender.status !== 'closed')
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    console.log('[FeedScreen] open tenders count:', filtered.length);
    return filtered;
  }, [tenders]);

  const handleOpenTender = (tender: Tender) => {
    console.log('[FeedScreen] open tender pressed:', tender.id);

    if (currentUser?.id === tender.organizerId) {
      router.push({
        pathname: '/organizer/tender-details',
        params: { id: tender.id },
      });
      return;
    }

    router.push({
      pathname: '/participant/tender-details',
      params: { id: tender.id },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#EEF2FF', '#FFFFFF']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BlurView intensity={85} tint="light" style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconWrap}>
              <BriefcaseBusiness size={22} color={colors.primary} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>לוח משרות</Text>
              <Text style={styles.headerSubtitle}>כל המשרות הפתוחות במקום אחד</Text>
            </View>
          </View>
        </BlurView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          testID="feed-scroll-view"
        >
          {openTenders.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="אין משרות פתוחות כרגע"
              subtitle="כשתיפתח משרה חדשה היא תופיע כאן"
            />
          ) : (
            openTenders.map((tender) => {
              const acceptedCount = tender.invites.filter((invite) => invite.status === 'accepted').length;
              const remainingSpots = Math.max(tender.quota - acceptedCount, 0);
              const isOwnedByCurrentUser = currentUser?.id === tender.organizerId;

              return (
                <TouchableOpacity
                  key={tender.id}
                  testID={`feed-tender-card-${tender.id}`}
                  style={styles.cardTouchable}
                  activeOpacity={0.88}
                  onPress={() => handleOpenTender(tender)}
                >
                  <LinearGradient
                    colors={isOwnedByCurrentUser ? ['#E0F2FE', '#F8FAFC'] : ['#FFFFFF', '#F8FAFC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={styles.titleWrap}>
                        <Text style={styles.title}>{tender.title}</Text>
                        <Text style={styles.organizerName}>{tender.organizerName}</Text>
                      </View>
                      <View style={[styles.statusBadge, isOwnedByCurrentUser && styles.statusBadgeOwned]}>
                        <Text style={[styles.statusText, isOwnedByCurrentUser && styles.statusTextOwned]}>
                          {isOwnedByCurrentUser ? 'המשרה שלי' : 'פתוח'}
                        </Text>
                      </View>
                    </View>

                    {!!tender.description && (
                      <Text style={styles.description} numberOfLines={2}>
                        {tender.description}
                      </Text>
                    )}

                    <View style={styles.metaGrid}>
                      <View style={styles.metaItem}>
                        <CalendarDays size={16} color={colors.primary} />
                        <Text style={styles.metaText}>{formatDate(tender.date)}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Clock3 size={16} color={colors.primary} />
                        <Text style={styles.metaText}>{tender.startTime} - {tender.endTime}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Coins size={16} color={colors.warningDark} />
                        <Text style={styles.metaText}>₪{tender.pay}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Users size={16} color={colors.successDark} />
                        <Text style={styles.metaText}>{remainingSpots} מקומות פנויים</Text>
                      </View>
                      {!!tender.location && (
                        <View style={[styles.metaItem, styles.metaItemWide]}>
                          <MapPin size={16} color={colors.textMuted} />
                          <Text style={styles.metaText} numberOfLines={1}>{tender.location}</Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
    textAlign: 'right',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 130,
    gap: 14,
  },
  cardTouchable: {
    borderRadius: 24,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLighter,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
    textAlign: 'right',
  },
  organizerName: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusBadgeOwned: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.successDark,
  },
  statusTextOwned: {
    color: colors.blue,
  },
  description: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  metaGrid: {
    marginTop: 16,
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  metaItemWide: {
    width: '100%',
  },
  metaText: {
    flexShrink: 1,
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
  },
});
