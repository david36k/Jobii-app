import { useOrganizerTenders } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar, Clock, DollarSign, ChevronLeft, History as HistoryIcon } from 'lucide-react-native';
import { Tender } from '@/types';
import { formatDate } from '@/utils/formatting';

export default function OrganizerHistory() {
  const tenders = useOrganizerTenders();

  const now = new Date();
  const closedTenders = tenders.filter((t) => t.status === 'closed' || t.date < now);

  const getAcceptedCount = (tender: Tender) => {
    return tender.invites.filter((inv) => inv.status === 'accepted').length;
  };



  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>היסטוריה</Text>
          <Text style={styles.subtitle}>מכרזים שהסתיימו</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>מכרזים קודמים ({closedTenders.length})</Text>

          {closedTenders.length === 0 ? (
            <View style={styles.emptyState}>
              <HistoryIcon size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>אין מכרזים בהיסטוריה</Text>
              <Text style={styles.emptyStateSubtext}>מכרזים שהסתיימו יופיעו כאן</Text>
            </View>
          ) : (
            closedTenders.map((tender) => {
              const acceptedCount = getAcceptedCount(tender);

              return (
                <TouchableOpacity
                  key={tender.id}
                  style={styles.tenderCard}
                  onPress={() => router.push(`/organizer/tender-details?id=${tender.id}` as any)}
                >
                  <View style={styles.tenderHeader}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>הסתיים</Text>
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
                    <View style={styles.detailRow}>
                      <Text style={styles.detailText}>₪{tender.pay}</Text>
                      <DollarSign size={16} color="#6B7280" />
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <Text style={styles.statsText}>
                      {acceptedCount} / {tender.quota} עובדים התקבלו
                    </Text>
                  </View>

                  <View style={styles.tenderFooter}>
                    <ChevronLeft size={20} color="#9CA3AF" />
                    <Text style={styles.invitesText}>
                      {tender.invites.length} הזמנות נשלחו
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'right',
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
    marginBottom: 12,
  },
  tenderTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    flex: 1,
    marginLeft: 8,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
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
  statsRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
    textAlign: 'right',
  },
  tenderFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invitesText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
