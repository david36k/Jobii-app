import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { 
  Users,
  Globe,
  Lock,
  Crown,
  TrendingUp,
  UserPlus,
  Search,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

type Tab = 'my-groups' | 'discover';

export default function GroupsScreen() {
  const { groups } = useApp();
  const [selectedTab, setSelectedTab] = useState<Tab>('my-groups');

  const handleTabChange = (tab: Tab) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTab(tab);
  };

  const myGroups = useMemo(() => {
    return groups || [];
  }, [groups]);

  const discoverGroups = [
    {
      id: '1',
      name: 'קבוצת בניין משותפת',
      members: 45,
      category: 'בניין',
      isPublic: true,
      trending: true,
    },
    {
      id: '2',
      name: 'שיפוצים ובניה',
      members: 234,
      category: 'שיפוצים',
      isPublic: true,
      trending: true,
    },
    {
      id: '3',
      name: 'אספקה ולוגיסטיקה',
      members: 167,
      category: 'לוגיסטיקה',
      isPublic: true,
      trending: false,
    },
    {
      id: '4',
      name: 'טכנולוגיה וחדשנות',
      members: 89,
      category: 'טכנולוגיה',
      isPublic: false,
      trending: false,
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EEF2FF', '#FFFFFF', '#F9FAFB']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.content} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>קבוצות</Text>
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabWrapper}>
            <MotiView
              animate={{
                translateX: selectedTab === 'my-groups' ? 0 : '100%',
              }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
              }}
              style={styles.tabIndicator}
            />
            
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabChange('my-groups')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'my-groups' && styles.tabTextActive,
                ]}
              >
                קבוצות שלי
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabChange('discover')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'discover' && styles.tabTextActive,
                ]}
              >
                גלה קבוצות
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {selectedTab === 'my-groups' ? (
            <View>
              {myGroups.length === 0 ? (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 400 }}
                  style={styles.emptyState}
                >
                  <View style={styles.emptyIcon}>
                    <Users size={48} color="#9CA3AF" strokeWidth={1.5} />
                  </View>
                  <Text style={styles.emptyTitle}>עדיין אין לך קבוצות</Text>
                  <Text style={styles.emptyDescription}>
                    הצטרף לקבוצות קיימות או צור קבוצה חדשה
                  </Text>
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#4F46E5', '#6366F1']}
                      style={styles.createButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <UserPlus size={20} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.createButtonText}>צור קבוצה חדשה</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </MotiView>
              ) : (
                myGroups.map((group, index) => (
                  <MotiView
                    key={group.id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: index * 100 }}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.groupCard,
                        pressed && styles.groupCardPressed,
                      ]}
                      onPress={() => {
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <View style={styles.groupHeader}>
                        <View style={styles.groupIconContainer}>
                          <LinearGradient
                            colors={['#4F46E5', '#6366F1']}
                            style={styles.groupIcon}
                          >
                            <Users size={24} color="#FFFFFF" strokeWidth={2} />
                          </LinearGradient>
                        </View>
                        <View style={styles.groupInfo}>
                          <Text style={styles.groupName}>{group.name}</Text>
                          <Text style={styles.groupMembers}>
                            {group.members?.length || 0} חברים
                          </Text>
                        </View>
                        <Crown size={20} color="#F59E0B" strokeWidth={2} />
                      </View>
                    </Pressable>
                  </MotiView>
                ))
              )}
            </View>
          ) : (
            <View>
              {discoverGroups.map((group, index) => (
                <MotiView
                  key={group.id}
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 400, delay: index * 100 }}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.groupCard,
                      pressed && styles.groupCardPressed,
                    ]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                  >
                    <View style={styles.groupHeader}>
                      <View style={styles.groupIconContainer}>
                        <LinearGradient
                          colors={group.trending ? ['#F59E0B', '#FBBF24'] : ['#6B7280', '#9CA3AF']}
                          style={styles.groupIcon}
                        >
                          {group.isPublic ? (
                            <Globe size={24} color="#FFFFFF" strokeWidth={2} />
                          ) : (
                            <Lock size={24} color="#FFFFFF" strokeWidth={2} />
                          )}
                        </LinearGradient>
                      </View>
                      <View style={styles.groupInfo}>
                        <View style={styles.groupNameRow}>
                          <Text style={styles.groupName}>{group.name}</Text>
                          {group.trending && (
                            <View style={styles.trendingBadge}>
                              <TrendingUp size={12} color="#F59E0B" strokeWidth={2.5} />
                            </View>
                          )}
                        </View>
                        <Text style={styles.groupMembers}>
                          {group.members} חברים • {group.category}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.joinButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.joinButtonText}>הצטרף</Text>
                    </TouchableOpacity>
                  </Pressable>
                </MotiView>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'right',
  },
  tabContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: '50%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  groupCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupIconContainer: {
    marginLeft: 16,
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'right',
  },
  groupMembers: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  trendingBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 4,
  },
  joinButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4F46E5',
  },
});
