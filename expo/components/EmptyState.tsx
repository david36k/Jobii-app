import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconColor?: string;
}

export default function EmptyState({ icon: Icon, title, subtitle, iconColor = colors.borderLight }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Icon size={48} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
});
