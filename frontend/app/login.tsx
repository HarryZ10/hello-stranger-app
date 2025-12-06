import { useState } from "react";
import {
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import { authService } from "@/src/api/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const colorScheme = useColorScheme();
  const router = useRouter();
  const tintColor = Colors[(colorScheme ?? "light") as "light" | "dark"].tint;
  const textColor = Colors[(colorScheme ?? "light") as "light" | "dark"].text;
  const placeholderColor =
    Colors[(colorScheme ?? "light") as "light" | "dark"].tabIconDefault;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    const response = await authService.login({
      email,
      password,
    });

    setLoading(false);

    if (response.data?.access) {
      Alert.alert("Success", "Logged in!");
      router.replace("/(tabs)/map");
    } else {
      Alert.alert(
        "Login Failed",
        (response.error as string) || "Invalid credentials"
      );
      console.log("Login error:", response);
    }
  };

  const handleRegister = async () => {
    if (
      !email ||
      !username ||
      !password ||
      !passwordConfirm ||
      !firstName ||
      !lastName
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    setLoading(true);
    const response = await authService.register({
      email,
      username,
      password,
      password_confirm: passwordConfirm,
      first_name: firstName,
      last_name: lastName,
      display_name: `${firstName} ${lastName}`,
    });

    setLoading(false);

    if (response.statusCode === 201) {
      Alert.alert("Success", "Account created! Please log in.");
      setIsLogin(true);
      setPassword("");
      setPasswordConfirm("");
      setEmail("");
      setUsername("");
      setFirstName("");
      setLastName("");
    } else {
      // Format error message from response.error object
      let errorMessage = "Something went wrong";
      if (response.error) {
        if (typeof response.error === "string") {
          errorMessage = response.error;
        } else if (typeof response.error === "object") {
          // Handle field errors like {"email": ["already exists"], "username": ["already exists"]}
          const errors = Object.values(response.error).flat();
          errorMessage = errors.join(", ") || "Something went wrong";
        }
      }
      Alert.alert("Registration Failed", errorMessage);
      console.log("Register error:", response);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: tintColor,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: textColor,
  };

  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 40 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText
          style={{
            fontSize: 32,
            fontWeight: "bold",
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          {isLogin ? "Login" : "Sign Up"}
        </ThemedText>

        {/* Signup Only Fields */}
        {!isLogin && (
          <>
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={inputStyle}
              placeholderTextColor={placeholderColor}
            />
            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={inputStyle}
              placeholderTextColor={placeholderColor}
            />
            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={inputStyle}
              placeholderTextColor={placeholderColor}
            />
          </>
        )}

        {/* Common Fields */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={inputStyle}
          placeholderTextColor={placeholderColor}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={inputStyle}
          placeholderTextColor={placeholderColor}
        />

        {/* Confirm Password for Signup */}
        {!isLogin && (
          <TextInput
            placeholder="Confirm Password"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            style={inputStyle}
            placeholderTextColor={placeholderColor}
          />
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={isLogin ? handleLogin : handleRegister}
          disabled={loading}
          style={{
            backgroundColor: tintColor,
            padding: 16,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 16,
            marginTop: 20,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText
              style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
            >
              {isLogin ? "Login" : "Sign Up"}
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* Toggle Between Login and Signup */}
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <ThemedText style={{ textAlign: "center", color: tintColor }}>
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}
