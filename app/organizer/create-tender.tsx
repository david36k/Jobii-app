import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { Calendar, Clock, DollarSign, Users, Check, X, Search, ChevronDown, AlertCircle } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';

export default function CreateTender() {
  const { currentUser, createTender, contacts, groups, deductCredit } = useApp();

  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [pay, setPay] = useState<string>('');
  const [quota, setQuota] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showRecipientSelector, setShowRecipientSelector] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const hasNoCredits = currentUser && currentUser.credits < 2;

  const handleCreate = () => {
    if (hasNoCredits) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error('אין מספיק קרדיטים');
      return;
    }

    if (!title.trim()) {
      toast.error('נא להזין כותרת');
      return;
    }

    if (!pay || parseInt(pay) <= 0) {
      toast.error('נא להזין סכום תשלום תקין');
      return;
    }

    if (!quota || parseInt(quota) <= 0) {
      toast.error('נא להזין מכסה תקינה');
      return;
    }

    if (selectedContacts.length === 0 && selectedGroups.length === 0) {
      toast.error('נא לבחור לפחות נמען אחד');
      return;
    }

    setIsCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const contactsFromGroups = groups
      .filter((g) => selectedGroups.includes(g.id))
      .flatMap((g) => g.contactIds);

    const allContactIds = Array.from(new Set([...selectedContacts, ...contactsFromGroups]));

    const invites = allContactIds
      .map((contactId) => {
        const contact = contacts.find((c) => c.id === contactId);
        if (!contact) {
          console.warn(`Contact not found: ${contactId}`);
          return null;
        }

        if (!contact.linkedUserId) {
          console.log(`Contact ${contact.name} (${contact.phone}) will receive SMS invitation (guest invite)`);
          return {
            userName: contact.name,
            userPhone: contact.phone,
            status: 'pending' as const,
            updatedAt: new Date(),
            isGuest: true,
          };
        }

        return {
          userId: contact.linkedUserId,
          userName: contact.name,
          userPhone: contact.phone,
          status: 'pending' as const,
          updatedAt: new Date(),
          isGuest: false,
        };
      })
      .filter((invite): invite is NonNullable<typeof invite> => invite !== null);

    setTimeout(() => {
      createTender({
        organizerId: currentUser!.id,
        organizerName: currentUser!.name,
        title: title.trim(),
        date,
        startTime,
        endTime,
        pay: parseInt(pay),
        quota: parseInt(quota),
        invites,
        description: description.trim() || undefined,
        location: location.trim() || undefined,
      });

      if (currentUser) {
        deductCredit(currentUser.id);
        deductCredit(currentUser.id);
      }

      setIsCreating(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('המכרז נוצר בהצלחה!');
      
      setTimeout(() => {
        router.back();
      }, 500);
    }, 300);
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <>
      <View style={styles.container}>
        <LinearGradient
          colors={['#EEF2FF', '#F8FAFC', '#FFFFFF']}
          locations={[0, 0.3, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          {hasNoCredits && (
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400 }}
            >
              <BlurView intensity={80} tint="light" style={styles.noCreditsWarning}>
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.warningGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <AlertCircle size={24} color="#FFFFFF" />
                  <View style={styles.warningContent}>
                    <Text style={styles.warningTitle}>אין קרדיטים</Text>
                    <Text style={styles.warningSubtitle}>לחץ על הקרדיטים למעלה להוסיף</Text>
                  </View>
                </LinearGradient>
              </BlurView>
            </MotiView>
          )}

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={styles.label}>כותרת *</Text>
            <BlurView intensity={60} tint="light" style={styles.inputBlur}>
              <TextInput
                style={styles.input}
                placeholder="לדוגמה: אירוע חתונה - מלצרים דרושים"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#9CA3AF"
                onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              />
            </BlurView>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>תאריך *</Text>
            <Pressable
              style={({ pressed }) => [
                styles.inputButton,
                pressed && styles.inputButtonPressed,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowDatePicker(true);
              }}
            >
              <BlurView intensity={60} tint="light" style={styles.inputButtonBlur}>
                <Calendar size={20} color="#4F46E5" />
                <Text style={styles.inputButtonText}>
                  {date.toLocaleDateString('he-IL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <ChevronDown size={20} color="#9CA3AF" />
              </BlurView>
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: any, selectedDate?: Date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.row}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>שעת התחלה *</Text>
              <BlurView intensity={60} tint="light" style={styles.inputButton}>
                <Clock size={20} color="#4F46E5" />
                <TextInput
                  style={styles.timeInput}
                  placeholder="09:00"
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                />
              </BlurView>
            </View>

            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>שעת סיום *</Text>
              <BlurView intensity={60} tint="light" style={styles.inputButton}>
                <Clock size={20} color="#4F46E5" />
                <TextInput
                  style={styles.timeInput}
                  placeholder="17:00"
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                />
              </BlurView>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>תשלום (₪) *</Text>
              <BlurView intensity={60} tint="light" style={styles.inputButton}>
                <DollarSign size={20} color="#059669" />
                <TextInput
                  style={styles.timeInput}
                  placeholder="500"
                  value={pay}
                  onChangeText={setPay}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                />
              </BlurView>
            </View>

            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>מכסה *</Text>
              <BlurView intensity={60} tint="light" style={styles.inputButton}>
                <Users size={20} color="#4F46E5" />
                <TextInput
                  style={styles.timeInput}
                  placeholder="5"
                  value={quota}
                  onChangeText={setQuota}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                />
              </BlurView>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>תיאור (אופציונלי)</Text>
            <BlurView intensity={60} tint="light" style={styles.inputBlur}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="הוסף פרטים על העבודה..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
                onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              />
            </BlurView>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>מיקום (אופציונלי)</Text>
            <BlurView intensity={60} tint="light" style={styles.inputBlur}>
              <TextInput
                style={styles.input}
                placeholder="למשל: אולם אירועים גני התערוכה, תל אביב"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#9CA3AF"
                onFocus={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              />
            </BlurView>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>נמענים *</Text>
            <Pressable
              style={({ pressed }) => [
                styles.recipientButton,
                pressed && styles.recipientButtonPressed,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowRecipientSelector(true);
              }}
            >
              <BlurView intensity={80} tint="light" style={styles.recipientButtonBlur}>
                <Users size={20} color="#4F46E5" />
                <Text style={styles.recipientButtonText}>
                  {selectedContacts.length + selectedGroups.length === 0
                    ? 'בחר נמענים'
                    : `${selectedContacts.length} אנשי קשר, ${selectedGroups.length} קבוצות`}
                </Text>
              </BlurView>
            </Pressable>
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.createButton,
              (isCreating || hasNoCredits) && styles.createButtonDisabled,
              pressed && !isCreating && !hasNoCredits && styles.createButtonPressed,
            ]}
            onPress={handleCreate}
            disabled={isCreating || hasNoCredits}
          >
            <LinearGradient
              colors={hasNoCredits ? ['#9CA3AF', '#6B7280'] : ['#6366F1', '#4F46E5']}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>
                  {hasNoCredits ? 'אין קרדיטים' : 'צור מכרז'}
                </Text>
              )}
            </LinearGradient>
          </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>

      <Modal
        visible={showRecipientSelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRecipientSelector(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#EEF2FF', '#F8FAFC', '#FFFFFF']}
            locations={[0, 0.3, 1]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView style={styles.modalSafeArea}>
            <BlurView intensity={90} tint="light" style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowRecipientSelector(false);
                }}
              >
                <X size={24} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>בחר נמענים</Text>
              <View style={{ width: 40 }} />
            </BlurView>

            <View style={styles.searchContainer}>
              <BlurView intensity={60} tint="light" style={styles.searchBlur}>
                <Search size={20} color="#6B7280" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="חפש אנשי קשר או קבוצות..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#9CA3AF"
                />
              </BlurView>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {filteredGroups.length > 0 && (
                <View style={styles.recipientSection}>
                  <Text style={styles.recipientSectionTitle}>קבוצות</Text>
                  {filteredGroups.map((group, index) => (
                    <MotiView
                      key={group.id}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ type: 'timing', duration: 300, delay: index * 50 }}
                    >
                      <Pressable
                        style={({ pressed }) => [
                          styles.recipientItem,
                          pressed && styles.recipientItemPressed,
                        ]}
                        onPress={() => toggleGroup(group.id)}
                      >
                        <BlurView intensity={60} tint="light" style={styles.recipientItemBlur}>
                          <View style={styles.recipientInfo}>
                            <Text style={styles.recipientName}>{group.name}</Text>
                            <Text style={styles.recipientDetail}>
                              {group.contactIds.length} חברים
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.checkbox,
                              selectedGroups.includes(group.id) && styles.checkboxSelected,
                            ]}
                          >
                            {selectedGroups.includes(group.id) && (
                              <Check size={16} color="#FFFFFF" />
                            )}
                          </View>
                        </BlurView>
                      </Pressable>
                    </MotiView>
                  ))}
                </View>
              )}

              {filteredContacts.length > 0 && (
                <View style={styles.recipientSection}>
                  <Text style={styles.recipientSectionTitle}>אנשי קשר</Text>
                  {filteredContacts.map((contact, index) => (
                    <MotiView
                      key={contact.id}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ type: 'timing', duration: 300, delay: index * 50 }}
                    >
                      <Pressable
                        style={({ pressed }) => [
                          styles.recipientItem,
                          pressed && styles.recipientItemPressed,
                        ]}
                        onPress={() => toggleContact(contact.id)}
                      >
                        <BlurView intensity={60} tint="light" style={styles.recipientItemBlur}>
                          <View style={styles.recipientInfo}>
                            <Text style={styles.recipientName}>{contact.name}</Text>
                            <Text style={styles.recipientDetail}>{contact.phone}</Text>
                          </View>
                          <View
                            style={[
                              styles.checkbox,
                              selectedContacts.includes(contact.id) && styles.checkboxSelected,
                            ]}
                          >
                            {selectedContacts.includes(contact.id) && (
                              <Check size={16} color="#FFFFFF" />
                            )}
                          </View>
                        </BlurView>
                      </Pressable>
                    </MotiView>
                  ))}
                </View>
              )}

              {filteredGroups.length === 0 && filteredContacts.length === 0 && (
                <View style={styles.emptySearch}>
                  <Users size={48} color="#D1D5DB" />
                  <Text style={styles.emptySearchText}>לא נמצאו תוצאות</Text>
                </View>
              )}
            </ScrollView>

            <BlurView intensity={90} tint="light" style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowRecipientSelector(false);
                }}
              >
                <LinearGradient
                  colors={['#6366F1', '#4F46E5']}
                  style={styles.doneButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.doneButtonText}>סיים ({selectedContacts.length + selectedGroups.length})</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  noCreditsWarning: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  warningGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  warningContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  warningSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 10,
    textAlign: 'right',
  },
  inputBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#111827',
    textAlign: 'right',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  inputButtonBlur: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    width: '100%',
  },
  inputButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  inputButtonText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  timeInput: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
    padding: 0,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  recipientButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(79, 70, 229, 0.3)',
  },
  recipientButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  recipientButtonBlur: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  recipientButtonText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600' as const,
    flex: 1,
    textAlign: 'right',
  },
  createButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  createButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  createButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  createButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row-reverse' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  searchContainer: {
    padding: 16,
  },
  searchBlur: {
    flexDirection: 'row-reverse' as const,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    textAlign: 'right' as const,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recipientSection: {
    marginBottom: 24,
  },
  recipientSectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'right',
  },
  recipientItem: {
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  recipientItemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  recipientItemBlur: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  recipientInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  recipientDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptySearchText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginTop: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  doneButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  doneButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
