import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './src/context/AuthContext';
import { theme } from './src/config/theme';

import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import TeacherNavigator from './src/navigation/TeacherNavigator';
import ParentNavigator from './src/navigation/ParentNavigator';
import AdminNavigator from './src/navigation/AdminNavigator';
import SplashScreen from './src/screens/SplashScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const authContext = React.useMemo(
    () => ({
      signIn: async (token, role, user) => {
        try {
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('userRole', role);
          await AsyncStorage.setItem('userData', JSON.stringify(user));
          setUserToken(token);
          setUserRole(role);
        } catch (e) {
          console.error('Error saving auth data:', e);
        }
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userRole');
          await AsyncStorage.removeItem('userData');
          setUserToken(null);
          setUserRole(null);
        } catch (e) {
          console.error('Error removing auth data:', e);
        }
      },
      signUp: async (token, role, user) => {
        try {
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('userRole', role);
          await AsyncStorage.setItem('userData', JSON.stringify(user));
          setUserToken(token);
          setUserRole(role);
        } catch (e) {
          console.error('Error saving auth data:', e);
        }
      },
    }),
    []
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token, role;
      try {
        token = await AsyncStorage.getItem('userToken');
        role = await AsyncStorage.getItem('userRole');
      } catch (e) {
        console.error('Error reading auth data:', e);
      }
      setUserToken(token);
      setUserRole(role);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <PaperProvider theme={theme}>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken == null ? (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            ) : (
              <>
                {userRole === 'teacher' && (
                  <Stack.Screen name="TeacherHome" component={TeacherNavigator} />
                )}
                {userRole === 'parent' && (
                  <Stack.Screen name="ParentHome" component={ParentNavigator} />
                )}
                {userRole === 'admin' && (
                  <Stack.Screen name="AdminHome" component={AdminNavigator} />
                )}
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </PaperProvider>
  );
}
