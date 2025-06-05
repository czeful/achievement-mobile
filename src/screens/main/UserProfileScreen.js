import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { userAPI, friendsAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserProfileScreen({ navigation, route }) {
  const userId = route.params?.userId;
  const [user, setUser] = useState(null);
  const [friendStatus, setFriendStatus] = useState('not_friend'); // 'friend', 'pending', 'not_friend'
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        // Debug: print token and userId
        const token = await AsyncStorage.getItem('token');
        console.log('DEBUG TOKEN:', token);
        console.log('DEBUG userId:', userId);
        if (userId) {
          const userData = await userAPI.getUserProfile(userId);
          console.log('Received user data:', userData);
          
          if (!userData) {
            throw new Error('No user data received');
          }

          const userInfo = {
            username: userData.username,
            email: userData.email,
            role: userData.role,
            id: userData.id || userData._id,
            created_at: userData.created_at,
            avatar: userData.avatar,
            bio: userData.bio,
            stats: userData.stats || {
              goals: 0,
              friends: 0,
              templates: 0
            }
          };
          console.log('Processed user info:', userInfo);
          
          setUser(userInfo);
          setFriendStatus(userData.friend_status || 'not_friend');
        } else {
          console.log('No user ID available');
          throw new Error('No user ID available');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.status === 403) {
          Alert.alert('Ошибка 403', 'Нет доступа к профилю. Проверьте токен или обратитесь к администратору.');
        } else {
          Alert.alert('Error', 'Failed to load profile: ' + error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleAddFriend = async () => {
    try {
      await friendsAPI.sendFriendRequest(userId);
      setFriendStatus('pending');
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await friendsAPI.removeFriend(userId);
      setFriendStatus('not_friend');
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Пользователь не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.avatar}
          source={{ uri: user.avatar || 'https://via.placeholder.com/150' }}
        />
        <Text style={styles.name}>{user.username || user.email}</Text>
        <Text style={styles.bio}>{user.bio || 'Нет описания'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.stats?.goals || 0}</Text>
          <Text style={styles.statLabel}>Goals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.stats?.friends || 0}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.stats?.templates || 0}</Text>
          <Text style={styles.statLabel}>Templates</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {friendStatus === 'not_friend' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAddFriend}
          >
            <Text style={styles.actionButtonText}>Add Friend</Text>
          </TouchableOpacity>
        )}
        {friendStatus === 'pending' && (
          <View style={[styles.actionButton, styles.pendingButton]}>
            <Text style={styles.actionButtonText}>Request Sent</Text>
          </View>
        )}
        {friendStatus === 'friend' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.removeButton]}
            onPress={handleRemoveFriend}
          >
            <Text style={styles.actionButtonText}>Remove Friend</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => navigation.navigate('Chat', { userId: user.id })}
        >
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>Completed goal: Learn React Native</Text>
          <Text style={styles.activityDate}>2 days ago</Text>
        </View>
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>Created new template</Text>
          <Text style={styles.activityDate}>1 week ago</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bio: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  messageButton: {
    backgroundColor: '#34C759',
  },
  pendingButton: {
    backgroundColor: '#FF9500',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  activityItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  activityText: {
    fontSize: 16,
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
}); 