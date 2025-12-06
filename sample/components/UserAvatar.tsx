import { theme } from '@/constants/theme';
import type { User } from '@/src/types';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  showBadge?: boolean;
  showName?: boolean;
}

export default function UserAvatar({
  user,
  size = 'md',
  onPress,
  showBadge = false,
  showName = false,
}: UserAvatarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const avatarSize = sizeMap[size];

  const getInitials = () => {
    if (user.display_name) {
      return user.display_name.charAt(0).toUpperCase();
    }
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    return user.display_name || user.first_name || user.username;
  };

  const avatarContent = user.avatar ? (
    <Image
      source={{ uri: user.avatar }}
      style={[
        styles.avatar,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
      ]}
    />
  ) : (
    <View
      style={[
        styles.avatarPlaceholder,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: theme.colors.primary,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: avatarSize * 0.4,
          },
        ]}
      >
        {getInitials()}
      </Text>
    </View>
  );

  const content = (
    <View style={styles.container}>
      <View>
        {avatarContent}
        {showBadge && user.is_verified && (
          <View
            style={[
              styles.badge,
              {
                width: avatarSize * 0.3,
                height: avatarSize * 0.3,
                borderRadius: avatarSize * 0.15,
              },
            ]}
          >
            <FontAwesome
              name="check"
              size={avatarSize * 0.15}
              color={theme.colors.white}
            />
          </View>
        )}
      </View>
      {showName && (
        <Text
          style={[
            styles.name,
            {
              color: isDark ? theme.colors.text.dark : theme.colors.text.light,
            },
          ]}
          numberOfLines={1}
        >
          {getDisplayName()}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatar: {
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  name: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
});
