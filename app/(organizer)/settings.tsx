import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, LogOut, MessageCircle, Bell, ChevronLeft, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function OrganizerSettings() {
  const { currentUser, switchUser, mockUsers } = useApp();

  const handleSwitchRole = () => {
    const participant = mockUsers.find((u) => u.role === 'participant');
    if (participant) {
      Alert.alert(
        'החלף תפקיד',
        'האם תרצה לעבור למצב משתתף לצורך בחינה?',
        [
          {
            text: 'ביטול',
            style: 'cancel',
          },
          {
            text: 'עבור למשתתף',
            onPress: async () => {
              await switchUser(participant.id);
              setTimeout(() => {
                router.replace('/participant/home' as any);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }, 100);
            },
          },
        ]
      );
    }
  };

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>הגדרות</Text>
          <Text style={styles.subtitle}>נהל את החשבון שלך</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <User size={32} color="#4F46E5" />
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
          style={styles.switchRoleCard}
          onPress={handleSwitchRole}
          activeOpacity={0.7}
        >
          <View style={styles.switchRoleContent}>
            <View style={styles.switchRoleIcon}>
              <RefreshCw size={24} color="#FFFFFF" />
            </View>
            <View style={styles.switchRoleText}>
              <Text style={styles.switchRoleTitle}>מצב בחינה</Text>
              <Text style={styles.switchRoleSubtitle}>עבור למשתתף כדי לבדוק את הצד השני</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>כללי</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('ערוך פרופיל', 'עריכת פרופיל בקרוב...');
              }}
            >
              <View style={styles.menuItemRight}>
                <ChevronLeft size={20} color="#9CA3AF" />
                <Text style={styles.menuItemText}>ערוך פרופיל</Text>
              </View>
              <User size={20} color="#6B7280" />
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>אזור מפתחים</Text>
          <TouchableOpacity
            style={styles.devCard}
            onPress={handleSwitchRole}
            activeOpacity={0.7}
          >
            <View style={styles.devCardContent}>
              <View style={styles.devCardIcon}>
                <RefreshCw size={24} color="#FFFFFF" />
              </View>
              <View style={styles.devCardText}>
                <Text style={styles.devCardTitle}>החלף למצב משתתף</Text>
                <Text style={styles.devCardSubtitle}>עבור למשתתף לצורך בחינה</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={24} color="#DC2626" />
          <Text style={styles.logoutButtonText}>התנתק</Text>
        </TouchableOpacity>

        <Text style={styles.version}>גרסה 1.0.0</Text>
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
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#DC2626',
  },
  version: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 24,
  },
  switchRoleCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  switchRoleContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  switchRoleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRoleText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  switchRoleTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  switchRoleSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  devCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  devCardContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  devCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  devCardText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  devCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  devCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
