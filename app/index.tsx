import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
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
import { Phone, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

export default function Index() {
  const { currentUser, switchUser, mockUsers, isInitialized } = useApp();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    console.log('[Index] isInitialized:', isInitialized, 'currentUser:', currentUser?.id);
    if (isInitialized && currentUser) {
      router.replace('/(tabs)/dashboard' as any);
    }
  }, [currentUser, isInitialized]);

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
  }, []);

  if (!isInitialized || currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>טוען...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSendOtp = async () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setShowOtp(true);
    }, 500);
  };

  const handleLogin = async () => {
    if (!showOtp) {
      await handleSendOtp();
      return;
    }

    if (!otpCode || otpCode.length < 4) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    setTimeout(() => {
      const demoUser = mockUsers[0];
      switchUser(demoUser.id);
      setIsLoading(false);
    }, 800);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EEF2FF', '#FEFCE8', '#FFFFFF']}
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
                  <Phone size={48} color="#4F46E5" strokeWidth={2} />
                </View>
                <Text style={styles.title}>Jobii</Text>
                <Text style={styles.subtitle}>התחבר עם מספר הטלפון שלך</Text>
              </View>

              <BlurView intensity={80} tint="light" style={styles.formCard}>
                <View style={styles.formCardInner}>
                  <Text style={styles.label}>מספר טלפון</Text>
                  <View style={styles.phoneInputContainer}>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="050-123-4567"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      maxLength={12}
                      textAlign="right"
                      selectTextOnFocus={false}
                      autoFocus={false}
                    />
                  </View>

                  {showOtp && (
                    <Animated.View style={styles.otpContainer}>
                      <Text style={styles.label}>קוד אימות</Text>
                      <TextInput
                        style={styles.otpInput}
                        placeholder="0000"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        value={otpCode}
                        onChangeText={setOtpCode}
                        maxLength={6}
                        textAlign="center"
                      />
                      <Text style={styles.otpHint}>הזן את קוד האימות שנשלח אליך</Text>
                    </Animated.View>
                  )}

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
                      colors={['#4F46E5', '#6366F1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.loginButtonGradient}
                    >
                      {isLoading ? (
                        <Text style={styles.loginButtonText}>מתחבר...</Text>
                      ) : showOtp ? (
                        <View style={styles.loginButtonContent}>
                          <CheckCircle size={20} color="#FFFFFF" />
                          <Text style={styles.loginButtonText}>התחבר</Text>
                        </View>
                      ) : (
                        <Text style={styles.loginButtonText}>שלח קוד</Text>
                      )}
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
                    <Text style={styles.footerLink}>תנאי שימוש</Text>
                  </TouchableOpacity>
                  <Text style={styles.footerSeparator}>•</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowPrivacyModal(true);
                    }}
                  >
                    <Text style={styles.footerLink}>מדיניות פרטיות</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.footerText}>
                  בהמשך השימוש באפליקציה, אתה מסכים לתנאים שלנו
                </Text>
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
            <Text style={styles.modalTitle}>תנאי שימוש</Text>
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
            <Text style={styles.modalTitle}>מדיניות פרטיות</Text>
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
    color: '#6B7280',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: '800' as const,
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 15,
  },
  formCardInner: {
    padding: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'right',
  },
  phoneInputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  phoneInput: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    paddingVertical: 16,
    paddingHorizontal: 12,
    textAlign: 'right',
  },
  otpContainer: {
    marginTop: 24,
  },
  otpInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    letterSpacing: 8,
  },
  otpHint: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  loginButton: {
    marginTop: 28,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
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
    color: '#4F46E5',
  },
  footerSeparator: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#111827',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#6B7280',
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
    color: '#374151',
    textAlign: 'right',
  },
});
