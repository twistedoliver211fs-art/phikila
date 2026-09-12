import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.name}>{user?.name || 'Admin'}</Text>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.card}>
          <Text style={styles.cardValue}>1,234</Text>
          <Text style={styles.cardLabel}>Students</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardValue}>86</Text>
          <Text style={styles.cardLabel}>Staff</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 16, color: '#888' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  card: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, flex: 1 },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  cardLabel: { fontSize: 12, color: '#888', marginTop: 4 },
});
