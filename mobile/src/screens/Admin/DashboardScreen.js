import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { colors } from '../../config/theme';

export default function AdminDashboard() {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Admin Dashboard</Title>
          <Paragraph>Manage users, classes, and view analytics.</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>School Statistics</Title>
          <Paragraph>Total Students: 0</Paragraph>
          <Paragraph>Total Teachers: 0</Paragraph>
          <Paragraph>Total Classes: 0</Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
});
