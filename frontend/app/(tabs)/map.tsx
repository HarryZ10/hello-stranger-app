import { BottomMenu } from "@/components/map/bottom-menu";
import { LocationSelector } from "@/components/map/location-selector";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLocation } from "@/hooks/use-location";
import { Pin, UserLocation } from "@/types/map";
import React, { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { activitiesService, ActivityCategory } from "@/src/api/activities";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Lazy load MapView only on native platforms
const MapView =
  Platform.OS !== "web" ? require("react-native-maps").default : null;
const Marker =
  Platform.OS !== "web" ? require("react-native-maps").Marker : null;

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { userLocation, loading, permissionDenied } = useLocation();

  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [joinedPins, setJoinedPins] = useState<Set<string>>(new Set());
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [activityForm, setActivityForm] = useState({
    activity: "",
    description: "",
    people: "",
    categoryId: null as number | null,
  });
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectingLocation, setSelectingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(
    null
  );
  const mapRef = useRef<any>(null);

  // Initialize sample pin when user location is available
  React.useEffect(() => {
    if (userLocation && pins.length === 0 && categories.length > 0) {
      // Find "Arts and Culture" category
      const artsCategory = categories.find(
        (c) => c.name.toLowerCase() === "arts and culture"
      ) || categories[0];
      
      setPins([
        {
          id: "pin-1",
          latitude: userLocation.latitude + 0.002,
          longitude: userLocation.longitude + 0.002,
          title: "Museum Tour",
          activity: "Museum Tour",
          description: "Join us on a group museum trip!",
          createdBy: "Alex Johnson",
          categoryId: artsCategory.id,
          categoryName: artsCategory.name,
          categoryColor: artsCategory.color,
          categoryIcon: artsCategory.icon,
        },
      ]);

      // Center map on user location
      if (mapRef.current && Platform.OS !== "web") {
        mapRef.current.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    }
  }, [userLocation, categories]);

  useEffect(() => {
    (async () => {
      const res = await activitiesService.getCategories();
      if (res.data?.results) {
        setCategories(res.data.results);
      }
    })();
  }, []);

  const handleSelectPin = (pin: Pin) => {
    setSelectedPin(pin);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: pin.latitude,
        longitude: pin.longitude,
        latitudeDelta: 0.007,
        longitudeDelta: 0.007,
      });
    }
  };

  const handleJoinPin = (pinId: string) => {
    const newJoinedPins = new Set(joinedPins);
    if (joinedPins.has(pinId)) {
      newJoinedPins.delete(pinId);
    } else {
      newJoinedPins.add(pinId);
    }
    setJoinedPins(newJoinedPins);
  };

  const handleLocationRegionChange = (region: any) => {
    if (selectingLocation) {
      setSelectedLocation({
        latitude: region.latitude,
        longitude: region.longitude,
      });
    }
  };

  const handleCancelLocationSelection = () => {
    setSelectingLocation(false);
    setSelectedLocation(null);
  };

  const handleConfirmLocationSelection = () => {
    setSelectingLocation(false);
    // Create the pin when location is confirmed
    if (selectedLocation && activityForm.activity) {
      const category = categories.find(
        (c) => c.id === (selectedCategoryId ?? activityForm.categoryId)
      );
      const newPin: Pin = {
        id: `pin-${Date.now()}`,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        title: activityForm.activity,
        activity: activityForm.activity,
        description: activityForm.description,
        createdByUser: true,
        categoryId: category?.id,
        categoryName: category?.name,
        categoryColor: category?.color,
        categoryIcon: category?.icon,
      };
      setPins([...pins, newPin]);
      setIsCreatingActivity(false);
      setActivityForm({ activity: "", description: "", people: "", categoryId: null });
      setSelectedCategoryId(null);
      setSelectedLocation(null);
    }
  };

  const handleRecenterMap = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.007,
        longitudeDelta: 0.007,
      });
    }
  };

  // Handle permission denied
  if (permissionDenied) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>
          Location permission is required to use the map
        </ThemedText>
      </View>
    );
  }

  // Handle loading
  if (loading || !userLocation) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color={Colors[(colorScheme ?? "light") as "light" | "dark"].tint}
        />
        <ThemedText style={styles.loadingText}>Loading map...</ThemedText>
      </View>
    );
  }

  // Loading state
  if (!MapView) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>
          Map not available on web
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Button */}
      <TouchableOpacity
        style={[
          styles.profileButton,
          { backgroundColor: Colors[colorScheme ?? "light"].tint },
        ]}
        onPress={() => router.push("/profile")}
      >
        <MaterialCommunityIcons name="account-circle" size={28} color="#fff" />
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        scrollEnabled
        zoomEnabled
        pitchEnabled
        rotateEnabled
        onRegionChangeComplete={handleLocationRegionChange}
      >
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Your Location"
          description="This is where you are"
        />

        {pins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{
              latitude: pin.latitude,
              longitude: pin.longitude,
            }}
            title={pin.title}
            description={pin.activity}
            onPress={() => handleSelectPin(pin)}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: pin.categoryColor || "#8B5CF6",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 3,
                borderColor: "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              {pin.categoryIcon && (
                <ThemedText style={{ fontSize: 28 }}>
                  {pin.categoryIcon}
                </ThemedText>
              )}
            </View>
          </Marker>
        ))}

        {selectingLocation && selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Activity Location"
            pinColor="#007AFF"
          />
        )}
      </MapView>

      {/* Recenter Button */}
      <TouchableOpacity
        style={styles.recenterButton}
        onPress={handleRecenterMap}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Menu */}
      <BottomMenu
        selectedPin={selectedPin}
        isCreatingActivity={isCreatingActivity}
        selectingLocation={selectingLocation}
        pins={pins}
        joinedPins={joinedPins}
        colorScheme={colorScheme}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectPin={handleSelectPin}
        onJoinPin={handleJoinPin}
        onCreateActivityToggle={setIsCreatingActivity}
        onFormChange={setActivityForm}
        onSelectCategory={setSelectedCategoryId}
        onAddPin={(newPin: Pin) => {
          setPins([...pins, newPin]);
          setIsCreatingActivity(false);
          setActivityForm({ activity: "", description: "", people: "" });
          setSelectingLocation(false);
          setSelectedLocation(null);
        }}
        onSelectLocation={() => setSelectingLocation(true)}
        onDeselectPin={() => setSelectedPin(null)}
        activityForm={activityForm}
        selectedLocation={selectedLocation}
      />

      {/* Location Selection Overlay */}
      <LocationSelector
        isSelecting={selectingLocation}
        onCancel={handleCancelLocationSelection}
        onConfirm={handleConfirmLocationSelection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  recenterButton: {
    position: "absolute",
    bottom: 420,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 5,
  },
  profileButton: {
    position: "absolute",
    top: 60,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
});
