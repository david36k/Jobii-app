import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { User, Users } from 'lucide-react-native';

export default function Index() {
  const { currentUser, switchUser, mockUsers, isInitialized } = useApp();

  useEffect(() => {
    console.log('[Index] isInitialized:', isInitialized, 'currentUser:', currentUser?.id);
    if (isInitialized && currentUser) {
      if (currentUser.role === 'organizer') {
        router.replace('/(organizer)/dashboard' as any);
      } else {
        router.replace('/participant/home' as any);
      }
    }
  }, [currentUser, isInitialized]);

  if (!isInitialized || currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>טוען...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const organizers = mockUsers.filter((u) => u.role === 'organizer');
  const participants = mockUsers.filter((u) => u.role === 'participant');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Mihrazone</Text>
          <Text style={styles.subtitle}>בחר תפקיד כדי להמשיך</Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>מארגנים</Text>
              <Users size={24} color="#4F46E5" />
            </View>
            {organizers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userCard}
                onPress={() => switchUser(user.id)}
              >
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userPhone}>{user.phone}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>מארגן</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>משתתפים</Text>
              <User size={24} color="#059669" />
            </View>
            {participants.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userCard}
                onPress={() => switchUser(user.id)}
              >
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userPhone}>{user.phone}</Text>
                </View>
                <View style={[styles.badge, styles.badgeParticipant]}>
                  <Text style={[styles.badgeText, styles.badgeTextParticipant]}>משתתף</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 40,
    marginBottom: 8,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'right',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#374151',
    textAlign: 'right',
  },
  userCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
    textAlign: 'right',
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#4F46E5',
  },
  badgeParticipant: {
    backgroundColor: '#D1FAE5',
  },
  badgeTextParticipant: {
    color: '#059669',
  },
});
