import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { colors } from '../../config/theme';

export default function AttendanceScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Attendance Management</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>Mark student attendance here</Text>
      <Button mode="contained" style={styles.button}>Mark Today's Attendance</Button>
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
  button: {
    marginTop: 16,
  },
});
