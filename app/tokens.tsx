import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowRight, Coins, Sparkles, Play, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';

interface TokenPackage {
  id: string;
  name: string;
  price: string;
  tokens: number;
  costPerJob: string;
  badge?: string;
  badgeColor?: string;
  gradient: [string, string];
}

const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'starter',
    name: 'חבילת התחלה',
    price: '₪9.99',
    tokens: 10,
    costPerJob: '~₪2.00',
    gradient: ['#8B5CF6', '#6D28D9'] as [string, string],
  },
  {
    id: 'popular',
    name: 'חבילה פופולרית',
    price: '₪24.99',
    tokens: 30,
    costPerJob: '~₪1.66',
    badge: 'הכי משתלם',
    badgeColor: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'] as [string, string],
  },
  {
    id: 'business',
    name: 'חבילת עסקים',
    price: '₪69.90',
    tokens: 100,
    costPerJob: '~₪1.40',
    badge: 'עסקים',
    badgeColor: '#4338CA',
    gradient: ['#4F46E5', '#4338CA'] as [string, string],
  },
];

export default function TokensScreen() {
  const { currentUser, addCredits } = useApp();
  const [watchedAdsToday, setWatchedAdsToday] = useState<number>(0);
  const maxAdsPerDay = 3;

  const handlePurchase = (pkg: TokenPackage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'רכישת טוקנים',
      `זוהי גרסת הדגמה. במצב רגיל כאן תתבצע רכישה אמיתית של ${pkg.tokens} טוקנים ב-${pkg.price}`,
      [
        {
          text: 'הבנתי',
          style: 'cancel',
        },
      ]
    );
  };

  const handleWatchAd = () => {
    if (watchedAdsToday >= maxAdsPerDay) {
      Alert.alert('הגעת למגבלה', 'ניתן לצפות עד 3 פרסומות ביום');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('צפייה בפרסומת', 'זוהי גרסת הדגמה. במצב רגיל כאן תוצג פרסומת ותקבל טוקן אחד');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backButton}
        >
          <ArrowRight size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>טוקנים</Text>
          <Coins size={24} color="#F59E0B" />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceIconContainer}>
            <Coins size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.balanceLabel}>היתרה שלך</Text>
          <Text style={styles.balanceValue}>{currentUser?.credits || 0}</Text>
          <Text style={styles.balanceSubtext}>טוקנים זמינים</Text>
        </LinearGradient>

        <View style={styles.adSection}>
          <View style={styles.adCard}>
            <View style={styles.adHeader}>
              <View style={styles.adIconContainer}>
                <Play size={24} color="#FFFFFF" />
              </View>
              <View style={styles.adInfo}>
                <Text style={styles.adTitle}>צפה בפרסומת וקבל טוקן</Text>
                <Text style={styles.adSubtext}>
                  {watchedAdsToday}/{maxAdsPerDay} צפיות היום
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.watchAdButton,
                watchedAdsToday >= maxAdsPerDay && styles.watchAdButtonDisabled
              ]}
              onPress={handleWatchAd}
              disabled={watchedAdsToday >= maxAdsPerDay}
            >
              <Text style={styles.watchAdButtonText}>
                {watchedAdsToday >= maxAdsPerDay ? 'הגעת למגבלה היומית' : 'צפה בפרסומת'}
              </Text>
              {watchedAdsToday < maxAdsPerDay && <Play size={18} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>חבילות טוקנים</Text>
          <Text style={styles.sectionSubtitle}>בחר את החבילה המתאימה לך</Text>
        </View>

        {TOKEN_PACKAGES.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={[
              styles.packageCard,
              pkg.badge && styles.packageCardHighlighted
            ]}
            onPress={() => handlePurchase(pkg)}
            activeOpacity={0.8}
          >
            {pkg.badge && (
              <View style={[styles.badge, { backgroundColor: pkg.badgeColor }]}>
                <Sparkles size={14} color="#FFFFFF" />
                <Text style={styles.badgeText}>{pkg.badge}</Text>
              </View>
            )}
            <LinearGradient
              colors={pkg.gradient}
              style={styles.packageGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.packageHeader}>
                <View style={styles.packageTitleContainer}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packagePrice}>{pkg.price}</Text>
                </View>
                <View style={styles.packageIconContainer}>
                  <Coins size={32} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.packageDetails}>
                <View style={styles.packageDetailItem}>
                  <Text style={styles.packageDetailValue}>{pkg.tokens}</Text>
                  <Text style={styles.packageDetailLabel}>טוקנים</Text>
                </View>
                <View style={styles.packageDivider} />
                <View style={styles.packageDetailItem}>
                  <Text style={styles.packageDetailValue}>{pkg.costPerJob}</Text>
                  <Text style={styles.packageDetailLabel}>למשרה</Text>
                </View>
              </View>

              <View style={styles.purchaseButton}>
                <Text style={styles.purchaseButtonText}>רכוש עכשיו</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>איך זה עובד?</Text>
            <Info size={20} color="#4F46E5" />
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoBullet}>
              <Text style={styles.infoBulletText}>💼</Text>
            </View>
            <Text style={styles.infoText}>כל מכרז עולה 2 טוקנים</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoBullet}>
              <Text style={styles.infoBulletText}>🎁</Text>
            </View>
            <Text style={styles.infoText}>משתמשים חדשים מקבלים 6 טוקנים במתנה</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoBullet}>
              <Text style={styles.infoBulletText}>📺</Text>
            </View>
            <Text style={styles.infoText}>צפה בפרסומת וקבל טוקן (עד 3 ביום)</Text>
          </View>
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
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 56,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  adSection: {
    marginBottom: 24,
  },
  adCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  adHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  adIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
  },
  adSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  watchAdButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  watchAdButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  watchAdButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
    textAlign: 'right',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  packageCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  packageCardHighlighted: {
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  packageGradient: {
    padding: 20,
  },
  packageHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  packageTitleContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  packageName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  packageIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageDetails: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  packageDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  packageDetailValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  packageDetailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  packageDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },
  purchaseButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  infoItem: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBulletText: {
    fontSize: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'right',
  },
});
