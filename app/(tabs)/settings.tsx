import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, LogOut, MessageCircle, Bell, ChevronLeft, Edit, Coins, Plus, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function Settings() {
  const { currentUser, switchUser, deleteAccount } = useApp();

  const handleLogout = () => {
    Alert.alert('התנתק', 'האם אתה בטוח שברצונך להתנתק?', [
      {
        text: 'ביטול',
        style: 'cancel',
      },
      {
        text: 'התנתק',
        style: 'destructive',
        onPress: async () => {
          await switchUser('');
          setTimeout(() => {
            router.replace('/');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }, 100);
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/profile/edit' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>הגדרות</Text>
          <Text style={styles.subtitle}>נהל את החשבון שלך</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>
              {currentUser?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser?.name}</Text>
            <View style={styles.profileDetail}>
              <Text style={styles.profilePhone}>{currentUser?.phone}</Text>
              <Phone size={16} color="#6B7280" />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.creditsCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/tokens' as any);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.creditsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.creditsContent}>
              <View style={styles.creditsIconContainer}>
                <Coins size={32} color="#FFFFFF" />
              </View>
              <View style={styles.creditsInfo}>
                <Text style={styles.creditsLabel}>הקרדיטים שלי</Text>
                <Text style={styles.creditsValue}>{currentUser?.credits || 0} קרדיטים</Text>
              </View>
            </View>
            <View style={styles.addCreditsButton}>
              <Plus size={24} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>כללי</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditProfile}
            >
              <View style={styles.menuItemRight}>
                <ChevronLeft size={20} color="#9CA3AF" />
                <Text style={styles.menuItemText}>ערוך פרופיל</Text>
              </View>
              <Edit size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/tokens' as any);
              }}
            >
              <View style={styles.menuItemRight}>
                <ChevronLeft size={20} color="#9CA3AF" />
                <Text style={styles.menuItemText}>טוקנים</Text>
              </View>
              <Coins size={20} color="#F59E0B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('התראות', 'הגדרות התראות בקרוב...');
              }}
            >
              <View style={styles.menuItemRight}>
                <ChevronLeft size={20} color="#9CA3AF" />
                <Text style={styles.menuItemText}>התראות</Text>
              </View>
              <Bell size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('צור קשר', 'ניתן ליצור קשר במייל:\nsupport@mihrazone.com');
              }}
            >
              <View style={styles.menuItemRight}>
                <ChevronLeft size={20} color="#9CA3AF" />
                <Text style={styles.menuItemText}>צור קשר</Text>
              </View>
              <MessageCircle size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={24} color="#DC2626" />
          <Text style={styles.logoutButtonText}>התנתק</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>אודות</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>Jobii</Text>
            <Text style={styles.aboutText}>
              מערכת ניהול מכרזים חכמה לגיוס עובדים מהיר ויעיל
            </Text>
            <Text style={styles.version}>גרסה 1.0.0</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>אזור מסוכן</Text>
          <View style={styles.dangerZone}>
            <View style={styles.dangerHeader}>
              <AlertTriangle size={24} color="#DC2626" strokeWidth={2} />
              <Text style={styles.dangerTitle}>מחיקת חשבון</Text>
            </View>
            <Text style={styles.dangerDescription}>
              פעולה זו תמחק את כל הנתונים שלך לצמיתות. לא ניתן לשחזר את החשבון לאחר המחיקה.
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }
                Alert.alert(
                  'האם אתה בטוח?',
                  'פעולה זו תמחק את החשבון שלך לצמיתות ולא ניתנת לביטול.',
                  [
                    {
                      text: 'ביטול',
                      style: 'cancel',
                    },
                    {
                      text: 'מחק',
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
              <Text style={styles.deleteButtonText}>מחיקת חשבון</Text>
            </TouchableOpacity>
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
    color: '#111827',
    marginBottom: 4,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'right',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  profileDetail: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  profilePhone: {
    fontSize: 16,
    color: '#6B7280',
  },
  creditsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#F59E0B',
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
  creditsIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditsInfo: {
    alignItems: 'flex-end',
  },
  creditsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  creditsValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  addCreditsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'right',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
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
    borderBottomColor: '#F3F4F6',
  },
  menuItemRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#4F46E5',
    marginBottom: 8,
    textAlign: 'right',
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'right',
  },
  version: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  logoutButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#DC2626',
    marginTop: 12,
    marginBottom: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#DC2626',
  },
  dangerZone: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#DC2626',
  },
  dangerDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'right',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
