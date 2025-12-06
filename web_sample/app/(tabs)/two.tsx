import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import BottomSheetMenu, { BottomSheetMenuRef } from '@/components/BottomSheetMenu';
import UserAvatar from '@/components/UserAvatar';
import { theme } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import type { Connection, User } from '@/src/types';

// Mock data
const mockFriends: User[] = [
  { id: 1, email: 'alice@example.com', username: 'alice', display_name: 'Alice', trust_score: 4.8, total_reviews: 20, is_verified: true, is_phone_verified: true, is_email_verified: true, share_location: true, location_visibility: 'approximate', personality_traits: [] },
  { id: 2, email: 'bob@example.com', username: 'bob', display_name: 'Bob', trust_score: 4.5, total_reviews: 15, is_verified: true, is_phone_verified: true, is_email_verified: true, share_location: true, location_visibility: 'exact', personality_traits: [] },
  { id: 3, email: 'charlie@example.com', username: 'charlie', display_name: 'Charlie', trust_score: 4.2, total_reviews: 8, is_verified: false, is_phone_verified: true, is_email_verified: true, share_location: false, location_visibility: 'hidden', personality_traits: [] },
  { id: 4, email: 'diana@example.com', username: 'diana', display_name: 'Diana', trust_score: 4.9, total_reviews: 30, is_verified: true, is_phone_verified: true, is_email_verified: true, share_location: true, location_visibility: 'approximate', personality_traits: [] },
];

