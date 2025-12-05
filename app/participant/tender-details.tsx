import { useApp } from '@/contexts/AppContext';
import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Calendar, Clock, DollarSign, Users, Check, X, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { formatDateFull } from '@/utils/dateFormatter';

export default function ParticipantTenderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTenderById, updateInviteStatus, currentUser } = useApp();

  const tender = getTenderById(id);

  if (!tender || !currentUser) {
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

  const invite = tender.invites.find((inv) => inv.userId === currentUser.id);

  if (!invite) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#DC2626" />
            <Text style={styles.errorText}>You are not invited to this tender</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }



  const handleAccept = () => {
    const currentAcceptedCountExcludingMe = tender.invites.filter(
      (inv) => inv.status === 'accepted' && inv.userId !== currentUser.id
    ).length;

    if (invite.status !== 'accepted' && currentAcceptedCountExcludingMe >= tender.quota) {
      Alert.alert('Quota Full', 'Sorry, this tender has reached its quota. Please try another one.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Alert.alert('Accept Tender', 'Are you sure you want to accept this job offer?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Accept',
        style: 'default',
        onPress: () => {
          updateInviteStatus(tender.id, currentUser.id, 'accepted');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Success', 'You have accepted the job offer!', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        },
      },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Reject Tender', 'Are you sure you want to reject this job offer?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          updateInviteStatus(tender.id, currentUser.id, 'rejected');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert('Rejected', 'You have rejected the job offer.', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        },
      },
    ]);
  };

  const getStatusInfo = () => {
    switch (invite.status) {
      case 'accepted':
        return { text: 'Accepted', color: '#059669', bg: '#D1FAE5', icon: Check };
      case 'rejected':
        return { text: 'Rejected', color: '#DC2626', bg: '#FEE2E2', icon: X };
      default:
        return { text: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: Clock };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.statusCard, { backgroundColor: statusInfo.bg }]}>
            <StatusIcon size={24} color={statusInfo.color} />
            <Text style={[styles.statusCardText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{tender.title}</Text>

            <View style={styles.organizerSection}>
              <Text style={styles.organizerLabel}>Organized by</Text>
              <Text style={styles.organizerName}>{tender.organizerName}</Text>
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
                  <Text style={styles.detailLabel}>Workers Needed</Text>
                  <Text style={styles.detailValue}>{tender.quota}</Text>
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

          {invite.status === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Check size={24} color="#FFFFFF" />
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                <X size={24} color="#DC2626" />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}

          {invite.status === 'rejected' && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Check size={24} color="#FFFFFF" />
                <Text style={styles.acceptButtonText}>Change to Accept</Text>
              </TouchableOpacity>
            </View>
          )}

          {invite.status === 'accepted' && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleReject}>
                <X size={24} color="#FFFFFF" />
                <Text style={styles.cancelButtonText}>Cancel Attendance</Text>
              </TouchableOpacity>
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  statusCardText: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  organizerSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  organizerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  organizerName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
  },
  detailsGrid: {
    gap: 16,
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
    marginTop: 24,
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
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  rejectButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#DC2626',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
