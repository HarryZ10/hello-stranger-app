import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setPermissionDenied(true);
          setLoading(false);
          Alert.alert(
            "Permission Denied",
            "Location permission is required to show your location on the map."
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert("Error", "Failed to get your location. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { userLocation, loading, permissionDenied };
}
