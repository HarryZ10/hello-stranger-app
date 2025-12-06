import { theme } from '@/constants/theme';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

interface MenuItemProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  showChevron?: boolean;
  badge?: number | string;
}

export default function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  iconColor,
  showChevron = true,
  badge,
}: MenuItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[50],
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: iconColor
              ? `${iconColor}20`
              : isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[100],
          },
        ]}
      >
        <FontAwesome
          name={icon}
          size={20}
          color={iconColor || theme.colors.primary}
        />
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              color: isDark ? theme.colors.text.dark : theme.colors.text.light,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              {
                color: isDark
                  ? theme.colors.text.muted.dark
                  : theme.colors.text.muted.light,
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {badge !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {showChevron && (
        <FontAwesome
          name="chevron-right"
          size={14}
          color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
});
