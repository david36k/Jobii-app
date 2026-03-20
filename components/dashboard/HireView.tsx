import { colors } from '@/constants/colors';
import { dashboardScreenStyles as styles } from '@/components/dashboard/dashboardScreenStyles';
import { formatDate, getStatusColor, getStatusText } from '@/utils/formatting';
import EmptyState from '@/components/EmptyState';
import { Tender } from '@/types';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Calendar, ChevronLeft, Clock, Plus, Sparkles, Users } from 'lucide-react-native';
import type { WorkViewTranslate } from '@/components/dashboard/WorkView';

type Props = {
  tenders: Tender[];
  hasNoCredits: boolean;
  hasLowCredits: boolean;
  t: WorkViewTranslate;
  isGuest: boolean;
  onRequireAuth: () => void;
};

export default function HireView({ tenders, hasNoCredits, hasLowCredits, t, isGuest, onRequireAuth }: Props) {
  const getAcceptedCount = (tender: Tender) =>
    tender.invites.filter((inv) => inv.status === 'accepted').length;

  return (
    <>
      {hasLowCredits && (
        <TouchableOpacity style={styles.creditsBanner} activeOpacity={0.8}>
          <LinearGradient
            colors={hasNoCredits ? [colors.errorLight, colors.error] : [colors.warning, colors.warningDark]}
            style={styles.creditsBannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Sparkles size={24} color={colors.background} />
            <View style={styles.creditsBannerContent}>
              <Text style={styles.creditsBannerTitle}>
                {hasNoCredits ? t('dashboard.creditsOut') : t('dashboard.creditsLow')}
              </Text>
              <Text style={styles.creditsBannerSubtitle}>
                {hasNoCredits ? t('dashboard.creditsOutDesc') : t('dashboard.creditsLowDesc')}
              </Text>
            </View>
            <ChevronLeft size={20} color={colors.background} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.createTenderCTA}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (isGuest) {
            onRequireAuth();
            return;
          }

          router.push('/organizer/create-tender');
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primaryLight, colors.primary]}
          style={styles.ctaGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.ctaIconContainer}>
            <Plus size={32} color={colors.background} />
          </View>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>{t('dashboard.createTenderCTA')}</Text>
            <Text style={styles.ctaSubtitle}>{t('dashboard.createTenderDesc')}</Text>
          </View>
          <ChevronLeft size={24} color={colors.background} />
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{isGuest ? t('dashboard.publicTenders') : t('dashboard.myTenders')}</Text>

        {tenders.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('dashboard.noTenders')}
            subtitle={t('dashboard.noTendersDesc')}
            iconColor={colors.borderLight}
          />
        ) : (
          tenders.map((tender, index) => {
            const acceptedCount = getAcceptedCount(tender);
            const progress = tender.quota > 0 ? (acceptedCount / tender.quota) * 100 : 0;

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
                    router.push({ pathname: '/organizer/tender-details', params: { id: tender.id } });
                  }}
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
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressCount}>
                        {acceptedCount} / {tender.quota}
                      </Text>
                      <Text style={styles.progressLabel}>{t('dashboard.workers')}</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor:
                              progress >= 100
                                ? colors.successDark
                                : progress >= 70
                                  ? colors.warning
                                  : colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </Pressable>
              </MotiView>
            );
          })
        )}
      </View>
    </>
  );
}
