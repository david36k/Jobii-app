import { useOrganizerTenders, useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { Plus, Calendar, Clock, Users, DollarSign, ChevronLeft, Filter, X } from 'lucide-react-native';
import { Tender, TenderStatus } from '@/types';
import { useState, useRef } from 'react';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function OrganizerDashboard() {
  const tenders = useOrganizerTenders();
  const { currentUser } = useApp();
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<TenderStatus | 'all'>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const toggleFilter = () => {
    const toValue = isFilterOpen ? SCREEN_WIDTH : 0;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setIsFilterOpen(!isFilterOpen);
  };

  const applyFilters = (tenderList: Tender[]) => {
    let filtered = tenderList;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === selectedStatus);
    }

    if (selectedDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((t) => {
        const tenderDate = new Date(t.date);
        const tenderDay = new Date(tenderDate.getFullYear(), tenderDate.getMonth(), tenderDate.getDate());

        if (selectedDateRange === 'today') {
          return tenderDay.getTime() === today.getTime();
        } else if (selectedDateRange === 'week') {
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          return tenderDay >= today && tenderDay <= weekFromNow;
        } else if (selectedDateRange === 'month') {
          const monthFromNow = new Date(today);
          monthFromNow.setMonth(today.getMonth() + 1);
          return tenderDay >= today && tenderDay <= monthFromNow;
        }
        return true;
      });
    }

    return filtered;
  };

  const activeTenders = applyFilters(tenders.filter((t) => t.status !== 'closed'));

  const getAcceptedCount = (tender: Tender) => {
    return tender.invites.filter((inv) => inv.status === 'accepted').length;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('he-IL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#3B82F6';
      case 'full':
        return '#059669';
      case 'closed':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'פתוח';
      case 'full':
        return 'מלא';
      case 'closed':
        return 'סגור';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={toggleFilter}
            >
              <Filter size={24} color="#4F46E5" />
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>שלום, {currentUser?.name || 'מארגן'}</Text>
              <Text style={styles.subtitle}>נהל את המכרזים שלך</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/organizer/create-tender' as any)}
        >
          <Plus size={24} color="#FFFFFF" />
          <Text style={styles.createButtonText}>צור מכרז חדש</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>מכרזים פעילים ({activeTenders.length})</Text>

          {activeTenders.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>אין מכרזים פעילים</Text>
              <Text style={styles.emptyStateSubtext}>צור את המכרז הראשון שלך כדי להתחיל</Text>
            </View>
          ) : (
            activeTenders.map((tender) => {
              const acceptedCount = getAcceptedCount(tender);
              const progress = tender.quota > 0 ? (acceptedCount / tender.quota) * 100 : 0;

              return (
                <TouchableOpacity
                  key={tender.id}
                  style={styles.tenderCard}
                  onPress={() => router.push(`/organizer/tender-details?id=${tender.id}` as any)}
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
                      <Calendar size={16} color="#6B7280" />
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailText}>
                        {tender.startTime} - {tender.endTime}
                      </Text>
                      <Clock size={16} color="#6B7280" />
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailText}>₪{tender.pay}</Text>
                      <DollarSign size={16} color="#6B7280" />
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressCount}>
                        {acceptedCount} / {tender.quota}
                      </Text>
                      <Text style={styles.progressLabel}>עובדים</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor:
                              progress >= 100 ? '#059669' : progress >= 70 ? '#F59E0B' : '#3B82F6',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.tenderFooter}>
                    <ChevronLeft size={20} color="#9CA3AF" />
                    <Text style={styles.invitesText}>
                      {tender.invites.length} הזמנות נשלחו
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <Animated.View
        style={[
          styles.filterPanel,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.filterHeader}>
          <TouchableOpacity onPress={toggleFilter} style={styles.closeButton}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.filterTitle}>סינון מכרזים</Text>
        </View>

        <ScrollView style={styles.filterContent}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>סטטוס</Text>
            <View style={styles.filterOptions}>
              {(['all', 'open', 'full', 'closed'] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    selectedStatus === status && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedStatus === status && styles.filterOptionTextActive,
                    ]}
                  >
                    {status === 'all' ? 'הכל' : getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>תאריך</Text>
            <View style={styles.filterOptions}>
              {[
                { value: 'all', label: 'הכל' },
                { value: 'today', label: 'היום' },
                { value: 'week', label: 'השבוע' },
                { value: 'month', label: 'החודש' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    selectedDateRange === option.value && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedDateRange(option.value as any)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedDateRange === option.value && styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setSelectedStatus('all');
              setSelectedDateRange('all');
            }}
          >
            <Text style={styles.resetButtonText}>איפוס סינון</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {isFilterOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleFilter}
        />
      )}
    </View>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
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
    textAlign: 'center',
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
    marginBottom: 12,
  },
  tenderTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    flex: 1,
    marginLeft: 8,
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
  tenderDetails: {
    gap: 8,
    marginBottom: 16,
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
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#374151',
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tenderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  invitesText: {
    fontSize: 14,
    color: '#6B7280',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: SCREEN_WIDTH * 0.85,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 12,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#F9FAFB',
  },
  filterOptionActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  filterOptionText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  filterOptionTextActive: {
    color: '#4F46E5',
    fontWeight: '600' as const,
  },
  resetButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
});
