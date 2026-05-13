import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';

function authErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message === 'Please enter your name.') return err.message;
  const code = (err as { code?: string }).code;
  if (code === 'auth/email-already-in-use') return 'An account already exists for this email.';
  if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
  if (code === 'auth/invalid-email') return 'Please enter a valid email.';
  return 'Something went wrong. Try again.';
}

export default function Signup() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await signup({ email, password, displayName });
      router.replace('/');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#0F0F1E' }}>
      <LinearGradient
        colors={['#0F0F1E', '#1A1A2E', '#16213E']}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 items-center justify-center px-8"
      >
        <View className="mb-10 items-center">
          <Text
            className="text-7xl italic"
            style={{ color: '#F5F0EB', fontFamily: Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif' }}
          >
            Us
          </Text>
          <Text
            className="mt-3 text-xs uppercase"
            style={{ color: 'rgba(245, 240, 235, 0.4)', letterSpacing: 3 }}
          >
            Just the two of you
          </Text>
        </View>

        <View className="w-full max-w-xs">
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor="rgba(245, 240, 235, 0.4)"
            autoComplete="name"
            className="px-5 py-4 rounded-2xl text-sm mb-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: '#F5F0EB',
            }}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="rgba(245, 240, 235, 0.4)"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            className="px-5 py-4 rounded-2xl text-sm mb-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: '#F5F0EB',
            }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Choose a password"
            placeholderTextColor="rgba(245, 240, 235, 0.4)"
            secureTextEntry
            autoComplete="new-password"
            className="px-5 py-4 rounded-2xl text-sm mb-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: '#F5F0EB',
            }}
          />

          {error ? (
            <Text className="text-sm text-center mb-2" style={{ color: '#E8727A' }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl items-center mt-2"
            style={({ pressed }) => ({
              backgroundColor: '#C9A96E',
              opacity: pressed || loading ? 0.85 : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#0F0F1E" />
            ) : (
              <Text className="text-sm font-medium" style={{ color: '#0F0F1E' }}>
                Create account
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.replace('/login')}
            className="mt-4 items-center"
          >
            <Text className="text-xs" style={{ color: 'rgba(245, 240, 235, 0.5)' }}>
              Already have an account? Sign in
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
