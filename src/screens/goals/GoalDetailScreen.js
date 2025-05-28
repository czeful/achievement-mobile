import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCategoryStyle, getStatusStyle, getStatusText } from '../../utils/goalUtils';

const GoalDetailScreen = () => {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  useEffect(() => {
    fetchGoal();
  }, [id]);

  const fetchGoal = async () => {
    try {
      // TODO: Implement API call
      // const token = await AsyncStorage.getItem('token');
      // const res = await axios.get(`/goals/${id}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // setGoal(res.data);
      
      // Temporary mock data
      setGoal({
        id: '1',
        name: 'Read 20 books',
        description: 'Read 20 books by the end of the year',
        category: 'Education',
        status: 'progress',
        dueDate: '2024-12-31T00:00:00.000Z',
        steps: [
          { id: '1', text: 'Choose books', completed: true },
          { id: '2', text: 'Set reading schedule', completed: false },
          { id: '3', text: 'Track progress', completed: false },
        ],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to load goal details');
    } finally {
      setLoading(false);
    }
  };

  const handleStepToggle = async (stepId) => {
    try {
      // TODO: Implement API call
      // const token = await AsyncStorage.getItem('token');
      // await axios.patch(
      //   `/goals/${id}/steps/${stepId}`,
      //   { completed: !goal.steps.find(s => s.id === stepId).completed },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      
      // Update local state
      setGoal(prev => ({
        ...prev,
        steps: prev.steps.map(step =>
          step.id === stepId ? { ...step, completed: !step.completed } : step
        ),
      }));
    } catch (err) {
      Alert.alert('Error', 'Failed to update step status');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      // TODO: Implement API call
      // const token = await AsyncStorage.getItem('token');
      // await axios.patch(
      //   `/goals/${id}`,
      //   { status: newStatus },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      
      // Update local state
      setGoal(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      Alert.alert('Error', 'Failed to update goal status');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading goal details...</Text>
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Goal not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#f3f4f6', '#e0f2fe', '#d1fae5']}
        style={styles.background}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#1e40af" />
            </TouchableOpacity>
            <Text style={styles.title}>{goal.name}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.categoryBadge, getCategoryStyle(goal.category)]}>
                <Text style={styles.categoryText}>{goal.category}</Text>
              </View>
              <View style={[styles.statusBadge, getStatusStyle(goal.status)]}>
                <Text style={styles.statusText}>
                  {getStatusText(goal.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>{goal.description}</Text>

            <View style={styles.dateContainer}>
              <Icon name="calendar" size={16} color="#6b7280" />
              <Text style={styles.dateText}>
                Due: {new Date(goal.dueDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.stepsContainer}>
              <Text style={styles.sectionTitle}>Steps</Text>
              {goal.steps.map((step) => (
                <TouchableOpacity
                  key={step.id}
                  style={styles.stepItem}
                  onPress={() => handleStepToggle(step.id)}
                >
                  <View style={[
                    styles.checkbox,
                    step.completed && styles.checkboxCompleted
                  ]}>
                    {step.completed && (
                      <Icon name="check" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={[
                    styles.stepText,
                    step.completed && styles.stepTextCompleted
                  ]}>
                    {step.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('GoalCreate', { edit: true, id })}
              >
                <Icon name="edit" size={20} color="#3b82f6" />
                <Text style={styles.actionButtonText}>Edit Goal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    'Delete Goal',
                    'Are you sure you want to delete this goal?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            // TODO: Implement API call
                            // const token = await AsyncStorage.getItem('token');
                            // await axios.delete(`/goals/${id}`, {
                            //   headers: { Authorization: `Bearer ${token}` },
                            // });
                            navigation.goBack();
                          } catch (err) {
                            Alert.alert('Error', 'Failed to delete goal');
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Icon name="trash-2" size={20} color="#ef4444" />
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  Delete Goal
                </Text>
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
  background: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    flex: 1,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 16,
    lineHeight: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#3b82f6',
  },
  stepText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
});

export default GoalDetailScreen; 