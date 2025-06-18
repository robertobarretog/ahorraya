import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import AddSubscriptionScreen from '../screens/AddSubscriptionScreen';
import EditSubscriptionScreen from '../screens/EditSubscriptionScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Main: undefined;
  Dashboard: undefined;
  AddSubscription: undefined;
  EditSubscription: { subscriptionId: number };
  Stats: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const getTabBarIcon = ({
  focused,
  color,
  size,
  route,
}: {
  focused: boolean;
  color: string;
  size: number;
  route: { name: string };
}) => {
  let iconName: keyof typeof Ionicons.glyphMap;

  if (route.name === 'Dashboard') {
    iconName = focused ? 'home' : 'home-outline';
  } else if (route.name === 'Stats') {
    iconName = focused ? 'stats-chart' : 'stats-chart-outline';
  } else if (route.name === 'Settings') {
    iconName = focused ? 'settings' : 'settings-outline';
  } else {
    iconName = 'ellipse';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          getTabBarIcon({ focused, color, size, route }),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Mis Suscripciones' }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ title: 'Estadísticas' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Configuración' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddSubscription"
          component={AddSubscriptionScreen}
          options={{
            title: 'Nueva Suscripción',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="EditSubscription"
          component={EditSubscriptionScreen}
          options={{
            title: 'Editar Suscripción',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
