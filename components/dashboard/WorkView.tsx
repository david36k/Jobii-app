import { colors } from '@/constants/colors';
import { dashboardScreenStyles as styles } from '@/components/dashboard/dashboardScreenStyles';
import { formatDate } from '@/utils/formatting';
import EmptyState from '@/components/EmptyState';
import { Tender, User } from '@/types';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  Briefcase,
  Calendar,
  CalendarClock,
  Clock,
  DollarSign,
  TrendingUp,
} from 'lucide-react-native';

export type WorkViewTranslate = (key: string) => string;

type Props = {
  tenders: Tender[];
  currentUser: User | null;
  monthlyEarnings: number;
  upcomingShifts: number;
  t: WorkViewTranslate;
};

export default function WorkView({ tenders, currentUser, monthlyEarnings, upcomingShifts, t }: Props) {
  const getInviteForUser = (tender: Tender) =>
    tender.invites.find((inv) => inv.userId === currentUser?.id);

  const getStatusBadge = (tender: Tender) => {
    const invite = getInviteForUser(tender);
    if (!invite) return null;

    switch (invite.status) {
      case 'pending':
        return { text: t('dashboard.statusPending'), color: colors.warning, bg: colors.statusPendingBg };
      case 'accepted':
        return {
          text: t('dashboard.statusAccepted'),
          color: colors.successDark,
          bg: colors.statusAcceptedBg,
        };
      case 'rejected':
        return { text: t('dashboard.statusRejected'), color: colors.error, bg: colors.statusRejectedBg };
      default:
        return { text: invite.status, color: colors.textMuted, bg: colors.statusMutedBg };
    }
  };

  return (
    <>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary, { shadowColor: colors.success }]}>
          <LinearGradient
            colors={[colors.success, colors.successDark, colors.successDarker]}
            style={styles.statCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color={colors.background} />
            </View>
            <Text style={styles.statValue}>₪{monthlyEarnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{t('dashboard.monthlyEarnings')}</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <BlurView intensity={60} tint="light" style={styles.statCardBlur}>
            <View style={[styles.statIconContainer, styles.statIconSecondary]}>
              <CalendarClock size={24} color={colors.success} />
            </View>
            <Text style={styles.statValueSecondary}>{upcomingShifts}</Text>
            <Text style={styles.statLabelSecondary}>{t('dashboard.upcomingShifts')}</Text>
          </BlurView>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.openInvitations')}</Text>

        {tenders.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={t('dashboard.noInvitations')}
            subtitle={t('dashboard.noInvitationsDesc')}
            iconColor={colors.borderLight}
          />
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
                  style={({ pressed }) => [styles.tenderCard, pressed && styles.tenderCardPressed]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/participant/tender-details', params: { id: tender.id } });
                  }}
                >
                  <View style={styles.tenderHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                    </View>
                    <Text style={styles.tenderTitle}>{tender.title}</Text>
                  </View>

                  <View style={styles.organizerInfo}>
                    <Text style={styles.organizerText}>
                      {t('dashboard.by')} {tender.organizerName}
                    </Text>
                  </View>

                  <View style={styles.tenderDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailText}>{formatDate(tender.date)}</Text>
                      <Calendar size={16} color={colors.textMuted} />
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailText}>
                        {tender.startTime} - {tender.endTime}
                      </Text>
                      <Clock size={16} color={colors.textMuted} />
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.payText}>₪{tender.pay}</Text>
                      <DollarSign size={16} color={colors.successDark} />
                    </View>
                  </View>

                  {invite.status === 'pending' && (
                    <View style={styles.pendingIndicator}>
                      <Text style={styles.pendingText}>{t('dashboard.clickToRespond')}</Text>
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
