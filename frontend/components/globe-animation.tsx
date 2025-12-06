import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

export function GlobeAnimation() {
  const rotation = useRef(new Animated.Value(0)).current;
  const primaryColor = useThemeColor({}, "tint");

  useEffect(() => {
    // Create infinite rotating animation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 20000, // 20 seconds for full rotation
        useNativeDriver: true,
      })
    ).start();
  }, [rotation]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  return (
    <View
      style={{ alignItems: "center", justifyContent: "center", height: 200 }}
    >
      <Animated.View style={[{ width: 150, height: 150 }, animatedStyle]}>
        {/* Simple SVG-style globe using circles */}
        <View
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            borderWidth: 2,
            borderColor: primaryColor,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(100, 150, 255, 0.1)",
          }}
        >
          {/* Equator line */}
          <View
            style={{
              position: "absolute",
              width: "80%",
              height: 1.5,
              backgroundColor: primaryColor,
              opacity: 0.5,
            }}
          />
          {/* Prime meridian */}
          <View
            style={{
              position: "absolute",
              width: 1.5,
              height: "60%",
              backgroundColor: primaryColor,
              opacity: 0.3,
            }}
          />
          {/* Globe center dot */}
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: primaryColor,
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
}
