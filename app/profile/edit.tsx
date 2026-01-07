import { useApp } from '@/contexts/AppContext';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Save } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function EditProfile() {
  const { currentUser } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('שגיאה', 'נא למלא את השם');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('שגיאה', 'נא למלא את מספר הטלפון');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'השינויים נשמרו',
      'הפרופיל עודכן בהצלחה',
      [
        {
          text: 'אישור',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'ערוך פרופיל',
          headerBackTitle: 'חזרה',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{name.charAt(0) || 'U'}</Text>
            </View>
            <TouchableOpacity
              style={styles.changeAvatarButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('שנה תמונה', 'תכונה זו תהיה זמינה בקרוב...');
              }}
            >
              <Text style={styles.changeAvatarText}>שנה תמונה</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Text style={styles.labelText}>שם מלא</Text>
                <User size={18} color="#6B7280" />
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="הכנס שם מלא"
                placeholderTextColor="#9CA3AF"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Text style={styles.labelText}>טלפון</Text>
                <Phone size={18} color="#6B7280" />
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="הכנס מספר טלפון"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Save size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>שמור שינויים</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  changeAvatarButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#4F46E5',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  footer: {
    padding: 20,
    paddingBottom: 0,
  },
  saveButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
