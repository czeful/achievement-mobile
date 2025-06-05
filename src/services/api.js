import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your computer's IP address instead of localhost
// const API_URL = 'http://192.168.10.230:8080';
const API_URL = 'http://192.168.8.38:8080';

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

  // Get another user's profile
  getUserProfile: async (userId) => {
    try {
      console.log('Fetching another user profile:', userId);
      const token = await AsyncStorage.getItem('token');
      const response = await api.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
  /**
   * Получить список целей с meta
   * @returns {Promise<{data: Goal[], meta: {total: number, page: number, per_page: number}}>} 
   */
  getGoals: async (params = {}) => {
    try {
      // params: { page, per_page, ... }
      const response = await api.get('/goals', { params });
      // Возвращаем data и meta согласно контракту
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Failed to fetch goals',
        status: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /**
   * Создать цель
   * @param {CreateGoalRequest} goalData
   * @returns {Promise<{data: Goal, message: string}>}
   */
  createGoal: async (goalData) => {
    try {
      const response = await api.post('/goals', goalData);
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Failed to create goal',
        status: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /**
   * Получить детали цели
   * @param {number} goalId
   * @returns {Promise<{data: Goal}>}
   */
  getGoal: async (goalId) => {
    try {
      const response = await api.get(`/goals/${goalId}`);
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Failed to fetch goal',
        status: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /**
   * Обновить цель
   * @param {number} goalId
   * @param {UpdateGoalRequest} goalData
   * @returns {Promise<{data: Goal, message: string}>}
   */
  updateGoal: async (goalId, goalData) => {
    try {
      const response = await api.put(`/goals/${goalId}`, goalData);
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Failed to update goal',
        status: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /**
   * Удалить цель
   * @param {number} goalId
   * @returns {Promise<{message: string}>}
   */
  deleteGoal: async (goalId) => {
    try {
      const response = await api.delete(`/goals/${goalId}`);
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Failed to delete goal',
        status: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /**
   * Обновить статус шага цели
   * @param {number} goalId
   * @param {string} stepTitle - название шага
   * @param {'pending'|'completed'} status
   * @returns {Promise<{data: GoalStep, message: string}>}
   */
  updateGoalStepStatus: async (goalId, stepTitle, status) => {
    try {
      const response = await api.patch(`/goals/${goalId}/progress`, {
        step: stepTitle,
        done: status === 'completed'
      });
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Failed to update step status',
        status: error.response?.status,
        data: error.response?.data
      };
    }
  },
};

// Типы для справки (можно вынести в отдельный файл):
/**
interface Goal {
  id: number;
  name: string;
  category: string;
  description: string;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  user_id: number;
  steps: GoalStep[];
  collaborators: GoalCollaborator[];
}
interface GoalStep {
  id: number;
  goal_id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  order: number;
  created_at: string;
  updated_at: string;
}
interface GoalCollaborator {
  id: number;
  goal_id: number;
  user_id: number;
  role: 'viewer' | 'editor';
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}
interface CreateGoalRequest {
  name: string;
  category: string;
  description: string;
  due_date: string;
  steps: { title: string; description: string; order: number }[];
  collaborators?: { user_id: number; role: 'viewer' | 'editor' }[];
}
interface UpdateGoalRequest {
  name?: string;
  category?: string;
  description?: string;
  due_date?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  steps?: { id?: number; title: string; description: string; status?: 'pending' | 'completed'; order: number }[];
  collaborators?: { user_id: number; role: 'viewer' | 'editor' }[];
}
*/

export default api; 