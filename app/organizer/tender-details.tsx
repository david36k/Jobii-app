import { useApp } from '@/contexts/AppContext';
import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Calendar, Clock, DollarSign, Users, AlertCircle, Check, X, Clock as PendingIcon } from 'lucide-react-native';
import { formatDateFull } from '@/utils/dateFormatter';

export default function OrganizerTenderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTenderById } = useApp();

  const tender = getTenderById(id);

  if (!tender) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#DC2626" />
            <Text style={styles.errorText}>Tender not found</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }



  const acceptedCount = tender.invites.filter((inv) => inv.status === 'accepted').length;
  const pendingCount = tender.invites.filter((inv) => inv.status === 'pending').length;
  const rejectedCount = tender.invites.filter((inv) => inv.status === 'rejected').length;

  const progress = tender.quota > 0 ? (acceptedCount / tender.quota) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#3B82F6';
      case 'full':
        return '#059669';
      case 'closed':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'full':
        return 'Full';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{tender.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(tender.status)}20` },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor(tender.status) }]}>
                  {getStatusText(tender.status)}
                </Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Calendar size={24} color="#4F46E5" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{formatDateFull(tender.date)}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Clock size={24} color="#4F46E5" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>
                    {tender.startTime} - {tender.endTime}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <DollarSign size={24} color="#4F46E5" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Payment</Text>
                  <Text style={styles.detailValue}>₪{tender.pay}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Users size={24} color="#4F46E5" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Quota</Text>
                  <Text style={styles.detailValue}>{tender.quota} workers</Text>
                </View>
              </View>
            </View>

            {tender.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.descriptionText}>{tender.description}</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Workers Confirmed</Text>
                <Text style={styles.progressCount}>
                  {acceptedCount} / {tender.quota}
                </Text>
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

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Check size={20} color="#059669" />
                </View>
                <Text style={styles.statValue}>{acceptedCount}</Text>
                <Text style={styles.statLabel}>Accepted</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                  <PendingIcon size={20} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>{pendingCount}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
                  <X size={20} color="#DC2626" />
                </View>
                <Text style={styles.statValue}>{rejectedCount}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Invites ({tender.invites.length})</Text>

            {tender.invites.map((invite) => {
              const getInviteStatusStyle = () => {
                switch (invite.status) {
                  case 'accepted':
                    return { bg: '#D1FAE5', color: '#059669', icon: Check };
                  case 'rejected':
                    return { bg: '#FEE2E2', color: '#DC2626', icon: X };
                  default:
                    return { bg: '#FEF3C7', color: '#F59E0B', icon: PendingIcon };
                }
              };

              const statusStyle = getInviteStatusStyle();
              const StatusIcon = statusStyle.icon;

              return (
                <View key={invite.userId || `guest-${invite.userPhone}`} style={styles.inviteItem}>
                  <View style={styles.inviteInfo}>
                    <View style={styles.inviteNameRow}>
                      <Text style={styles.inviteName}>{invite.userName}</Text>
                      {invite.isGuest && (
                        <View style={styles.guestBadge}>
                          <Text style={styles.guestBadgeText}>SMS</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.invitePhone}>{invite.userPhone}</Text>
                  </View>
                  <View style={[styles.inviteStatus, { backgroundColor: statusStyle.bg }]}>
                    <StatusIcon size={16} color={statusStyle.color} />
                    <Text style={[styles.inviteStatusText, { color: statusStyle.color }]}>
                      {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#DC2626',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  detailsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  descriptionSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 24,
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
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  inviteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  inviteInfo: {
    flex: 1,
  },
  inviteName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  invitePhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  inviteStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  inviteStatusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  inviteNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  guestBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  guestBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#F59E0B',
  },
});
