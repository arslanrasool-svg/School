import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, FAB } from 'react-native-paper';
import { colors } from '../../config/theme';

export default function HomeworkScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Homework Assignments</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>Create and manage homework</Text>
      <FAB
        style={styles.fab}
        icon="plus"
        label="New Homework"
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
