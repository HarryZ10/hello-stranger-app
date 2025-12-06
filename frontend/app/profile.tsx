import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import { authService } from "@/src/api/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    displayName: "",
    bio: "",
  });

  const colorScheme = useColorScheme();
  const router = useRouter();
  const tintColor = Colors[(colorScheme ?? "light") as "light" | "dark"].tint;
  const textColor = Colors[(colorScheme ?? "light") as "light" | "dark"].text;
  const backgroundColor =
    Colors[(colorScheme ?? "light") as "light" | "dark"].background;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const response = await authService.getProfile();

    if (response.data) {
      setProfile({
        email: response.data.email || "",
        username: response.data.username || "",
        firstName: response.data.first_name || "",
        lastName: response.data.last_name || "",
        displayName: response.data.display_name || "",
        bio: response.data.bio || "",
      });
    } else {
      Alert.alert("Error", "Failed to load profile");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const response = await authService.updateProfile({
      first_name: profile.firstName,
      last_name: profile.lastName,
      display_name: profile.displayName,
      bio: profile.bio,
    });

    setLoading(false);

    if (response.data) {
      Alert.alert("Success", "Profile updated!");
      setEditing(false);
    } else {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={{ marginTop: 16 }}>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Profile Header */}
        <View style={{ alignItems: "center", marginBottom: 30, marginTop: 20 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: tintColor,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <MaterialCommunityIcons name="account" size={60} color="#fff" />
          </View>
          <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
            {profile.displayName || profile.username}
          </ThemedText>
          <ThemedText style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>
            @{profile.username}
          </ThemedText>
        </View>

        {/* Profile Info */}
        <View style={{ marginBottom: 20 }}>
          <ThemedText
            style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}
          >
            Email
          </ThemedText>
          <View
            style={{
              backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <ThemedText>{profile.email}</ThemedText>
          </View>

          <ThemedText
            style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}
          >
            First Name
          </ThemedText>
          {editing ? (
            <TextInput
              value={profile.firstName}
              onChangeText={(text) =>
                setProfile({ ...profile, firstName: text })
              }
              style={{
                borderWidth: 1,
                borderColor: tintColor,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                color: textColor,
                backgroundColor: backgroundColor,
              }}
            />
          ) : (
            <View
              style={{
                backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <ThemedText>{profile.firstName}</ThemedText>
            </View>
          )}

          <ThemedText
            style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}
          >
            Last Name
          </ThemedText>
          {editing ? (
            <TextInput
              value={profile.lastName}
              onChangeText={(text) =>
                setProfile({ ...profile, lastName: text })
              }
              style={{
                borderWidth: 1,
                borderColor: tintColor,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                color: textColor,
                backgroundColor: backgroundColor,
              }}
            />
          ) : (
            <View
              style={{
                backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <ThemedText>{profile.lastName}</ThemedText>
            </View>
          )}

          <ThemedText
            style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}
          >
            Display Name
          </ThemedText>
          {editing ? (
            <TextInput
              value={profile.displayName}
              onChangeText={(text) =>
                setProfile({ ...profile, displayName: text })
              }
              style={{
                borderWidth: 1,
                borderColor: tintColor,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                color: textColor,
                backgroundColor: backgroundColor,
              }}
            />
          ) : (
            <View
              style={{
                backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <ThemedText>{profile.displayName}</ThemedText>
            </View>
          )}

          <ThemedText
            style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}
          >
            Bio
          </ThemedText>
          {editing ? (
            <TextInput
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              multiline
              numberOfLines={4}
              style={{
                borderWidth: 1,
                borderColor: tintColor,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                color: textColor,
                backgroundColor: backgroundColor,
                minHeight: 100,
                textAlignVertical: "top",
              }}
            />
          ) : (
            <View
              style={{
                backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                minHeight: 100,
              }}
            >
              <ThemedText>{profile.bio || "No bio yet"}</ThemedText>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {editing ? (
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 40 }}>
            <TouchableOpacity
              onPress={() => {
                setEditing(false);
                loadProfile();
              }}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 8,
                alignItems: "center",
                backgroundColor: colorScheme === "dark" ? "#333" : "#ddd",
              }}
            >
              <ThemedText style={{ fontWeight: "bold" }}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                flex: 1,
                backgroundColor: tintColor,
                padding: 16,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>
                Save Changes
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setEditing(true)}
            style={{
              backgroundColor: tintColor,
              padding: 16,
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 40,
            }}
          >
            <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>
              Edit Profile
            </ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ThemedView>
  );
}
