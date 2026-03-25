import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';
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
  const { currentUser, updateProfile } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('שגיאה', 'נא למלא את השם');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('שגיאה', 'נא למלא את מספר הטלפון');
      return;
    }

    if (!currentUser) return;

    setIsSaving(true);
    try {
      await updateProfile(currentUser.id, { name: name.trim(), phone: phone.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'השינויים נשמרו',
        'הפרופיל עודכן בהצלחה',
        [{ text: 'אישור', onPress: () => router.back() }]
      );
    } catch (error: any) {
      const message = error?.message?.includes('unique') || error?.code === '23505'
        ? 'מספר הטלפון כבר בשימוש'
        : 'אירעה שגיאה בעדכון הפרופיל';
      Alert.alert('שגיאה', message);
    } finally {
      setIsSaving(false);
    }
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
                <User size={18} color={colors.textMuted} />
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="הכנס שם מלא"
                placeholderTextColor={colors.muted}
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Text style={styles.labelText}>טלפון</Text>
                <Phone size={18} color={colors.textMuted} />
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="הכנס מספר טלפון"
                placeholderTextColor={colors.muted}
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
            disabled={isSaving}
          >
            <Save size={24} color={colors.background} />
            <Text style={styles.saveButtonText}>{isSaving ? 'שומר...' : 'שמור שינויים'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: colors.background,
  },
  changeAvatarButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.gradientLoginStart,
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
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
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
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
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.background,
  },
});
