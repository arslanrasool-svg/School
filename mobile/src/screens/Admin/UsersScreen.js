import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { colors } from '../../config/theme';

export default function UsersScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>User Management</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>Manage teachers and parents</Text>
      <FAB
        style={styles.fab}
        icon="plus"
        label="Add User"
        onPress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    marginBottom: 24,
    color: colors.textLight,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});
