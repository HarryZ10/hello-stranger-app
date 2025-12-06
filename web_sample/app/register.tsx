import { theme } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { FontAwesome } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { register, isLoading, error, clearError } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    console.log('Register button clicked');
    
    if (!username.trim() || !email.trim() || !password.trim()) {
      if (Platform.OS === 'web') {
        alert('Please fill in all fields');
      } else {
        Alert.alert('Error', 'Please fill in all fields');
      }
      return;
    }

    if (password !== confirmPassword) {
      if (Platform.OS === 'web') {
        alert('Passwords do not match');
      } else {
        Alert.alert('Error', 'Passwords do not match');
      }
      return;
    }

    if (password.length < 8) {
      if (Platform.OS === 'web') {
        alert('Password must be at least 8 characters');
      } else {
        Alert.alert('Error', 'Password must be at least 8 characters');
      }
      return;
    }

    try {
      console.log('Attempting to register:', { username: username.trim(), email: email.trim() });
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      console.log('Registration successful');
      
      if (Platform.OS === 'web') {
        alert('Account created! Please sign in.');
        router.replace('/login');
      } else {
        Alert.alert('Success', 'Account created! Please sign in.', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      // Error is handled by the auth store and displayed in the error container
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.background.dark
              : theme.colors.background.light,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <FontAwesome name="map-marker" size={48} color={theme.colors.primary} />
          </View>
          <Text
            style={[
              styles.title,
              { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
            ]}
          >
            Create Account
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: isDark
                  ? theme.colors.text.muted.dark
                  : theme.colors.text.muted.light,
              },
            ]}
          >
            Join and discover activities nearby
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <FontAwesome name="exclamation-circle" size={16} color={theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <FontAwesome name="times" size={16} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
              ]}
            >
              Username
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                  borderColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[200],
                },
              ]}
            >
              <FontAwesome
                name="user"
                size={18}
                color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
              />
              <TextInput
                style={[
                  styles.input,
                  { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
                ]}
                placeholder="username"
                placeholderTextColor={
                  isDark ? theme.colors.gray[500] : theme.colors.gray[400]
                }
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
              ]}
            >
              Email
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                  borderColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[200],
                },
              ]}
            >
              <FontAwesome
                name="envelope"
                size={18}
                color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
              />
              <TextInput
                style={[
                  styles.input,
                  { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
                ]}
                placeholder="your@email.com"
                placeholderTextColor={
                  isDark ? theme.colors.gray[500] : theme.colors.gray[400]
                }
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
              ]}
            >
              Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                  borderColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[200],
                },
              ]}
            >
              <FontAwesome
                name="lock"
                size={18}
                color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
              />
              <TextInput
                style={[
                  styles.input,
                  { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
                ]}
                placeholder="••••••••"
                placeholderTextColor={
                  isDark ? theme.colors.gray[500] : theme.colors.gray[400]
                }
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={18}
                  color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
              ]}
            >
              Confirm Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                  borderColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[200],
                },
              ]}
            >
              <FontAwesome
                name="lock"
                size={18}
                color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
              />
              <TextInput
                style={[
                  styles.input,
                  { color: isDark ? theme.colors.text.dark : theme.colors.text.light },
                ]}
                placeholder="••••••••"
                placeholderTextColor={
                  isDark ? theme.colors.gray[500] : theme.colors.gray[400]
                }
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={{
              color: isDark
                ? theme.colors.text.muted.dark
                : theme.colors.text.muted.light,
            }}
          >
            Already have an account?{' '}
          </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.error}20`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  errorText: {
    flex: 1,
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginTop: theme.spacing.md,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
      userSelect: 'none' as any,
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed' as any,
    }),
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
