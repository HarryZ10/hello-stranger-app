import {
  StyleSheet,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const handleCreateProfile = () => {
    // Send users to login/signup before letting them create a profile
    router.push("/login");
  };

  return (
    <ImageBackground
      source={require("@/assets/images/MainPage.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Hero Section */}
        <View style={styles.heroSection}></View>

        {/* CTA Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.createProfileButton,
              {
                backgroundColor:
                  Colors[(colorScheme ?? "light") as "light" | "dark"].tint,
              },
            ]}
            onPress={handleCreateProfile}
          >
            <ThemedText style={styles.buttonText}>Create Profile</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 62,
  },
  appSubtitle: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
    opacity: 0.7,
  },
  contentSection: {
    flex: 1,
    gap: 16,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  buttonSection: {
    gap: 12,
    alignItems: "center",
  },
  createProfileButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.6,
  },
});
