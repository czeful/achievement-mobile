import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from './theme';

export const navigationStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: spacing.sm,
  },
  tabBarLabel: {
    ...typography.small,
    fontWeight: '500',
  },
  tabBarIcon: {
    width: 24,
    height: 24,
  },
  header: {
    backgroundColor: colors.background,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  headerButton: {
    padding: spacing.sm,
  },
  headerButtonText: {
    ...typography.body,
    color: colors.primary,
  },
}); 