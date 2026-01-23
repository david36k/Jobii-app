import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Archive, Calendar, Users, DollarSign } from 'lucide-react-native';
import { useAppContext } from '@/contexts/AppContext';
import { formatCurrency } from '@/utils/formatting';
import { formatDateRange } from '@/utils/dateFormatter';

export default function ArchiveScreen() {
  const { tenders, user } = useAppContext();

  const completedTenders = tenders.filter(
    (tender) =>
      tender.status === 'closed' &&
      (tender.organizerId === user?.id ||
        tender.invites.some((invite) => invite.userId === user?.id))
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EEF2FF', '#F9FAFB', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <BlurView intensity={80} tint="light" style={styles.header}>
          <View style={styles.headerContent}>
            <Archive size={28} color="#4F46E5" />
            <Text style={styles.headerTitle}>ארכיון</Text>
          </View>
        </BlurView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {completedTenders.length === 0 ? (
            <View style={styles.emptyState}>
              <Archive size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>אין פריטים בארכיון</Text>
              <Text style={styles.emptySubtitle}>
                מכרזים והזמנות שהסתיימו יופיעו כאן
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {completedTenders.length} מכרזים שהסתיימו
              </Text>

              {completedTenders.map((tender) => {
                const isOrganizer = tender.organizerId === user?.id;
                const myInvite = tender.invites.find(
                  (invite) => invite.userId === user?.id
                );

                return (
                  <TouchableOpacity
                    key={tender.id}
                    style={styles.tenderCard}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{tender.title}</Text>
                      {isOrganizer ? (
                        <View style={styles.organizerBadge}>
                          <Text style={styles.badgeText}>מארגן</Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.statusBadge,
                            myInvite?.status === 'accepted'
                              ? styles.acceptedBadge
                              : styles.declinedBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              myInvite?.status === 'accepted'
                                ? styles.acceptedText
                                : styles.declinedText,
                            ]}
                          >
                            {myInvite?.status === 'accepted' ? 'אישרתי' : 'דחיתי'}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.cardDetails}>
                      <View style={styles.detailRow}>
                        <Calendar size={16} color="#6B7280" />
                        <Text style={styles.detailText}>
                          {formatDateRange(tender.startDate, tender.endDate)}
                        </Text>
                      </View>

                      {isOrganizer && (
                        <View style={styles.detailRow}>
                          <Users size={16} color="#6B7280" />
                          <Text style={styles.detailText}>
                            {tender.acceptedCount} / {tender.quota} עובדים
                          </Text>
                        </View>
                      )}

                      <View style={styles.detailRow}>
                        <DollarSign size={16} color="#6B7280" />
                        <Text style={styles.detailText}>
                          {formatCurrency(tender.hourlyRate)}/שעה
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  tenderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  organizerBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  acceptedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  declinedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  acceptedText: {
    color: '#10B981',
  },
  declinedText: {
    color: '#EF4444',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
