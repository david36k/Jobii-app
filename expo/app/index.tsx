import { useApp } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { supabaseQueries } from '@/utils/supabase-queries';
import { useMutation } from '@tanstack/react-query';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { Phone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

export default function Index() {
  const { currentUser, switchUser, isInitialized, guestMode, enterGuestMode } = useApp();
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const loginMutation = useMutation({
    mutationFn: async (phone: string) => {
      try {
        const user = await supabaseQueries.users.getByPhone(phone);
        return user;
      } catch (error: any) {
        if (error.code === 'PGRST116') {
          const newUser = await supabaseQueries.users.create({
            name: 'משתמש חדש',
            phone,
            role: 'participant',
          });
          return newUser;
        }
        throw error;
      }
    },
    onSuccess: (user) => {
      switchUser(user.id);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('[Login] Failed:', error);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    console.log('[Index] isInitialized:', isInitialized, 'currentUser:', currentUser?.id);
    if (!isInitialized) return;

    if (currentUser) {
      router.replace('/(tabs)/dashboard');
      return;
    }

    if (guestMode) {
      router.replace('/(tabs)/dashboard');
    }
  }, [currentUser, isInitialized, guestMode]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  if (!isInitialized || currentUser || guestMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('login.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogin = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    const formattedPhone = cleanPhone.startsWith('0') ? `+972${cleanPhone.substring(1)}` : `+${cleanPhone}`;
    loginMutation.mutate(formattedPhone);
  };

  const handleContinueAsGuest = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLoading(true);
      await enterGuestMode();
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('[Guest Login Error]', error);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientLoginStart, colors.gradientLoginMid, colors.background]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SafeAreaView style={styles.safeArea}>
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Phone size={48} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.title}>{t('login.title')}</Text>
                <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
              </View>

              <BlurView intensity={80} tint="light" style={styles.formCard}>
                <View style={styles.formCardInner}>
                  <Text style={styles.label}>{t('login.phoneLabel')}</Text>
                  <View style={styles.phoneInputContainer}>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder={t('login.phonePlaceholder')}
                      placeholderTextColor={colors.muted}
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      maxLength={12}
                      textAlign="right"
                      selectTextOnFocus={false}
                      autoFocus={false}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.guestButton, isLoading && styles.loginButtonDisabled]}
                    onPress={handleContinueAsGuest}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[colors.glassBackgroundStrong, colors.glassBackground]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.guestButtonGradient}
                    >
                      <Text style={styles.guestButtonText}>{t('login.continueAsGuest')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      isLoading && styles.loginButtonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primaryLight]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.loginButtonGradient}
                    >
                      <Text style={styles.loginButtonText}>
                        {isLoading ? t('login.connecting') : t('login.connect')}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>

              <View style={styles.footer}>
                <View style={styles.footerLinks}>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowTermsModal(true);
                    }}
                  >
                    <Text style={styles.footerLink}>{t('login.terms')}</Text>
                  </TouchableOpacity>
                  <Text style={styles.footerSeparator}>•</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowPrivacyModal(true);
                    }}
                  >
                    <Text style={styles.footerLink}>{t('login.privacy')}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.footerText}>{t('login.footerDisclaimer')}</Text>
              </View>
            </Animated.View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <BlurView intensity={80} tint="light" style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('login.termsModalTitle')}</Text>
            <TouchableOpacity
              onPress={() => setShowTermsModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </BlurView>
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <Text style={styles.modalText}>
              לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית קולורס מונפרד אדנדום סילקוף, מרגשי ומרגשח. עמחליף לפרומי בלוף קינץ תתיח לרעח. לת צשחמי צש בליא, מנסוטו צמלח לביקו ננבי, צמוקו בלוקריה שיצמה ברורק.

              קונדימנטום קורוס בליקרה, נונסטי קלובר בריקנה סטום, לפריקך תצטריק לרטי. סחטיר בלובק. תצטריק אלט נולום ארווס סאפיאן - פוסיליס קוויס, אקווזמן קוואזי במר מודוף. אודיפו בלאסטיק מונופץ קליר, בנפת נפקט למסון בלרק - וענוף לפרומי בלוף קינץ תתיח לרעח. לת צשחמי.

סחטיר בלובק. תצטריק אלט נולום ארווס סאפיאן - פוסיליס קוויס, אקווזמן קוואזי במר מודוף. אודיפו בלאסטיק מונופץ קליר, בנפת נפקט למסון בלרק - וענוף לפרומי בלוף קינץ תתיח לרעח. לת צשחמי צש בליא, מנסוטו צמלח לביקו ננבי, צמוקו בלוקריה שיצמה ברורק.

קולורס מונפרד אדנדום סילקוף, מרגשי ומרגשח. עמחליף קונדימנטום קורוס בליקרה, נונסטי קלובר בריקנה סטום, לפריקך תצטריק לרטי. לפרומי בלוף קינץ תתיח לרעח.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <BlurView intensity={80} tint="light" style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('login.privacyModalTitle')}</Text>
            <TouchableOpacity
              onPress={() => setShowPrivacyModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </BlurView>
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <Text style={styles.modalText}>
              לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית נולום ארווס סאפיאן - פוסיליס קוויס, אקווזמן קוואזי במר מודוף. קולורס מונפרד אדנדום סילקוף, מרגשי ומרגשח. עמחליף קונדימנטום קורוס בליקרה.

לפרומי בלוף קינץ תתיח לרעח. לת צשחמי צש בליא, מנסוטו צמלח לביקו ננבי, צמוקו בלוקריה שיצמה ברורק. נונסטי קלובר בריקנה סטום, לפריקך תצטריק לרטי. סחטיר בלובך. תצטריק אלט נולום ארווס סאפיאן - פוסיליס קוויס, אקווזמן קוואזי במר מודוף.

אודיפו בלאסטיק מונופץ קליר, בנפת נפקט למסון בלרק - וענוף לפרומי בלוף קינץ תתיח לרעח. לת צשחמי צש בליא, מנסוטו צמלח לביקו ננבי, צמוקו בלוקריה שיצמה ברורק. קונדימנטום קורוס בליקרה, נונסטי קלובר בריקנה סטום, לפריקך תצטריק לרטי.

סחטיר בלובק. תצטריק אלט נולום ארווס סאפיאן - פוסיליס קוויס, אקווזמן קוואזי במר מודוף. קולורס מונפרד אדנדום סילקוף, מרגשי ומרגשח. עמחליף לפרומי בלוף קינץ תתיח לרעח. לת צשחמי צש בליא.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.glassBackgroundStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 15,
  },
  formCardInner: {
    padding: 28,
    backgroundColor: colors.glassBackgroundStrong,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'right',
  },
  phoneInputContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  phoneInput: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    paddingVertical: 16,
    paddingHorizontal: 12,
    textAlign: 'right',
  },
  loginButton: {
    marginTop: 28,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  guestButton: {
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  guestButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.background,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  footerSeparator: {
    fontSize: 14,
    color: colors.muted,
  },
  footerText: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '600' as const,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 24,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 28,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
