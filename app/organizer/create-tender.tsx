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
  Alert,
  Platform,
} from 'react-native';
import { Calendar, Clock, DollarSign, Users, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

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

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!pay || parseInt(pay) <= 0) {
      Alert.alert('Error', 'Please enter a valid pay amount');
      return;
    }

    if (!quota || parseInt(quota) <= 0) {
      Alert.alert('Error', 'Please enter a valid quota');
      return;
    }

    if (selectedContacts.length === 0 && selectedGroups.length === 0) {
      Alert.alert('Error', 'Please select at least one recipient');
      return;
    }

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

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert('Success', 'Tender created successfully', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
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

  return (
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
            <Text style={styles.label}>Recipients *</Text>
            <TouchableOpacity
              style={styles.recipientButton}
              onPress={() => setShowRecipientSelector(!showRecipientSelector)}
            >
              <Users size={20} color="#4F46E5" />
              <Text style={styles.recipientButtonText}>
                {selectedContacts.length + selectedGroups.length === 0
                  ? 'Select recipients'
                  : `${selectedContacts.length} contacts, ${selectedGroups.length} groups`}
              </Text>
            </TouchableOpacity>
          </View>

          {showRecipientSelector && (
            <View style={styles.recipientSelector}>
              <View style={styles.recipientSection}>
                <Text style={styles.recipientSectionTitle}>Groups</Text>
                {groups.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={styles.recipientItem}
                    onPress={() => toggleGroup(group.id)}
                  >
                    <View style={styles.recipientInfo}>
                      <Text style={styles.recipientName}>{group.name}</Text>
                      <Text style={styles.recipientDetail}>
                        {group.contactIds.length} members
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

              <View style={styles.recipientSection}>
                <Text style={styles.recipientSectionTitle}>Individual Contacts</Text>
                {contacts.map((contact) => (
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
            </View>
          )}

          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Create Tender</Text>
          </TouchableOpacity>
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
});
