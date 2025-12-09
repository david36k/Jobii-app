import { useOrganizerTenders, useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Users, ChevronLeft, FileText, TrendingUp, CheckCircle2 } from 'lucide-react-native';
import { Tender } from '@/types';
import { useEffect } from 'react';
import { formatDate, getStatusColor, getStatusText } from '@/utils/formatting';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrganizerDashboard() {
  const tenders = useOrganizerTenders();
  const { currentUser } = useApp();

  const activeTenders = tenders.filter((t) => t.status !== 'closed');

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [activeTenders.length]);

  const getAcceptedCount = (tender: Tender) => {
    return tender.invites.filter((inv) => inv.status === 'accepted').length;
  };





  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>שלום, {currentUser?.name || 'מארגן'}</Text>
          <Text style={styles.subtitle}>לוח הבקרה שלך</Text>
        </View>

        <View style={styles.guidesSection}>
          <View style={styles.guideCard}>
            <View style={styles.guideIcon}>
              <FileText size={28} color="#4F46E5" />
            </View>
            <Text style={styles.guideTitle}>איך זה עובד?</Text>
            <Text style={styles.guideText}>
              צור מכרז חדש, בחר משתתפים, ושלח הזמנות. המשתתפים יקבלו הודעה ויוכלו לאשר או לדחות את ההזמנה.
            </Text>
            <TouchableOpacity
              style={styles.guideButton}
              onPress={() => router.push('/(organizer)/tenders' as any)}
            >
              <Text style={styles.guideButtonText}>עבור למכרזים</Text>
              <ChevronLeft size={16} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          <View style={styles.guideCard}>
            <View style={styles.guideIcon}>
              <TrendingUp size={28} color="#059669" />
            </View>
            <Text style={styles.guideTitle}>למה להשתמש במערכת?</Text>
            <Text style={styles.guideText}>
              נהל את כל המכרזים שלך במקום אחד. עקוב אחרי תגובות, נהל מכסות, ושמור על כל הפרטים מאורגנים.
            </Text>
            <TouchableOpacity
              style={styles.guideButton}
              onPress={() => router.push('/(organizer)/history' as any)}
            >
              <Text style={styles.guideButtonText}>צפה בהיסטוריה</Text>
              <ChevronLeft size={16} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          <View style={styles.guideCard}>
            <View style={styles.guideIcon}>
              <CheckCircle2 size={28} color="#F59E0B" />
            </View>
            <Text style={styles.guideTitle}>כמה זה עולה?</Text>
            <Text style={styles.guideText}>
              המערכת חינמית לחלוטין! נהל כמה מכרזים שתרצה, הזמן כמה עובדים שתרצה, ותהנה מהנוחות המלאות.
            </Text>
            <TouchableOpacity
              style={styles.guideButton}
              onPress={() => router.push('/(organizer)/settings' as any)}
            >
              <Text style={styles.guideButtonText}>הגדרות</Text>
              <ChevronLeft size={16} color="#4F46E5" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>מכרזים פעילים ({activeTenders.length})</Text>

          {activeTenders.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>אין מכרזים פעילים</Text>
              <Text style={styles.emptyStateSubtext}>עבור לעמוד &quot;מכרזים&quot; כדי ליצור מכרז חדש</Text>
              <TouchableOpacity
                style={styles.emptyStateCTA}
                onPress={() => router.push('/(organizer)/tenders' as any)}
              >
                <FileText size={20} color="#FFFFFF" />
                <Text style={styles.emptyStateCTAText}>לעמוד מכרזים</Text>
              </TouchableOpacity>
            </View>
          ) : (
            activeTenders.map((tender) => {
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
                        style={[styles.statusText, { color: getStatusColor(tender.status) }]}
                      >
                        {getStatusText(tender.status)}
                      </Text>
                    </View>
                    <Text style={styles.tenderTitle}>{tender.title}</Text>
                  </View>

                  <View style={styles.tenderDetails}>
                    <View style={styles.payRow}>
                      <Text style={styles.payAmount}>₪{tender.pay}</Text>
                    </View>
                    
                    <View style={styles.dateTimeSection}>
                      <View style={styles.dateRow}>
                        <Text style={styles.dateText}>{formatDate(tender.date)}</Text>
                        <Calendar size={18} color="#4F46E5" />
                      </View>
                      <View style={styles.timeRow}>
                        <Text style={styles.timeText}>
                          {tender.startTime} - {tender.endTime}
                        </Text>
                        <Clock size={16} color="#6B7280" />
                      </View>
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
                              progress >= 100 ? '#059669' : progress >= 70 ? '#F59E0B' : '#3B82F6',
                          },
                        ]}
                      />
                    </View>
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
    </SafeAreaView>
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
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  guidesSection: {
    marginBottom: 32,
    gap: 16,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  guideIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    marginBottom: 16,
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  guideButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#4F46E5',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 16,
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
    marginBottom: 24,
  },
  emptyStateCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  emptyStateCTAText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
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
    flexDirection: 'row',
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
  tenderDetails: {
    marginBottom: 16,
  },
  payRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  payAmount: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#047857',
  },
  dateTimeSection: {
    gap: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
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
  tenderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  invitesText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
