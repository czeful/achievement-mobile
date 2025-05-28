import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your computer's IP address instead of localhost
const API_URL = 'http://192.168.10.230:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  async (config) => {
    console.log('Making API request:', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    try {
      console.log('Register API call with data:', {
        username: userData.username,
        email: userData.email
      });
      
      const response = await api.post('/users/register', {
        username: userData.username,
        email: userData.email,
        hashed_password: userData.password,
      });
      
      console.log('Register API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Register API error details:', {
        error: error,
        response: error.response,
        request: error.request,
        config: error.config
      });
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw {
          message: error.response.data.message || 'Registration failed',
          status: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        // The request was made but no response was received
        throw {
          message: 'No response from server. Please check your internet connection.',
          status: 0
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        throw {
          message: error.message || 'Error setting up the request',
          status: 0
        };
      }
    }
  },

  login: async (credentials) => {
    try {
      console.log('Login API call with email:', credentials.email);
      
      const response = await api.post('/users/login', {
        email: credentials.email,
        password: credentials.password,
      });
      
      console.log('Login API response:', {
        userId: response.data.user?.id,
        role: response.data.user?.role
      });
      
      // Store token and user data
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Login API error details:', {
        error: error,
        response: error.response,
        request: error.request,
        config: error.config
      });
      
      if (error.response) {
        throw {
          message: error.response.data.message || 'Login failed',
          status: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        throw {
          message: 'No response from server. Please check your internet connection.',
          status: 0
        };
      } else {
        throw {
          message: error.message || 'Error setting up the request',
          status: 0
        };
      }
    }
  },

  logout: async () => {
    try {
      console.log('Logging out user...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
};

export const friendsAPI = {
  // Send friend request
  sendFriendRequest: async (userId) => {
    try {
      console.log('Sending friend request to user:', userId);
      const response = await api.post(`/friends/${userId}/request`);
      console.log('Friend request sent successfully');
      return response.data;
    } catch (error) {
      console.error('Send friend request error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to send friend request',
        status: error.response?.status
      };
    }
  },

  // Get incoming friend requests
  getFriendRequests: async () => {
    try {
      console.log('Fetching friend requests');
      const response = await api.get('/friends/requests');
      console.log('Friend requests fetched:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Get friend requests error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch friend requests',
        status: error.response?.status
      };
    }
  },

  // Respond to friend request
  respondToFriendRequest: async (requestId, accept) => {
    try {
      console.log('Responding to friend request:', { requestId, accept });
      const response = await api.post(`/friends/requests/${requestId}/respond`, {
        accept
      });
      console.log('Friend request response sent successfully');
      return response.data;
    } catch (error) {
      console.error('Respond to friend request error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to respond to friend request',
        status: error.response?.status
      };
    }
  },

  // Get friends list
  getFriends: async () => {
    try {
      console.log('Fetching friends list');
      const response = await api.get('/friends');
      console.log('Friends list fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get friends error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch friends list',
        status: error.response?.status
      };
    }
  },

  // Remove friend
  removeFriend: async (friendId) => {
    try {
      console.log('Removing friend:', friendId);
      await api.delete(`/friends/${friendId}`);
      console.log('Friend removed successfully');
      return true;
    } catch (error) {
      console.error('Remove friend error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to remove friend',
        status: error.response?.status
      };
    }
  }
};

export const userAPI = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      console.log('Fetching user profile:', userId);
      const response = await api.get(`/users/${userId}`);
      console.log('User profile fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch user profile',
        status: error.response?.status
      };
    }
  },

  // Update user profile
  updateProfile: async (userId, data) => {
    try {
      console.log('Updating user profile:', { userId, data });
      const response = await api.put(`/users/${userId}`, data);
      console.log('User profile updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to update user profile',
        status: error.response?.status
      };
    }
  },
};

export const goalsAPI = {
  // Create goal
  createGoal: async (goalData) => {
    try {
      console.log('Creating goal:', goalData);
      const response = await api.post('/goals', goalData);
      console.log('Goal created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create goal error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to create goal',
        status: error.response?.status
      };
    }
  },

  // Get goal
  getGoal: async (goalId) => {
    try {
      console.log('Fetching goal:', goalId);
      const response = await api.get(`/goals/${goalId}`);
      console.log('Goal fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get goal error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch goal',
        status: error.response?.status
      };
    }
  },

  // Update goal
  updateGoal: async (goalId, goalData) => {
    try {
      console.log('Updating goal:', { goalId, goalData });
      const response = await api.put(`/goals/${goalId}`, goalData);
      console.log('Goal updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update goal error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to update goal',
        status: error.response?.status
      };
    }
  },

  // Delete goal
  deleteGoal: async (goalId) => {
    try {
      console.log('Deleting goal:', goalId);
      await api.delete(`/goals/${goalId}`);
      console.log('Goal deleted successfully');
      return true;
    } catch (error) {
      console.error('Delete goal error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to delete goal',
        status: error.response?.status
      };
    }
  },

  // Update goal progress
  updateProgress: async (goalId, progressData) => {
    try {
      console.log('Updating goal progress:', { goalId, progressData });
      const response = await api.patch(`/goals/${goalId}/progress`, progressData);
      console.log('Goal progress updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update goal progress error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to update goal progress',
        status: error.response?.status
      };
    }
  },

  // Get goal progress
  getProgress: async (goalId) => {
    try {
      console.log('Fetching goal progress:', goalId);
      const response = await api.get(`/goals/${goalId}/progress`);
      console.log('Goal progress fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get goal progress error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch goal progress',
        status: error.response?.status
      };
    }
  },

  // Get all goals
  getGoals: async () => {
    try {
      console.log('Fetching all goals');
      const response = await api.get('/goals');
      console.log('Goals fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get goals error:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch goals',
        status: error.response?.status
      };
    }
  },
};

export default api; 