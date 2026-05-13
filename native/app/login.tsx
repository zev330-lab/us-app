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
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') return 'Incorrect email or password.';
  if (code === 'auth/user-not-found') return 'No account found with this email.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Try again later.';
  if (code === 'auth/invalid-email') return 'Please enter a valid email.';
  return 'Something went wrong. Try again.';
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
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

        <View className="w-full max-w-xs space-y-4">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="rgba(245, 240, 235, 0.4)"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            className="px-5 py-4 rounded-2xl text-sm"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: '#F5F0EB',
            }}
          />

          <View style={{ height: 12 }} />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="rgba(245, 240, 235, 0.4)"
            secureTextEntry
            autoComplete="current-password"
            className="px-5 py-4 rounded-2xl text-sm"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: '#F5F0EB',
            }}
          />

          {error ? (
            <Text className="text-sm text-center mt-2" style={{ color: '#E8727A' }}>
              {error}
            </Text>
          ) : null}

          <View style={{ height: 8 }} />

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl items-center"
            style={({ pressed }) => ({
              backgroundColor: '#C9A96E',
              opacity: pressed || loading ? 0.85 : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#0F0F1E" />
            ) : (
              <Text className="text-sm font-medium" style={{ color: '#0F0F1E' }}>
                Enter
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push('/signup')}
            className="mt-4 items-center"
          >
            <Text className="text-xs" style={{ color: 'rgba(245, 240, 235, 0.5)' }}>
              New here? Create an account
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
