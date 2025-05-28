import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

// Test user credentials
const TEST_USER = {
  email: 'test@1234.com',
  password: '1234',
  username: 'test'
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Load user data from AsyncStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setCurrentUser(parsedData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUser();
  }, []);

  const login = async (response) => {
    try {
      console.log('Storing user data in context:', response);
      
      // Extract user data from response
      const userData = {
        id: response.user.ID || response.user.id,
        email: response.user.Email || response.user.email,
        username: response.user.Username || response.user.username,
        role: response.user.role || '',
        token: response.token
      };

      // Store in AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      // Update context
      setCurrentUser(userData);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Failed to store user data:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      // Check if trying to register with test user email
      if (userData.email === TEST_USER.email) {
        return { 
          success: false, 
          message: 'This email is reserved for testing. Please use a different email.' 
        };
      }

      // Implement your registration API call here
      const response = await fetch('YOUR_API_ENDPOINT/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      currentUser,
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 