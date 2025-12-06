import { theme } from '@/constants/theme';
import type { ActivityCategory } from '@/src/types';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme
} from 'react-native';

interface CategoryChipProps {
  category: ActivityCategory;
  selected?: boolean;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function CategoryChip({
  category,
  selected = false,
  onPress,
  size = 'md',
}: CategoryChipProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const sizeStyles = {
    sm: {
      paddingH: theme.spacing.sm,
      paddingV: 4,
      fontSize: theme.fontSize.xs,
      iconSize: 12,
    },
    md: {
      paddingH: theme.spacing.md,
      paddingV: theme.spacing.sm,
      fontSize: theme.fontSize.sm,
      iconSize: 14,
    },
    lg: {
      paddingH: theme.spacing.lg,
      paddingV: theme.spacing.md,
      fontSize: theme.fontSize.md,
      iconSize: 16,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          paddingHorizontal: currentSize.paddingH,
          paddingVertical: currentSize.paddingV,
          backgroundColor: selected
            ? category.color
            : isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[100],
          borderColor: selected
            ? category.color
            : isDark
            ? theme.colors.gray[700]
            : theme.colors.gray[200],
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: currentSize.iconSize }}>{category.icon}</Text>
      <Text
        style={[
          styles.text,
          {
            fontSize: currentSize.fontSize,
            color: selected
              ? theme.colors.white
              : isDark
              ? theme.colors.text.dark
              : theme.colors.text.light,
          },
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  text: {
    fontWeight: theme.fontWeight.medium,
  },
});
