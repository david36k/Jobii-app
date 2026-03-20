import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { router } from 'expo-router';
import RequireAuthModal from '@/components/ui/RequireAuthModal';
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, LogOut, MessageCircle, Bell, ChevronLeft, Edit, Coins, Plus, AlertTriangle, Languages } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function Settings() {
  const { currentUser, logout, deleteAccount } = useApp();
  const { language, switchLanguage, t, isRTL } = useLanguage();
  const [showRequireAuthModal, setShowRequireAuthModal] = useState(false);

  const handleLogout = () => {
    Alert.alert(t('settings.logoutConfirm'), t('settings.logoutMessage'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('settings.logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/profile/edit');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, !isRTL && styles.textLeft]}>{t('settings.title')}</Text>
          <Text style={[styles.subtitle, !isRTL && styles.textLeft]}>{t('settings.subtitle')}</Text>
        </View>

        <View style={[styles.profileCard, !isRTL && styles.profileCardLTR]}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>
              {currentUser?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={[styles.profileInfo, !isRTL && styles.profileInfoLTR]}>
            <Text style={styles.profileName}>{currentUser?.name}</Text>
            <View style={[styles.profileDetail, !isRTL && styles.profileDetailLTR]}>
              <Text style={styles.profilePhone}>{currentUser?.phone}</Text>
              <Phone size={16} color={colors.textMuted} />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.creditsCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (!currentUser) {
              setShowRequireAuthModal(true);
              return;
            }
            router.push('/tokens');
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.warning, colors.warningDark]}
            style={styles.creditsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.creditsContent, !isRTL && styles.creditsContentLTR]}>
              <View style={styles.creditsIconContainer}>
                <Coins size={32} color={colors.background} />
              </View>
              <View style={[styles.creditsInfo, !isRTL && styles.creditsInfoLTR]}>
                <Text style={styles.creditsLabel}>{t('settings.myCredits')}</Text>
                <Text style={styles.creditsValue}>{currentUser?.credits || 0} {t('dashboard.credits')}</Text>
              </View>
            </View>
            <View style={styles.addCreditsButton}>
              <Plus size={24} color={colors.background} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, !isRTL && styles.textLeft]}>{t('settings.general')}</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                switchLanguage(language === 'he' ? 'en' : 'he');
              }}
            >
              <View style={[styles.menuItemRight, !isRTL && styles.menuItemLeft]}>
                <ChevronLeft size={20} color={colors.muted} style={!isRTL && { transform: [{ rotate: '180deg' }] }} />
                <Text style={styles.menuItemText}>{language === 'he' ? 'English' : 'עברית'}</Text>
              </View>
              <Languages size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditProfile}
            >
              <View style={[styles.menuItemRight, !isRTL && styles.menuItemLeft]}>
                <ChevronLeft size={20} color={colors.muted} style={!isRTL && { transform: [{ rotate: '180deg' }] }} />
                <Text style={styles.menuItemText}>{t('settings.editProfile')}</Text>
              </View>
              <Edit size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/tokens');
              }}
            >
              <View style={[styles.menuItemRight, !isRTL && styles.menuItemLeft]}>
                <ChevronLeft size={20} color={colors.muted} style={!isRTL && { transform: [{ rotate: '180deg' }] }} />
                <Text style={styles.menuItemText}>{t('settings.tokens')}</Text>
              </View>
              <Coins size={20} color={colors.warning} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(t('settings.notifications'), t('settings.notificationsComingSoon'));
              }}
            >
              <View style={[styles.menuItemRight, !isRTL && styles.menuItemLeft]}>
                <ChevronLeft size={20} color={colors.muted} style={!isRTL && { transform: [{ rotate: '180deg' }] }} />
                <Text style={styles.menuItemText}>{t('settings.notifications')}</Text>
              </View>
              <Bell size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(t('settings.contact'), t('settings.contactEmail'));
              }}
            >
              <View style={[styles.menuItemRight, !isRTL && styles.menuItemLeft]}>
                <ChevronLeft size={20} color={colors.muted} style={!isRTL && { transform: [{ rotate: '180deg' }] }} />
                <Text style={styles.menuItemText}>{t('settings.contact')}</Text>
              </View>
              <MessageCircle size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutButton, !isRTL && styles.logoutButtonLTR]} onPress={handleLogout}>
          <LogOut size={24} color={colors.error} />
          <Text style={styles.logoutButtonText}>{t('settings.logout')}</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, !isRTL && styles.textLeft]}>{t('settings.about')}</Text>
          <View style={styles.aboutCard}>
            <Text style={[styles.aboutTitle, !isRTL && styles.textLeft]}>Jobii</Text>
            <Text style={[styles.aboutText, !isRTL && styles.textLeft]}>
              {t('settings.appDescription')}
            </Text>
            <Text style={[styles.version, !isRTL && styles.textLeft]}>{t('settings.version')} 1.0.0</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, !isRTL && styles.textLeft]}>{t('settings.dangerZone')}</Text>
          <View style={styles.dangerZone}>
            <View style={[styles.dangerHeader, !isRTL && styles.dangerHeaderLTR]}>
              <AlertTriangle size={24} color={colors.error} strokeWidth={2} />
              <Text style={styles.dangerTitle}>{t('settings.deleteAccount')}</Text>
            </View>
            <Text style={[styles.dangerDescription, !isRTL && styles.textLeft]}>
              {t('settings.deleteAccountDesc')}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }
                Alert.alert(
                  t('settings.deleteAccountConfirm'),
                  t('settings.deleteAccountMessage'),
                  [
                    {
                      text: t('common.cancel'),
                      style: 'cancel',
                    },
                    {
                      text: t('common.delete'),
                      style: 'destructive',
                      onPress: async () => {
                        if (currentUser) {
                          await deleteAccount(currentUser.id);
                          setTimeout(() => {
                            router.replace('/');
                          }, 100);
                        }
                      },
                    },
                  ]
                );
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>{t('settings.deleteAccount')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <RequireAuthModal
        visible={showRequireAuthModal}
        onClose={() => setShowRequireAuthModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'right',
  },
  profileCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileCardLTR: {
    flexDirection: 'row',
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.background,
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  profileInfoLTR: {
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  profileDetail: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  profileDetailLTR: {
    flexDirection: 'row',
  },
  profilePhone: {
    fontSize: 16,
    color: colors.textMuted,
  },
  creditsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  creditsGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  creditsContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  creditsContentLTR: {
    flexDirection: 'row',
  },
  creditsIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.whiteOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditsInfo: {
    alignItems: 'flex-end',
  },
  creditsInfoLTR: {
    alignItems: 'flex-start',
  },
  creditsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  creditsValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.background,
  },
  addCreditsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.whiteOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textMuted,
    marginBottom: 12,
    textAlign: 'right',
  },
  menuCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLighter,
  },
  menuItemRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  aboutCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'right',
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: 12,
    textAlign: 'right',
  },
  version: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'right',
  },
  logoutButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.error,
    marginTop: 12,
    marginBottom: 24,
  },
  logoutButtonLTR: {
    flexDirection: 'row',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.error,
  },
  dangerZone: {
    backgroundColor: colors.errorBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.errorBorder,
  },
  dangerHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  dangerHeaderLTR: {
    flexDirection: 'row',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.error,
  },
  dangerDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'right',
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.background,
  },
  textLeft: {
    textAlign: 'left',
  },
});
