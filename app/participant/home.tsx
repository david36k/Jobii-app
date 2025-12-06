import { useParticipantTenders, useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Calendar, Clock, DollarSign, Briefcase, History as HistoryIcon, RefreshCw } from 'lucide-react-native';
import { Tender } from '@/types';

export default function ParticipantHome() {
  const { active, history } = useParticipantTenders();
  const { currentUser, switchUser, mockUsers } = useApp();
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');

  const handleSwitchRole = () => {
    const organizer = mockUsers.find((u) => u.role === 'organizer');
    if (organizer) {
      Alert.alert(
        'החלף תפקיד',
        'האם תרצה לעבור למצב מארגן לצורך בחינה?',
        [
          {
            text: 'ביטול',
            style: 'cancel',
          },
          {
            text: 'עבור למארגן',
            onPress: async () => {
              await switchUser(organizer.id);
              setTimeout(() => {
                router.replace('/(organizer)/dashboard' as any);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }, 100);
            },
          },
        ]
      );
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getInviteForUser = (tender: Tender) => {
    return tender.invites.find((inv) => inv.userId === currentUser?.id);
  };

  const getStatusBadge = (tender: Tender) => {
    const invite = getInviteForUser(tender);
    if (!invite) return null;

    switch (invite.status) {
      case 'pending':
        return { text: 'Pending', color: '#F59E0B', bg: '#FEF3C7' };
      case 'accepted':
        return { text: 'Accepted', color: '#059669', bg: '#D1FAE5' };
      case 'rejected':
        return { text: 'Rejected', color: '#DC2626', bg: '#FEE2E2' };
      default:
        return { text: invite.status, color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const renderTender = (tender: Tender) => {
    const status = getStatusBadge(tender);
    const invite = getInviteForUser(tender);

    if (!status || !invite) return null;

    return (
      <TouchableOpacity
        key={tender.id}
        style={styles.tenderCard}
        onPress={() => router.push(`/participant/tender-details?id=${tender.id}` as any)}
      >
        <View style={styles.tenderHeader}>
          <Text style={styles.tenderTitle}>{tender.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>

        <View style={styles.organizerInfo}>
          <Text style={styles.organizerText}>By {tender.organizerName}</Text>
        </View>

        <View style={styles.tenderDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.detailText}>{formatDate(tender.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {tender.startTime} - {tender.endTime}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <DollarSign size={16} color="#6B7280" />
            <Text style={styles.detailText}>₪{tender.pay}</Text>
          </View>
        </View>

        {invite.status === 'pending' && (
          <View style={styles.pendingIndicator}>
            <Text style={styles.pendingText}>Tap to respond</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={handleSwitchRole}
              activeOpacity={0.7}
            >
              <RefreshCw size={20} color="#4F46E5" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Hello, {currentUser?.name || 'User'}</Text>
              <Text style={styles.subtitle}>Your job opportunities</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
            onPress={() => setSelectedTab('active')}
          >
            <Briefcase
              size={20}
              color={selectedTab === 'active' ? '#059669' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'active' && styles.tabTextActive,
              ]}
            >
              Active
            </Text>
            {active.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{active.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'history' && styles.tabActive]}
            onPress={() => setSelectedTab('history')}
          >
            <HistoryIcon
              size={20}
              color={selectedTab === 'history' ? '#059669' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'history' && styles.tabTextActive,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {selectedTab === 'active' ? (
            active.length === 0 ? (
              <View style={styles.emptyState}>
                <Briefcase size={48} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>No active tenders</Text>
                <Text style={styles.emptyStateSubtext}>
                  You&apos;ll see new job offers here
                </Text>
              </View>
            ) : (
              active.map(renderTender)
            )
          ) : history.length === 0 ? (
            <View style={styles.emptyState}>
              <HistoryIcon size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No history yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Past jobs will appear here
              </Text>
            </View>
          ) : (
            history.map(renderTender)
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
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  switchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#059669',
  },
  badge: {
    backgroundColor: '#059669',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  tenderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  tenderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tenderTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  organizerInfo: {
    marginBottom: 12,
  },
  organizerText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic' as const,
  },
  tenderDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  pendingIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#F59E0B',
  },
});
