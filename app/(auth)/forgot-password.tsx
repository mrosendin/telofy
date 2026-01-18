import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { api } from '@/lib/api/client';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setIsLoading(true);

    try {
      await api.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to send reset email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-goalmax-bg">
        <View className="flex-1 px-6 pt-12 items-center justify-center">
          <View className="w-16 h-16 rounded-full bg-goalmax-accent/20 items-center justify-center mb-6">
            <Text className="text-3xl">✉️</Text>
          </View>
          <Text className="text-goalmax-text text-2xl font-bold mb-4 text-center">
            Check your email
          </Text>
          <Text className="text-goalmax-text-secondary text-center mb-8 px-4">
            We sent a password reset link to{'\n'}
            <Text className="text-goalmax-text font-medium">{email}</Text>
          </Text>
          <Pressable
            className="bg-goalmax-surface border border-goalmax-border rounded-xl py-4 px-8"
            onPress={() => router.replace('/(auth)/sign-in')}
          >
            <Text className="text-goalmax-text font-semibold">Back to Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-goalmax-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12">
          {/* Header */}
          <View className="items-center mb-12">
            <Text
              className="text-goalmax-accent text-5xl tracking-tight"
              style={{ fontStyle: 'italic', fontWeight: '300' }}
            >
              Goalmax
            </Text>
          </View>

          {/* Form */}
          <View className="mb-8">
            <Text className="text-goalmax-text text-2xl font-bold mb-4">
              Reset Password
            </Text>
            <Text className="text-goalmax-text-secondary mb-8">
              Enter your email and we'll send you a link to reset your password.
            </Text>

            <View className="mb-6">
              <Text className="text-goalmax-text-secondary text-sm mb-2">Email</Text>
              <TextInput
                className="text-goalmax-text p-4 rounded-xl bg-goalmax-surface border border-goalmax-border"
                style={{ textAlignVertical: 'center' }}
                placeholder="you@example.com"
                placeholderTextColor="#52525b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>

            <Pressable
              className={`rounded-xl py-4 items-center ${
                isLoading ? 'bg-goalmax-accent/50' : 'bg-goalmax-accent'
              }`}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#0a0a0b" />
              ) : (
                <Text className="text-goalmax-bg font-semibold text-lg">
                  Send Reset Link
                </Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View className="items-center">
            <Link href="/(auth)/sign-in" asChild>
              <Pressable>
                <Text className="text-goalmax-accent font-semibold">
                  ← Back to Sign In
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
