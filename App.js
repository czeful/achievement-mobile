import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { navigationStyles } from './src/styles/navigation';
import Icon from 'react-native-vector-icons/Feather';

// Auth screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Main screens
import DashboardScreen from './src/screens/main/DashboardScreen';
import ChatScreen from './src/screens/main/ChatScreen';
import MyProfileScreen from './src/screens/main/MyProfileScreen';
import UserProfileScreen from './src/screens/main/UserProfileScreen';
// import MyTemplatesScreen from './src/screens/main/MyTemplatesScreen';

// Admin screens (stub)
const AdminDashboardScreen = () => <></>;

// Friends screens
import FriendsListScreen from './src/screens/friends/FriendsListScreen';
import FindFriendsScreen from './src/screens/friends/FindFriendsScreen';
import FriendRequestsScreen from './src/screens/friends/FriendRequestsScreen';

// Goals screens
import GoalsListScreen from './src/screens/goals/GoalsListScreen';
import GoalCreateScreen from './src/screens/goals/GoalCreateScreen';
import GoalDetailScreen from './src/screens/goals/GoalDetailScreen';

// Templates screens (stubs)
const TemplateListScreen = () => <></>;
const TemplateCreateScreen = () => <></>;
const TemplateDetailsScreen = () => <></>;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Goals') {
            iconName = 'target';
          } else if (route.name === 'Chat') {
            iconName = 'message-circle';
          } else if (route.name === 'MyProfile') {
            iconName = 'user';
          } else if (route.name === 'MyTemplates') {
            iconName = 'file-text';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Goals" component={GoalsListScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="MyProfile" component={MyProfileScreen} />
      {/* <Tab.Screen name="MyTemplates" component={MyTemplatesScreen} /> */}
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            headerStyle: navigationStyles.header,
            headerTitleStyle: navigationStyles.headerTitle,
          }}
        >
          {/* Auth */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />

          {/* Main */}
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />

          {/* Admin */}
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />

          {/* Friends */}
          <Stack.Screen name="FriendsList" component={FriendsListScreen} />
          <Stack.Screen name="FindFriends" component={FindFriendsScreen} />
          <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />

          {/* Goals */}
          <Stack.Screen name="GoalCreate" component={GoalCreateScreen} />
          <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />

          {/* Templates */}
          <Stack.Screen name="TemplateList" component={TemplateListScreen} />
          <Stack.Screen name="TemplateCreate" component={TemplateCreateScreen} />
          <Stack.Screen name="TemplateDetails" component={TemplateDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
