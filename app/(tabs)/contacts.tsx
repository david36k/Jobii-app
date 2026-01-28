import { useApp } from '@/contexts/AppContext';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import * as Contacts from 'expo-contacts';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { toast } from 'sonner-native';
import { 
  Search,
  Users,
  User,
  Phone,
  Mail,
  UserPlus,
  X,
  Check,
  Download,
  Tag as TagIcon,
  FileText,
} from 'lucide-react-native';

type NewContact = {
  name: string;
  phone: string;
  email?: string;
  tag?: string;
  notes?: string;
};

type DeviceContact = {
  id: string;
  name: string;
  phoneNumbers?: { number?: string }[];
};

export default function ContactsScreen() {
  const { contacts, groups, addContact, addMultipleContacts } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<'contacts' | 'groups'>('contacts');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState<NewContact>({ 
    name: '', 
    phone: '', 
    email: '',
    tag: '',
    notes: '',
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        (c.tag && c.tag.toLowerCase().includes(query))
    );
  }, [contacts, searchQuery]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(query));
  }, [groups, searchQuery]);

  const handleImportFromDevice = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'נדרשת הרשאה',
          'על מנת לייבא אנשי קשר מהמכשיר, יש לאשר גישה לאנשי הקשר.',
          [{ text: 'אישור', style: 'cancel' }]
        );
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        const validContacts = data.filter(
          (contact) => contact.name && contact.phoneNumbers && contact.phoneNumbers.length > 0
        );
        setDeviceContacts(validContacts);
        setShowImportModal(true);
        setShowAddModal(false);
      } else {
        Alert.alert('אין אנשי קשר', 'לא נמצאו אנשי קשר במכשיר שלך');
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בטעינת אנשי הקשר מהמכשיר');
    }
  };

  const handleImportSelected = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      const selectedContacts = deviceContacts.filter((c) => selectedContactIds.has(c.id));
      const contactsToAdd: Omit<import('@/types').Contact, 'id'>[] = selectedContacts.map((c) => ({
        name: c.name,
        phone: c.phoneNumbers?.[0]?.number || '',
        groups: [],
      }));

      await addMultipleContacts(contactsToAdd);
      
      toast.success(`${selectedContacts.length} אנשי קשר יובאו בהצלחה`, {
        duration: 3000,
      });

      setShowImportModal(false);
      setSelectedContactIds(new Set());
      setDeviceContacts([]);
    } catch (error) {
      console.error('Failed to import contacts:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בייבוא אנשי הקשר');
    }
  };

  const handleAddContact = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (!newContact.name.trim() || !newContact.phone.trim()) {
      Alert.alert('שגיאה', 'נא למלא לפחות שם וטלפון');
      return;
    }

    try {
      await addContact({
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email || undefined,
        tag: newContact.tag || undefined,
        notes: newContact.notes || undefined,
        groups: [],
      });
      
      toast.success('איש קשר נוסף בהצלחה', {
        duration: 2000,
      });

      setShowAddModal(false);
      setNewContact({ name: '', phone: '', email: '', tag: '', notes: '' });
    } catch (error) {
      console.error('Failed to add contact:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בשמירת איש הקשר');
    }
  };

  const toggleContactSelection = (contactId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newSelected = new Set(selectedContactIds);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContactIds(newSelected);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EEF2FF', '#F8FAFC', '#FFFFFF']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BlurView intensity={90} tint="light" style={styles.header}>
          <Text style={styles.headerTitle}>אנשי קשר</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowAddModal(true);
            }}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.addButtonGradient}
            >
              <UserPlus size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>

        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <BlurView intensity={80} tint="light" style={styles.searchBlur}>
              <Search size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="חיפוש..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </BlurView>
          </View>

          <View style={styles.viewToggleContainer}>
            <BlurView intensity={80} tint="light" style={styles.viewToggle}>
              <Pressable
                style={[
                  styles.viewButton,
                  selectedView === 'contacts' && styles.viewButtonActive,
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedView('contacts');
                }}
              >
                {selectedView === 'contacts' && (
                  <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    style={styles.viewButtonGradient}
                  />
                )}
                <User
                  size={18}
                  color={selectedView === 'contacts' ? '#FFFFFF' : '#6B7280'}
                  style={{ zIndex: 1 }}
                />
                <Text
                  style={[
                    styles.viewButtonText,
                    selectedView === 'contacts' && styles.viewButtonTextActive,
                  ]}
                >
                  אנשי קשר ({contacts.length})
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.viewButton,
                  selectedView === 'groups' && styles.viewButtonActive,
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedView('groups');
                }}
              >
                {selectedView === 'groups' && (
                  <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    style={styles.viewButtonGradient}
                  />
                )}
                <Users
                  size={18}
                  color={selectedView === 'groups' ? '#FFFFFF' : '#6B7280'}
                  style={{ zIndex: 1 }}
                />
                <Text
                  style={[
                    styles.viewButtonText,
                    selectedView === 'groups' && styles.viewButtonTextActive,
                  ]}
                >
                  קבוצות ({groups.length})
                </Text>
              </Pressable>
            </BlurView>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false}
          >
            {selectedView === 'contacts' ? (
              filteredContacts.length === 0 ? (
                <View style={styles.emptyState}>
                  <User size={48} color="#D1D5DB" />
                  <Text style={styles.emptyStateText}>
                    {searchQuery ? 'לא נמצאו אנשי קשר' : 'אין אנשי קשר'}
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    {searchQuery ? 'נסה חיפוש אחר' : 'הוסף אנשי קשר כדי להתחיל'}
                  </Text>
                </View>
              ) : (
                filteredContacts.map((contact, index) => (
                  <MotiView
                    key={contact.id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: index * 50 }}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.contactCard,
                        pressed && styles.contactCardPressed,
                      ]}
                      onPress={() => {
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <View style={styles.contactAvatar}>
                        <LinearGradient
                          colors={['#6366F1', '#4F46E5']}
                          style={styles.avatarGradient}
                        >
                          <Text style={styles.avatarText}>
                            {contact.name.charAt(0)}
                          </Text>
                        </LinearGradient>
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        {contact.tag && (
                          <View style={styles.tagBadge}>
                            <TagIcon size={12} color="#6366F1" />
                            <Text style={styles.tagText}>{contact.tag}</Text>
                          </View>
                        )}
                        <View style={styles.contactDetailsRow}>
                          <Text style={styles.contactDetail}>{contact.phone}</Text>
                          <Phone size={14} color="#9CA3AF" />
                        </View>
                        {contact.email && (
                          <View style={styles.contactDetailsRow}>
                            <Text style={styles.contactDetail}>{contact.email}</Text>
                            <Mail size={14} color="#9CA3AF" />
                          </View>
                        )}
                        {contact.notes && (
                          <View style={styles.contactDetailsRow}>
                            <Text style={styles.contactNotes} numberOfLines={2}>
                              {contact.notes}
                            </Text>
                            <FileText size={14} color="#9CA3AF" />
                          </View>
                        )}
                      </View>
                    </Pressable>
                  </MotiView>
                ))
              )
            ) : (
              filteredGroups.length === 0 ? (
                <View style={styles.emptyState}>
                  <Users size={48} color="#D1D5DB" />
                  <Text style={styles.emptyStateText}>
                    {searchQuery ? 'לא נמצאו קבוצות' : 'אין קבוצות'}
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    {searchQuery ? 'נסה חיפוש אחר' : 'צור קבוצה כדי להתחיל'}
                  </Text>
                </View>
              ) : (
                filteredGroups.map((group, index) => (
                  <MotiView
                    key={group.id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: index * 50 }}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.groupCard,
                        pressed && styles.contactCardPressed,
                      ]}
                      onPress={() => {
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <View style={styles.groupIcon}>
                        <LinearGradient
                          colors={['#10B981', '#059669']}
                          style={styles.groupIconGradient}
                        >
                          <Users size={24} color="#FFFFFF" />
                        </LinearGradient>
                      </View>
                      <View style={styles.groupInfo}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.groupMembers}>
                          {group.contactIds.length} אנשי קשר
                        </Text>
                      </View>
                    </Pressable>
                  </MotiView>
                ))
              )
            )}
          </ScrollView>
        </View>

        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAddModal(false)}
        >
          <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
            <LinearGradient
              colors={['#EEF2FF', '#F8FAFC', '#FFFFFF']}
              locations={[0, 0.3, 1]}
              style={StyleSheet.absoluteFill}
            />
            <BlurView intensity={90} tint="light" style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setShowAddModal(false);
                  setNewContact({ name: '', phone: '', email: '', tag: '', notes: '' });
                }}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>הוסף איש קשר</Text>
            </BlurView>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              <ScrollView
                style={styles.formScroll}
                contentContainerStyle={styles.formScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <TouchableOpacity
                  style={styles.importButton}
                  onPress={handleImportFromDevice}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.importButtonGradient}
                  >
                    <Download size={20} color="#FFFFFF" />
                    <Text style={styles.importButtonText}>ייבא מאנשי קשר</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>או הוסף ידנית</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.contactForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>שם מלא *</Text>
                    <View style={styles.inputContainer}>
                      <User size={20} color="#9CA3AF" />
                      <TextInput
                        style={styles.input}
                        placeholder="הכנס שם מלא"
                        value={newContact.name}
                        onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>טלפון *</Text>
                    <View style={styles.inputContainer}>
                      <Phone size={20} color="#9CA3AF" />
                      <TextInput
                        style={styles.input}
                        placeholder="05X-XXX-XXXX"
                        value={newContact.phone}
                        onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>אימייל (אופציונלי)</Text>
                    <View style={styles.inputContainer}>
                      <Mail size={20} color="#9CA3AF" />
                      <TextInput
                        style={styles.input}
                        placeholder="example@email.com"
                        value={newContact.email}
                        onChangeText={(text) => setNewContact({ ...newContact, email: text })}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>תגית (אופציונלי)</Text>
                    <View style={styles.inputContainer}>
                      <TagIcon size={20} color="#9CA3AF" />
                      <TextInput
                        style={styles.input}
                        placeholder='למשל: "מלצר", "מנהל"'
                        value={newContact.tag}
                        onChangeText={(text) => setNewContact({ ...newContact, tag: text })}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>הערות (אופציונלי)</Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer]}>
                      <FileText size={20} color="#9CA3AF" style={styles.textAreaIcon} />
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="הכנס הערות..."
                        value={newContact.notes}
                        onChangeText={(text) => setNewContact({ ...newContact, notes: text })}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddContact}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    style={styles.saveButtonGradient}
                  >
                    <Check size={24} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>שמור איש קשר</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>

        <Modal
          visible={showImportModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowImportModal(false)}
        >
          <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
            <LinearGradient
              colors={['#EEF2FF', '#F8FAFC', '#FFFFFF']}
              locations={[0, 0.3, 1]}
              style={StyleSheet.absoluteFill}
            />
            <BlurView intensity={90} tint="light" style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setShowImportModal(false);
                  setSelectedContactIds(new Set());
                }}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                בחר אנשי קשר ({selectedContactIds.size})
              </Text>
            </BlurView>

            <ScrollView
              style={styles.importList}
              contentContainerStyle={styles.importListContent}
              showsVerticalScrollIndicator={false}
            >
              {deviceContacts.map((contact, index) => (
                <MotiView
                  key={contact.id}
                  from={{ opacity: 0, translateX: 20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'timing', duration: 300, delay: index * 30 }}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.importContactCard,
                      selectedContactIds.has(contact.id) && styles.importContactCardSelected,
                      pressed && styles.contactCardPressed,
                    ]}
                    onPress={() => toggleContactSelection(contact.id)}
                  >
                    <View style={styles.checkbox}>
                      {selectedContactIds.has(contact.id) && (
                        <View style={styles.checkboxInner}>
                          <Check size={16} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    <View style={styles.importContactInfo}>
                      <Text style={styles.importContactName}>{contact.name}</Text>
                      <Text style={styles.importContactPhone}>
                        {contact.phoneNumbers?.[0]?.number || 'ללא טלפון'}
                      </Text>
                    </View>
                  </Pressable>
                </MotiView>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.saveButton, selectedContactIds.size === 0 && styles.saveButtonDisabled]}
                onPress={handleImportSelected}
                activeOpacity={0.8}
                disabled={selectedContactIds.size === 0}
              >
                <LinearGradient
                  colors={selectedContactIds.size === 0 ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
                  style={styles.saveButtonGradient}
                >
                  <Download size={24} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>
                    ייבא {selectedContactIds.size} אנשי קשר
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBlur: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    textAlign: 'right',
  },
  viewToggleContainer: {
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row-reverse',
    borderRadius: 16,
    padding: 4,
    gap: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
    position: 'relative',
  },
  viewButtonActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  viewButtonGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 12,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    zIndex: 1,
  },
  viewButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 16,
  },
  contactCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  contactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 6,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  tagBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  contactDetailsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  contactDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactNotes: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    maxWidth: '90%',
  },
  groupCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  groupIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  groupMembers: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  importButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  importButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  contactForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    textAlign: 'right',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  importList: {
    flex: 1,
  },
  importListContent: {
    padding: 20,
    paddingBottom: 100,
  },
  importContactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  importContactCardSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  importContactInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  importContactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  importContactPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
});
