import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import usersAPI from '@/src/api/endpoints/users';
import { useAuthStore } from '@/src/store/authStore';
import { User, UserPreferences } from '@/src/types';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  colorScheme: 'light' | 'dark';
}

function ProfileSection({ title, children, colorScheme }: ProfileSectionProps) {
  return (
    <View style={[styles.section, { backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff' }]}>
      <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

interface MenuItemProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
  colorScheme: 'light' | 'dark';
}

function MenuItem({ icon, title, subtitle, onPress, showArrow = true, danger = false, colorScheme }: MenuItemProps) {
  const textColor = danger 
    ? '#ef4444' 
    : colorScheme === 'dark' ? '#ffffff' : '#1f2937';
  
  return (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.menuIconContainer,
        { backgroundColor: danger ? '#fef2f2' : colorScheme === 'dark' ? '#374151' : '#f3f4f6' }
      ]}>
        <FontAwesome name={icon} size={18} color={danger ? '#ef4444' : Colors.light.tint} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: textColor }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showArrow && (
        <FontAwesome 
          name="chevron-right" 
          size={14} 
          color={colorScheme === 'dark' ? '#4b5563' : '#9ca3af'} 
        />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const [profileData, prefsData] = await Promise.all([
        usersAPI.getProfile(),
        usersAPI.getPreferences().catch(() => null),
      ]);
      setProfile(profileData);
      setPreferences(prefsData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        },
      ]
    );
  };

  const getVerificationStatus = () => {
    if (!profile) return 'Not verified';
    // In real app, check verification status from profile
    return 'Verified';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff' }]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profile?.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.light.tint }]}>
                  <Text style={styles.avatarText}>
                    {profile?.first_name?.charAt(0) || user?.first_name?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarButton}>
                <FontAwesome name="camera" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.userName, { color: colorScheme === 'dark' ? '#ffffff' : '#1f2937' }]}>
              {profile?.first_name || user?.first_name} {profile?.last_name || user?.last_name}
            </Text>
            <Text style={[styles.userEmail, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
              {profile?.email || user?.email}
            </Text>
            {profile?.bio && (
              <Text style={[styles.userBio, { color: colorScheme === 'dark' ? '#d1d5db' : '#4b5563' }]}>
                {profile.bio}
              </Text>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colorScheme === 'dark' ? '#ffffff' : '#1f2937' }]}>
                {profile?.activities_hosted || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
                Hosted
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb' }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colorScheme === 'dark' ? '#ffffff' : '#1f2937' }]}>
                {profile?.activities_joined || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
                Joined
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb' }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colorScheme === 'dark' ? '#ffffff' : '#1f2937' }]}>
                {profile?.average_rating?.toFixed(1) || '0.0'}
              </Text>
              <Text style={[styles.statLabel, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
                Rating
              </Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <ProfileSection title="Account" colorScheme={colorScheme}>
          <MenuItem
            icon="user"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => {}}
            colorScheme={colorScheme}
          />
          <MenuItem
            icon="heart"
            title="Preferences"
            subtitle="Activity preferences & interests"
            onPress={() => {}}
            colorScheme={colorScheme}
          />
          <MenuItem
            icon="shield"
            title="Verification"
            subtitle={getVerificationStatus()}
            onPress={() => {}}
            colorScheme={colorScheme}
          />
        </ProfileSection>

        {/* Safety */}
        <ProfileSection title="Safety" colorScheme={colorScheme}>
          <MenuItem
            icon="phone"
            title="Emergency Contacts"
            subtitle="Manage your emergency contacts"
            onPress={() => {}}
            colorScheme={colorScheme}
          />
          <MenuItem
            icon="lock"
            title="Privacy Settings"
            subtitle="Control who can see your profile"
            onPress={() => {}}
            colorScheme={colorScheme}
          />
          <MenuItem
            icon="flag"
            title="Report History"
            subtitle="View submitted reports"
            onPress={() => {}}
            colorScheme={colorScheme}
          />
        </ProfileSection>

        {/* App Settings */}
        <ProfileSection title="App" colorScheme={colorScheme}>
          <MenuItem
            icon="bell"
            title="Notifications"
            subtitle="Customize your notifications"
            onPress={() => {}}
            colorScheme={colorScheme}
          />
          <MenuItem
            icon="map-marker"
            title="Location Settings"
            subtitle="Manage location preferences"
            onPress={() => {}}
            colorScheme={colorScheme}
          />
          <MenuItem
            icon="question-circle"
            title="Help & Support"
            onPress={() => {}}
            colorScheme={colorScheme}
          />
        </ProfileSection>

        {/* Logout */}
        <ProfileSection title="" colorScheme={colorScheme}>
          <MenuItem
            icon="sign-out"
            title="Logout"
            onPress={handleLogout}
            showArrow={false}
            danger
            colorScheme={colorScheme}
          />
        </ProfileSection>

        {/* Version */}
        <Text style={[styles.version, { color: colorScheme === 'dark' ? '#4b5563' : '#9ca3af' }]}>
          Version 1.0.0 (MVP)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingVertical: 24,
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#ffffff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  userBio: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 40,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  section: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 24,
  },
});
