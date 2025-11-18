import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../config/theme';

import ParentDashboard from '../screens/Parent/DashboardScreen';
import AttendanceScreen from '../screens/Parent/AttendanceScreen';
import HomeworkScreen from '../screens/Parent/HomeworkScreen';
import FeesScreen from '../screens/Parent/FeesScreen';
import ResultsScreen from '../screens/Parent/ResultsScreen';
import ChatScreen from '../screens/Shared/ChatScreen';
import ProfileScreen from '../screens/Shared/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function ParentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'Attendance') {
            iconName = 'clipboard-check';
          } else if (route.name === 'Homework') {
            iconName = 'book-open-variant';
          } else if (route.name === 'Fees') {
            iconName = 'currency-usd';
          } else if (route.name === 'Results') {
            iconName = 'chart-bar';
          } else if (route.name === 'Chat') {
            iconName = 'message';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={ParentDashboard} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Homework" component={HomeworkScreen} />
      <Tab.Screen name="Fees" component={FeesScreen} />
      <Tab.Screen name="Results" component={ResultsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
