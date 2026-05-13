import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { useAuthContext } from '../src/context/AuthContext';

/**
 * Root route. Routes the user to the right screen based on their auth +
 * disclaimer + couple state. Same routing logic as the web app's App.tsx
 * conditional render, expressed as expo-router <Redirect>s.
 */
export default function Index() {
  const { user, userDoc, coupleId, loading } = useAuthContext();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#1A1A2E' }}>
        <Text style={{ color: 'rgba(245, 240, 235, 0.55)' }}>Loading…</Text>
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;
  if (!userDoc) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#1A1A2E' }}>
        <Text style={{ color: 'rgba(245, 240, 235, 0.55)' }}>Loading…</Text>
      </View>
    );
  }
  if (!userDoc.acceptedDisclaimer) return <Redirect href="/disclaimer" />;
  if (!coupleId) return <Redirect href="/pair" />;
  return <Redirect href="/dashboard" />;
}
