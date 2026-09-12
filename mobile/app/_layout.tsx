import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConvexClientProvider } from './src/lib/convex';
import { AuthProvider } from './src/hooks/useAuth';

export default function RootLayout() {
  return (
    <ConvexClientProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </ConvexClientProvider>
  );
}
