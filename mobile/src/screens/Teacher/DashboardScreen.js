import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import { colors } from '../../config/theme';
import apiClient from '../../config/api';

export default function TeacherDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const loadData = async () => {
    try {
      setRefreshing(true);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title>Welcome, Teacher!</Title>
          <Paragraph>Manage your classes, attendance, and homework assignments.</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <Button mode="contained" style={styles.actionButton} icon="clipboard-check">
            Mark Attendance
          </Button>
          <Button mode="contained" style={styles.actionButton} icon="book-plus">
            Assign Homework
          </Button>
          <Button mode="contained" style={styles.actionButton} icon="bullhorn">
            Post Announcement
          </Button>
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
  actionButton: {
    marginTop: 12,
  },
});
