import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
  TextInput,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { GradientAvatar } from '../../components/GradientAvatar';
import { useAuth } from '../../context/AuthContext';
import { userAPI, friendsAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const MyProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [friends, setFriends] = useState([]);
  const [form, setForm] = useState({
    username: '',
    email: '',
  });
  const navigation = useNavigation();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    fetchProfile();
    fetchFriends();
  }, [currentUser]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching profile for user:', currentUser);
      if (currentUser?.id) {
        const userData = await userAPI.getProfile(currentUser.id);
        console.log('Received user data:', userData);
        
        if (!userData) {
          throw new Error('No user data received');
        }

        const userInfo = {
          Username: userData.username || userData.Username,
          Email: userData.email || userData.Email,
          Role: userData.role || userData.Role,
          _id: userData._id || userData.id || currentUser.id,
          CreatedAt: userData.created_at || userData.CreatedAt,
          friends: userData.friends || []
        };
        console.log('Processed user info:', userInfo);
        
        setUser(userInfo);
        setForm({
          username: userInfo.Username,
          email: userInfo.Email,
        });
      } else {
        console.log('No current user ID available');
        throw new Error('No user ID available');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const friendsData = await friendsAPI.getFriends();
      console.log('Friends list fetched:', friendsData);
      setFriends(friendsData || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!form.username.trim() || !form.email.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const updatedUser = await userAPI.updateProfile(user._id, form);
      const userInfo = {
        ...user,
        Username: updatedUser.username,
        Email: updatedUser.email,
      };
      setUser(userInfo);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  if (isLoading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Failed to load profile</Text>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={fetchProfile}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = d => d ? new Date(d).toLocaleDateString() : "-";

  const renderFriend = ({ item }) => (
    <View style={styles.friendItem}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.username}</Text>
        <Text style={styles.friendEmail}>{item.email}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#F3F4F6', '#EBF8FF', '#F0FDF4']}
        style={styles.gradient}
      >
        
        <View style={styles.content}>
        <Text style={styles.title}>My Profile</Text>
          <View style={styles.avatarContainer}>
            <GradientAvatar name={user?.Username || 'User'} style={styles.avatar} />
          </View>

          <View style={styles.profileCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}></Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditing(true)}
              >
                <Icon name="edit-2" size={22} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              {editing ? (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                      style={styles.input}
                      value={form.username}
                      onChangeText={(text) => setForm(prev => ({ ...prev, username: text }))}
                      placeholder="Enter username"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={form.email}
                      onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                      placeholder="Enter email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => {
                        setEditing(false);
                        setForm({
                          username: user.Username,
                          email: user.Email,
                        });
                      }}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton]}
                      onPress={handleUpdateProfile}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Save Changes</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.username}>{user?.Username || 'User'}</Text>
                  <Text style={styles.email}>{user?.Email || 'No email'}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                      {user?.Role?.toUpperCase() || "USER"}
                    </Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>User ID:</Text>
                <Text style={styles.infoValue}>
                  {user?._id || user?.id || currentUser?.id || 'Not available'}
                </Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Date of registration:</Text>
                <Text style={styles.infoValue}>{formatDate(user.CreatedAt)}</Text>
              </View>
            </View>

            <View style={styles.friendsContainer}>
              <View style={styles.friendsHeader}>
                <Icon name="users" size={22} color="#1D4ED8" />
                <Text style={styles.friendsTitle}>Friends</Text>
              </View>
              {friends.length > 0 ? (
                <FlatList
                  data={friends}
                  renderItem={renderFriend}
                  keyExtractor={item => item.id}
                  style={styles.friendsList}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.noFriendsText}>У вас пока нет друзей</Text>
              )}
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.findFriendsButton]}
                onPress={() => navigation.navigate('FindFriends')}
              >
                <Icon name="user-plus" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Find friends</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.templatesButton]}
                onPress={() => navigation.navigate('MyTemplates')}
              >
                <Icon name="file-text" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>My Templates</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Icon name="log-out" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: -48,
    zIndex: 2,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#fff',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    paddingTop: 32,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'left',
    marginTop: 0,
    marginBottom: 0,
    zIndex: 10,
  },
  editButton: {
    backgroundColor: '#E0E7FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    minWidth: width / 2 - 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1E3A8A',
  },
  friendsContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  friendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D4ED8',
    marginLeft: 8,
  },
  friendsList: {
    marginTop: 8,
  },
  friendItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
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
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  friendEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  noFriendsText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  findFriendsButton: {
    backgroundColor: '#10B981',
  },
  templatesButton: {
    backgroundColor: '#8B5CF6',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
  },
});

export default MyProfileScreen; 