import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { Pin } from "@/types/map";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface BottomMenuProps {
  selectedPin: Pin | null;
  isCreatingActivity: boolean;
  selectingLocation: boolean;
  pins: Pin[];
  joinedPins: Set<string>;
  colorScheme: string | null | undefined;
  onSelectPin: (pin: Pin) => void;
  onJoinPin: (pinId: string) => void;
  onCreateActivityToggle: (value: boolean) => void;
  onFormChange: (value: {
    activity: string;
    description: string;
    people: string;
  }) => void;
  onAddPin: (pin: Pin) => void;
  onSelectLocation: () => void;
  onDeselectPin: () => void;
  activityForm: { activity: string; description: string; people: string };
  selectedLocation: any;
}

export function BottomMenu({
  selectedPin,
  isCreatingActivity,
  selectingLocation,
  pins,
  joinedPins,
  colorScheme,
  onSelectPin,
  onJoinPin,
  onCreateActivityToggle,
  onFormChange,
  onAddPin,
  onSelectLocation,
  onDeselectPin,
  activityForm,
  selectedLocation,
}: BottomMenuProps) {
  if (selectingLocation) {
    return null;
  }

  return (
    <ThemedView
      style={[
        styles.bottomMenu,
        !selectedPin && !isCreatingActivity && styles.bottomMenuCompact,
      ]}
    >
      {selectedPin ? (
        // Selected Pin Detail View
        <ScrollView style={styles.menuContent}>
          <TouchableOpacity style={styles.backButton} onPress={onDeselectPin}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={Colors[(colorScheme ?? "light") as "light" | "dark"].tint}
            />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.pinDetailTitle}>
            {selectedPin.title}
          </ThemedText>

          <View style={styles.detailSection}>
            <ThemedText style={styles.detailLabel}>Activity:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {selectedPin.activity || "No activity"}
            </ThemedText>
          </View>

          <View style={styles.detailSection}>
            <ThemedText style={styles.detailLabel}>Description:</ThemedText>
            <View style={styles.descriptionBox}>
              <ThemedText style={styles.descriptionText}>
                {selectedPin.description || "No description provided"}
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.joinButton,
              joinedPins.has(selectedPin.id) && styles.joinedButton,
            ]}
            onPress={() => onJoinPin(selectedPin.id)}
          >
            <ThemedText style={styles.joinButtonText}>
              {joinedPins.has(selectedPin.id) ? "Joined" : "Join"}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        // Pin List View or Create Activity View
        <>
          {!isCreatingActivity ? (
            <ScrollView style={styles.menuContent}>
              <TouchableOpacity
                style={styles.createActivityButton}
                onPress={() => onCreateActivityToggle(true)}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                <ThemedText style={styles.createActivityButtonText}>
                  Create Activity
                </ThemedText>
              </TouchableOpacity>

              {pins.map((pin) => (
                <TouchableOpacity
                  key={pin.id}
                  style={styles.pinItem}
                  onPress={() => onSelectPin(pin)}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color={
                      Colors[(colorScheme ?? "light") as "light" | "dark"].tint
                    }
                  />
                  <ThemedText style={styles.pinTitle}>{pin.title}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            // Create Activity View
            <ScrollView style={styles.menuContent}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => onCreateActivityToggle(false)}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color={
                    Colors[(colorScheme ?? "light") as "light" | "dark"].tint
                  }
                />
                <ThemedText style={styles.backButtonText}>Back</ThemedText>
              </TouchableOpacity>

              <ThemedText style={styles.pinDetailTitle}>
                Create Activity
              </ThemedText>

              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Activity:</ThemedText>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter activity name"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={activityForm.activity}
                  onChangeText={(text) =>
                    onFormChange({ ...activityForm, activity: text })
                  }
                />
              </View>

              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Description:</ThemedText>
                <TextInput
                  style={[styles.textInput, styles.descriptionInput]}
                  placeholder="Enter activity description"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={activityForm.description}
                  onChangeText={(text) =>
                    onFormChange({ ...activityForm, description: text })
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>
                  Number of People:
                </ThemedText>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter number of people"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={activityForm.people}
                  onChangeText={(text) =>
                    onFormChange({ ...activityForm, people: text })
                  }
                  keyboardType="number-pad"
                />
              </View>

              <TouchableOpacity
                style={styles.submitActivityButton}
                onPress={() => {
                  if (selectedLocation && activityForm.activity) {
                    const newPin: Pin = {
                      id: `pin-${Date.now()}`,
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                      title: activityForm.activity,
                      activity: activityForm.activity,
                      description: activityForm.description,
                    };
                    onAddPin(newPin);
                  } else {
                    onSelectLocation();
                  }
                }}
              >
                <ThemedText style={styles.submitActivityButtonText}>
                  {selectedLocation ? "Create Activity" : "Select Location"}
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bottomMenu: {
    width: "100%",
    height: 400,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  bottomMenuCompact: {
    height: 200,
  },
  menuContent: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  pinDetailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  descriptionBox: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    minHeight: 80,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  joinButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: "#007AFF",
  },
  joinedButton: {
    backgroundColor: "#34C759",
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  pinItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  pinTitle: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  createActivityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: "#007AFF",
  },
  createActivityButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000",
  },
  descriptionInput: {
    textAlignVertical: "top",
    paddingTop: 10,
    minHeight: 100,
  },
  submitActivityButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: "#007AFF",
  },
  submitActivityButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
