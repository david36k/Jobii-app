import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { colors } from '@/constants/colors';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { BlurView } from 'expo-blur';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type RequireAuthModalProps = {
  visible: boolean;
  onClose?: () => void;
};

export default function RequireAuthModal({ visible, onClose }: RequireAuthModalProps) {
  const { exitGuestMode } = useApp();
  const { t, isRTL } = useLanguage();

  const handleClose = () => {
    onClose?.();
  };

  const handlePrimary = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await exitGuestMode();
    router.replace('/');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <BlurView intensity={80} tint="light" style={styles.modalCard}>
          <Text style={[styles.title, isRTL ? undefined : styles.titleLTR]}>{t('login.requireAuthTitle')}</Text>
          <Text style={[styles.desc, isRTL ? undefined : styles.descLTR]}>{t('login.requireAuthDesc')}</Text>

          <View style={[styles.actions, isRTL ? undefined : styles.actionsLTR]}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handlePrimary}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.primaryLight, colors.primary]}
                style={styles.primaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.primaryButtonText}>{t('login.requireAuthButton')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleClose} activeOpacity={0.85}>
              <Text style={styles.secondaryButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayScrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassBackgroundStrong,
    padding: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'right',
    marginBottom: 8,
  },
  titleLTR: {
    textAlign: 'left',
  },
  desc: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'right',
    marginBottom: 18,
  },
  descLTR: {
    textAlign: 'left',
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionsLTR: {
    flexDirection: 'row',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.background,
  },
  secondaryButton: {
    flex: 0.5,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
});

