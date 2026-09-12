import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { PinPad } from '../components/PinPad';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePinComplete = async (pin: string) => {
    setLoading(true);
    const success = await signIn(pin);
    setLoading(false);

    if (success) {
      router.replace('/(app)');
    } else {
      Alert.alert('Invalid PIN', 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>◆</Text>
        <Text style={styles.title}>Decimal</Text>
        <Text style={styles.subtitle}>Enter your PIN to continue</Text>
      </View>
      <PinPad onComplete={handlePinComplete} loading={loading} />
      <Text style={styles.hint}>Default PIN: 1234</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 60 },
  logo: { fontSize: 48, color: '#6366f1', marginBottom: 8 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: 2 },
  subtitle: { fontSize: 16, color: '#888', marginTop: 8 },
  hint: { color: '#666', textAlign: 'center', marginTop: 20, fontSize: 12 },
});
