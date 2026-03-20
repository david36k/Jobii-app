import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { colors } from '@/constants/colors';
import RequireAuthModal from '@/components/ui/RequireAuthModal';
import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Calendar, Clock, DollarSign, Users, Check, X, AlertCircle, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { formatDateFull, getStatusColor } from '@/utils/formatting';
import { useState } from 'react';

export default function ParticipantTenderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTenderById, updateInviteStatus, currentUser } = useApp();
  const { t } = useLanguage();
  const [showRequireAuthModal, setShowRequireAuthModal] = useState<boolean>(false);

  const tender = getTenderById(id);

  if (!tender) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color={colors.error} />
            <Text style={styles.errorText}>{t('tender.tenderNotFound')}</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>{t('tender.goBack')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const invite = currentUser ? tender.invites.find((inv) => inv.userId === currentUser.id) : undefined;

  if (currentUser && !invite) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color={colors.error} />
            <Text style={styles.errorText}>{t('tender.notInvited')}</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>{t('tender.goBack')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }



  const handleAccept = () => {
    if (!currentUser || !invite) return;
    const currentAcceptedCountExcludingMe = tender.invites.filter(
      (inv) => inv.status === 'accepted' && inv.userId !== currentUser.id
    ).length;

    if (invite.status !== 'accepted' && currentAcceptedCountExcludingMe >= tender.quota) {
      Alert.alert(t('tender.quotaFull'), t('tender.quotaFullMsg'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Alert.alert(t('tender.confirmAccept'), t('tender.confirmAcceptMsg'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('tender.accept'),
        style: 'default',
        onPress: () => {
          updateInviteStatus(tender.id, currentUser.id, 'accepted');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(t('common.success'), t('tender.acceptedMsg'), [
            {
              text: t('common.confirm'),
              onPress: () => router.back(),
            },
          ]);
        },
      },
    ]);
  };

  const handleReject = () => {
    if (!currentUser || !invite) return;
    Alert.alert(t('tender.confirmReject'), t('tender.confirmRejectMsg'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('tender.reject'),
        style: 'destructive',
        onPress: () => {
          updateInviteStatus(tender.id, currentUser.id, 'rejected');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert(t('dashboard.statusRejected'), t('tender.rejectedMsg'), [
            {
              text: t('common.confirm'),
              onPress: () => router.back(),
            },
          ]);
        },
      },
    ]);
  };

  const getStatusInfo = () => {
    if (!currentUser || !invite) {
      const statusColor = getStatusColor(tender.status);

      switch (tender.status) {
        case 'full':
          return { text: t('dashboard.statusFull'), color: statusColor, bg: `${statusColor}20`, icon: Check };
        case 'closed':
          return { text: t('dashboard.statusClosed'), color: statusColor, bg: `${statusColor}20`, icon: AlertCircle };
        default:
          return { text: t('dashboard.statusOpen'), color: statusColor, bg: `${statusColor}20`, icon: Clock };
      }
    }

    switch (invite.status) {
      case 'accepted':
        return { text: t('dashboard.statusAccepted'), color: colors.successDark, bg: colors.statusAcceptedBg, icon: Check };
      case 'rejected':
        return { text: t('dashboard.statusRejected'), color: colors.error, bg: colors.statusRejectedBg, icon: X };
      default:
        return { text: t('dashboard.statusPending'), color: colors.warning, bg: colors.statusPendingBg, icon: Clock };
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
              <Text style={styles.organizerLabel}>{t('tender.organizedBy')}</Text>
              <Text style={styles.organizerName}>{tender.organizerName}</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Calendar size={24} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{t('tender.date')}</Text>
                  <Text style={styles.detailValue}>{formatDateFull(tender.date)}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Clock size={24} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{t('tender.time')}</Text>
                  <Text style={styles.detailValue}>
                    {tender.startTime} - {tender.endTime}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <DollarSign size={24} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{t('tender.pay')}</Text>
                  <Text style={styles.detailValue}>₪{tender.pay}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Users size={24} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{t('tender.workersNeeded')}</Text>
                  <Text style={styles.detailValue}>{tender.quota}</Text>
                </View>
              </View>

              {tender.location && (
                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <MapPin size={24} color={colors.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{t('tender.location')}</Text>
                    <Text style={styles.detailValue}>{tender.location}</Text>
                  </View>
                </View>
              )}
            </View>

            {tender.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionLabel}>{t('tender.description')}</Text>
                <Text style={styles.descriptionText}>{tender.description}</Text>
              </View>
            )}
          </View>

          {!currentUser && tender.status !== 'closed' && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowRequireAuthModal(true);
                }}
              >
                <Check size={24} color="#FFFFFF" />
                <Text style={styles.acceptButtonText}>{t('tender.apply')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentUser && invite?.status === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Check size={24} color={colors.background} />
                <Text style={styles.acceptButtonText}>{t('tender.accept')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                <X size={24} color={colors.error} />
                <Text style={styles.rejectButtonText}>{t('tender.reject')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentUser && invite?.status === 'rejected' && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Check size={24} color={colors.background} />
                <Text style={styles.acceptButtonText}>{t('tender.changeToAccept')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentUser && invite?.status === 'accepted' && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleReject}>
                <X size={24} color={colors.background} />
                <Text style={styles.cancelButtonText}>{t('tender.cancelAttendance')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      <RequireAuthModal visible={showRequireAuthModal} onClose={() => setShowRequireAuthModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
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
    color: colors.error,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.background,
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
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  organizerSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  organizerLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  organizerName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
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
    backgroundColor: colors.gradientHireStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  descriptionSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textMuted,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.textSecondary,
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
    backgroundColor: colors.successDark,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.successDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.background,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.error,
  },
  rejectButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.error,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.background,
  },
});
