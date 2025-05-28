import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  useEffect(() => {
    loadLastEmail();
  }, []);

  const loadLastEmail = async () => {
    try {
      const lastEmail = await AsyncStorage.getItem('lastEmail');
      if (lastEmail) {
        setForm(prev => ({ ...prev, email: lastEmail }));
        console.log('Last email:', lastEmail);
      }
    } catch (error) {
      console.error('Failed to load last email:', error);
    }
  };

  const saveLastEmail = async (email) => {
    try {
      await AsyncStorage.setItem('lastEmail', email);
    } catch (error) {
      console.error('Failed to save last email:', error);
    }
  };

  const handleSubmit = async () => {
    if (!form.email?.trim() || !form.password?.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with:', { email: form.email, password: form.password });
      const response = await authAPI.login({
        email: form.email.trim(),
        password: form.password.trim()
      });
      
      console.log('Login response:', response);
      
      if (response.token) {
        // Save the email before proceeding with login
        await saveLastEmail(form.email.trim());
        
        // Store user data in auth context
        const success = await login(response);
        if (!success) {
          throw new Error('Failed to store user data');
        }

        // Navigate based on user role
        if (response.user?.role === 'admin') {
          navigation.replace('AdminDashboard');
        } else {
          navigation.replace('Main');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#f3f4f6', '#e0f2fe', '#d1fae5']}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Icon name="log-in" size={32} color="#1e40af" />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="username"
                  autoCorrect={false}
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  value={form.password}
                  onChangeText={(text) => setForm({ ...form, password: text })}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default LoginScreen; 