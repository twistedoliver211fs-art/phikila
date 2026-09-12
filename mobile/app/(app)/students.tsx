import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';

export default function StudentsScreen() {
  const [search, setSearch] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Students</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.search}
        placeholder="Search students..."
        placeholderTextColor="#666"
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No students yet</Text>
        <Text style={styles.emptySub}>Add your first student to get started</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  addButton: { backgroundColor: '#6366f1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  search: { backgroundColor: '#1e293b', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#888', fontSize: 18, fontWeight: '600' },
  emptySub: { color: '#666', marginTop: 8 },
});
