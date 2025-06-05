import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { getCategoryStyle, getStatusStyle, getStatusText } from '../../utils/goalUtils';
import { goalsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const GoalsListScreen = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id;

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await goalsAPI.getGoals();
      // В некоторых случаях res может быть {data: [...]} или просто массив
      const apiGoals = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      console.log('API goals:', apiGoals);
      console.log('Current user:', currentUserId);

      const goalsArr = apiGoals
        .filter(goal => goal.user_id === currentUserId)
        .map(goal => ({
          id: goal.id,
          name: goal.name,
          description: goal.description,
          category: goal.category,
          status: goal.status || 'not_started',
          dueDate: (goal.due_date && goal.due_date !== '0001-01-01T00:00:00Z') ? goal.due_date : null,
          steps: Array.isArray(goal.steps) ? goal.steps.map(s => s.title) : [],
        }));

      console.log('Goals for FlatList:', goalsArr);
      setGoals(goalsArr);
    } catch (err) {
      setGoals([]);
      console.log('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderGoalCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('GoalDetail', { id: item.id })}
      style={styles.goalCard}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.goalName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.category && (
            <View style={[styles.categoryBadge, getCategoryStyle(item.category)]}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.dateStatusContainer}>
          {item.dueDate && (
            <View style={styles.dateBadge}>
              <Icon name="calendar" size={12} color="#666" />
              <Text style={styles.dateText}>
                {new Date(item.dueDate).toLocaleDateString()}
              </Text>
            </View>
          )}
          {item.status && (
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>
                {getStatusText(item.status)}
              </Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        {Array.isArray(item.steps) && item.steps.length > 0 && (
          <View style={styles.stepsContainer}>
            {item.steps.slice(0, 3).map((step, i) => (
              <View key={i} style={styles.stepBadge}>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            {item.steps.length > 3 && (
              <View style={styles.moreStepsBadge}>
                <Text style={styles.moreStepsText}>
                  +{item.steps.length - 3} steps
                </Text>
              </View>
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f3f4f6', '#e0f2fe', '#d1fae5']}
        style={styles.background}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Goals</Text>
          <Text style={styles.subtitle}>Your personal goals and achievements</Text>
        </View>

        <TouchableOpacity
          style={styles.newGoalButton}
          onPress={() => navigation.navigate('GoalCreate')}
        >
          <Icon name="plus" size={20} color="#fff" />
          <Text style={styles.newGoalButtonText}>New Goal</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading goals...</Text>
          </View>
        ) : goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You don't have any goals yet.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('GoalCreate')}
              style={styles.createFirstButton}
            >
              <Text style={styles.createFirstButtonText}>
                Create your first goal
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={goals}
            renderItem={renderGoalCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  newGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 12,
    margin: 20,
    marginTop: 0,
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
  newGoalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContainer: {
    padding: 20,
  },
  goalCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
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
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  moreStepsBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreStepsText: {
    fontSize: 12,
    color: '#9ca3af',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  createFirstButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default GoalsListScreen; 