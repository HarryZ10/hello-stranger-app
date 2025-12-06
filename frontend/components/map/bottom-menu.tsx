import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { Pin } from "@/types/map";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityCategory } from "@/src/api/activities";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";

interface BottomMenuProps {
  selectedPin: Pin | null;
  isCreatingActivity: boolean;
  selectingLocation: boolean;
  pins: Pin[];
  joinedPins: Set<string>;
  colorScheme: string | null | undefined;
  categories?: ActivityCategory[];
  selectedCategoryId?: number | null;
  onSelectPin: (pin: Pin) => void;
  onJoinPin: (pinId: string) => void;
  onCreateActivityToggle: (value: boolean) => void;
  onFormChange: (value: {
    activity: string;
    description: string;
    people: string;
  }) => void;
  onSelectCategory?: (categoryId: number | null) => void;
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
  categories = [],
  selectedCategoryId,
  onSelectPin,
  onJoinPin,
  onCreateActivityToggle,
  onFormChange,
  onSelectCategory,
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

          <View style={styles.titleContainer}>
            <ThemedText style={styles.pinDetailTitle}>
              {selectedPin.title}
            </ThemedText>
            {selectedPin.createdByUser && (
              <ThemedText style={styles.yourActivityText}>Your activity</ThemedText>
            )}
          </View>

          {!selectedPin.createdByUser && selectedPin.createdBy && (
            <ThemedText style={styles.createdByText}>
              Activity by: {selectedPin.createdBy}
            </ThemedText>
          )}

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

          {!selectedPin.createdByUser && (
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
          )}
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
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: pin.categoryColor || "#8B5CF6",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 4,
                    }}
                  >
                    {pin.categoryIcon ? (
                      <ThemedText style={{ fontSize: 18 }}>
                        {pin.categoryIcon}
                      </ThemedText>
                    ) : (
                      <MaterialCommunityIcons
                        name="account"
                        size={20}
                        color="#fff"
                      />
                    )}
                  </View>
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

              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Category:</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        selectedCategoryId === category.id &&
                          styles.categoryChipSelected,
                      ]}
                      onPress={() =>
                        onSelectCategory?.(
                          selectedCategoryId === category.id
                            ? null
                            : category.id
                        )
                      }
                    >
                      <View
                        style={[
                          styles.categoryColorDot,
                          { backgroundColor: category.color || "#007AFF" },
                        ]}
                      />
                      <ThemedText
                        style={[
                          styles.categoryChipText,
                          selectedCategoryId === category.id &&
                            styles.categoryChipTextSelected,
                        ]}
                      >
                        {category.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.submitActivityButton}
                onPress={() => {
                  if (activityForm.activity) {
                    onSelectLocation();
                  }
                }}
                disabled={!activityForm.activity}
              >
                <ThemedText style={styles.submitActivityButtonText}>
                  Select Location
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 16,
  },
  pinDetailTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  yourActivityText: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.7,
  },
  createdByText: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 12,
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
  categoryScroll: {
    marginVertical: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  categoryChipSelected: {
    borderColor: "#007AFF",
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  categoryColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoryChipTextSelected: {
    fontWeight: "600",
    color: "#007AFF",
  },
});