const mockPendingRequests: Connection[] = [
  { id: 1, from_user: { id: 5, email: 'eve@example.com', username: 'eve', display_name: 'Eve', trust_score: 3.8, total_reviews: 5, is_verified: false, is_phone_verified: false, is_email_verified: true, share_location: true, location_visibility: 'approximate', personality_traits: [] }, to_user: mockFriends[0], status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

type Tab = 'friends' | 'requests' | 'discover';

export default function SocialScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bottomSheetRef = useRef<BottomSheetMenuRef>(null);

  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [friends, setFriends] = useState<User[]>(mockFriends);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>(mockPendingRequests);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Fetch real data here
    setRefreshing(false);
  }, []);

  const filteredFriends = friends.filter((friend) =>
    friend.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFriendPress = (friend: User) => {
    console.log('Friend pressed:', friend.id);
  };

  const handleAcceptRequest = (connectionId: number) => {
    console.log('Accept request:', connectionId);
  };

  const handleDeclineRequest = (connectionId: number) => {
    console.log('Decline request:', connectionId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'friends':
        return (
          <>
            {/* Search */}
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                },
              ]}
            >
              <FontAwesome
                name="search"
                size={16}
                color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    color: isDark ? theme.colors.text.dark : theme.colors.text.light,
                  },
                ]}
                placeholder="Search friends..."
                placeholderTextColor={
                  isDark ? theme.colors.gray[500] : theme.colors.gray[400]
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Friends List */}
            {filteredFriends.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome
                  name="users"
                  size={48}
                  color={isDark ? theme.colors.gray[600] : theme.colors.gray[300]}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    {
                      color: isDark
                        ? theme.colors.text.muted.dark
                        : theme.colors.text.muted.light,
                    },
                  ]}
                >
                  No friends yet
                </Text>
                <Text
                  style={[
                    styles.emptyStateSubtext,
                    {
                      color: isDark
                        ? theme.colors.text.muted.dark
                        : theme.colors.text.muted.light,
                    },
                  ]}
                >
                  Connect with people you meet at activities!
                </Text>
              </View>
            ) : (
              filteredFriends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    styles.friendCard,
                    {
                      backgroundColor: isDark
                        ? theme.colors.gray[800]
                        : theme.colors.gray[50],
                    },
                  ]}
                  onPress={() => handleFriendPress(friend)}
                >
                  <UserAvatar user={friend} size="md" showBadge />
                  <View style={styles.friendInfo}>
                    <Text
                      style={[
                        styles.friendName,
                        {
                          color: isDark
                            ? theme.colors.text.dark
                            : theme.colors.text.light,
                        },
                      ]}
                    >
                      {friend.display_name || friend.username}
                    </Text>
                    <View style={styles.friendMeta}>
                      <FontAwesome
                        name="star"
                        size={12}
                        color={theme.colors.warning}
                      />
                      <Text
                        style={[
                          styles.friendMetaText,
                          {
                            color: isDark
                              ? theme.colors.text.muted.dark
                              : theme.colors.text.muted.light,
                          },
                        ]}
                      >
                        {friend.trust_score.toFixed(1)}
                      </Text>
                      {friend.share_location && (
                        <>
                          <FontAwesome
                            name="map-marker"
                            size={12}
                            color={theme.colors.accent}
                            style={{ marginLeft: 8 }}
                          />
                          <Text
                            style={[
                              styles.friendMetaText,
                              {
                                color: isDark
                                  ? theme.colors.text.muted.dark
                                  : theme.colors.text.muted.light,
                              },
                            ]}
                          >
                            Nearby
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <FontAwesome
                    name="comment"
                    size={20}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              ))
            )}
          </>
        );

      case 'requests':
        return (
          <>
            {pendingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome
                  name="user-plus"
                  size={48}
                  color={isDark ? theme.colors.gray[600] : theme.colors.gray[300]}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    {
                      color: isDark
                        ? theme.colors.text.muted.dark
                        : theme.colors.text.muted.light,
                    },
                  ]}
                >
                  No pending requests
                </Text>
              </View>
            ) : (
              pendingRequests.map((request) => (
                <View
                  key={request.id}
                  style={[
                    styles.requestCard,
                    {
                      backgroundColor: isDark
                        ? theme.colors.gray[800]
                        : theme.colors.gray[50],
                    },
                  ]}
                >
                  <UserAvatar user={request.from_user} size="md" showBadge />
                  <View style={styles.requestInfo}>
                    <Text
                      style={[
                        styles.friendName,
                        {
                          color: isDark
                            ? theme.colors.text.dark
                            : theme.colors.text.light,
                        },
                      ]}
                    >
                      {request.from_user.display_name || request.from_user.username}
                    </Text>
                    <Text
                      style={[
                        styles.requestSubtext,
                        {
                          color: isDark
                            ? theme.colors.text.muted.dark
                            : theme.colors.text.muted.light,
                        },
                      ]}
                    >
                      Wants to connect
                    </Text>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.acceptButton]}
                      onPress={() => handleAcceptRequest(request.id)}
                    >
                      <FontAwesome name="check" size={16} color={theme.colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.declineButton]}
                      onPress={() => handleDeclineRequest(request.id)}
                    >
                      <FontAwesome name="times" size={16} color={theme.colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        );

      case 'discover':
        return (
          <View style={styles.emptyState}>
            <FontAwesome
              name="compass"
              size={48}
              color={isDark ? theme.colors.gray[600] : theme.colors.gray[300]}
            />
            <Text
              style={[
                styles.emptyStateText,
                {
                  color: isDark
                    ? theme.colors.text.muted.dark
                    : theme.colors.text.muted.light,
                },
              ]}
            >
              Discover people nearby
            </Text>
            <Text
              style={[
                styles.emptyStateSubtext,
                {
                  color: isDark
                    ? theme.colors.text.muted.dark
                    : theme.colors.text.muted.light,
                },
              ]}
            >
              Coming soon!
            </Text>
          </View>
        );
    }
  };

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.background.dark
              : theme.colors.background.light,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: isDark ? theme.colors.text.dark : theme.colors.text.light,
              },
            ]}
          >
            Social
          </Text>
          <TouchableOpacity
            style={[
              styles.headerButton,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[100],
              },
            ]}
          >
            <FontAwesome
              name="envelope"
              size={20}
              color={isDark ? theme.colors.text.dark : theme.colors.text.light}
            />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['friends', 'requests', 'discover'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && {
                  borderBottomColor: theme.colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === tab
                        ? theme.colors.primary
                        : isDark
                        ? theme.colors.text.muted.dark
                        : theme.colors.text.muted.light,
                    fontWeight:
                      activeTab === tab
                        ? theme.fontWeight.semibold
                        : theme.fontWeight.normal,
                  },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {tab === 'requests' && pendingRequests.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{pendingRequests.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Sheet */}
        <BottomSheetMenu
          ref={bottomSheetRef}
          initialSnapPoint={0}
          enablePanDownToClose={false}
        >
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {renderTabContent()}
          </ScrollView>
        </BottomSheetMenu>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    gap: 6,
  },
  tabText: {
    fontSize: theme.fontSize.md,
  },
  tabBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  tabBadgeText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  friendInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  friendName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  friendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  friendMetaText: {
    fontSize: theme.fontSize.sm,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  requestInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  requestSubtext: {
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  requestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: theme.colors.accent,
  },
  declineButton: {
    backgroundColor: theme.colors.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    marginTop: theme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
