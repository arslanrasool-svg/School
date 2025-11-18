import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar, Card } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../config/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { signOut } = useContext(AuthContext);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Avatar.Icon size={80} icon="account" style={styles.avatar} />
          <Text variant="headlineMedium" style={styles.name}>User Profile</Text>
          <Text variant="bodyMedium" style={styles.email}>Email will appear here</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Button mode="outlined" style={styles.button} icon="account-edit">
            Edit Profile
          </Button>
          <Button mode="outlined" style={styles.button} icon="bell">
            Notification Settings
          </Button>
          <Button mode="outlined" style={styles.button} icon="help-circle">
            Help & Support
          </Button>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleLogout} style={styles.logoutButton} icon="logout">
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
    color: colors.text,
  },
  email: {
    color: colors.textLight,
  },
  button: {
    marginTop: 12,
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: colors.error,
  },
});
