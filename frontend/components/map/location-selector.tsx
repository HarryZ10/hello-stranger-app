import { ThemedText } from "@/components/themed-text";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface LocationSelectorProps {
  isSelecting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LocationSelector({
  isSelecting,
  onCancel,
  onConfirm,
}: LocationSelectorProps) {
  if (!isSelecting) {
    return null;
  }

  return (
    <View style={styles.locationSelectionOverlay}>
      {/* Centered Target Crosshair */}
      <View style={styles.targetContainer}>
        <MaterialCommunityIcons name="crosshairs" size={60} color="#007AFF" />
        <ThemedText style={styles.targetLabel}>
          Drag map to select location
        </ThemedText>
      </View>

      {/* Cancel and Confirm Buttons */}
      <View style={styles.locationSelectionButtons}>
        <TouchableOpacity
          style={styles.locationCancelButton}
          onPress={onCancel}
        >
          <ThemedText style={styles.locationButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.locationConfirmButton}
          onPress={onConfirm}
        >
          <ThemedText style={styles.locationButtonText}>Confirm</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  locationSelectionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    pointerEvents: "box-none",
  },
  targetContainer: {
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    marginTop: 80,
  },
  targetLabel: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  locationSelectionButtons: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
  },
  locationCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    alignItems: "center",
  },
  locationConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center",
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
