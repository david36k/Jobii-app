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
} from 'react-native';
import { Calendar, Clock, DollarSign, Users, Check, X, Search } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

export default function CreateTender() {
  const { currentUser, createTender, contacts, groups } = useApp();

  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [pay, setPay] = useState<string>('');
  const [quota, setQuota] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showRecipientSelector, setShowRecipientSelector] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCreate = () => {
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
      });

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
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.field}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Wedding Event - Waiters Needed"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#6B7280" />
              <Text style={styles.inputButtonText}>
                {date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
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
              <Text style={styles.label}>Start Time *</Text>
              <View style={styles.inputButton}>
                <Clock size={20} color="#6B7280" />
                <TextInput
                  style={styles.timeInput}
                  placeholder="09:00"
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>End Time *</Text>
              <View style={styles.inputButton}>
                <Clock size={20} color="#6B7280" />
                <TextInput
                  style={styles.timeInput}
                  placeholder="17:00"
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Pay (₪) *</Text>
              <View style={styles.inputButton}>
                <DollarSign size={20} color="#6B7280" />
                <TextInput
                  style={styles.timeInput}
                  placeholder="500"
                  value={pay}
                  onChangeText={setPay}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Quota *</Text>
              <View style={styles.inputButton}>
                <Users size={20} color="#6B7280" />
                <TextInput
                  style={styles.timeInput}
                  placeholder="5"
                  value={quota}
                  onChangeText={setQuota}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add details about the job..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>נמענים *</Text>
            <TouchableOpacity
              style={styles.recipientButton}
              onPress={() => setShowRecipientSelector(true)}
            >
              <Users size={20} color="#4F46E5" />
              <Text style={styles.recipientButtonText}>
                {selectedContacts.length + selectedGroups.length === 0
                  ? 'בחר נמענים'
                  : `${selectedContacts.length} אנשי קשר, ${selectedGroups.length} קבוצות`}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.createButton, isCreating && styles.createButtonDisabled]} 
            onPress={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>צור מכרז</Text>
            )}
          </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>

      <Modal
        visible={showRecipientSelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRecipientSelector(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRecipientSelector(false)}
            >
              <X size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>בחר נמענים</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="חפש אנשי קשר או קבוצות..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <ScrollView style={styles.modalContent}>
            {filteredGroups.length > 0 && (
              <View style={styles.recipientSection}>
                <Text style={styles.recipientSectionTitle}>קבוצות</Text>
                {filteredGroups.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={styles.recipientItem}
                    onPress={() => toggleGroup(group.id)}
                  >
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
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {filteredContacts.length > 0 && (
              <View style={styles.recipientSection}>
                <Text style={styles.recipientSectionTitle}>אנשי קשר</Text>
                {filteredContacts.map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.recipientItem}
                    onPress={() => toggleContact(contact.id)}
                  >
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
                  </TouchableOpacity>
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

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowRecipientSelector(false)}
            >
              <Text style={styles.doneButtonText}>סיים ({selectedContacts.length + selectedGroups.length})</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
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
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  inputButtonText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  timeInput: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  recipientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  recipientButtonText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600' as const,
    flex: 1,
  },
  recipientSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recipientSection: {
    marginBottom: 16,
  },
  recipientSectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 12,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
    marginBottom: 2,
  },
  recipientDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  createButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
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
  createButtonDisabled: {
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row-reverse' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row-reverse' as const,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
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
    borderTopColor: '#E5E7EB',
  },
  doneButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
