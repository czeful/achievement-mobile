import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
  Modal,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  getCategoryStyle,
  getStatusStyle,
  getStatusText,
} from '../../utils/goalUtils';
import { goalsAPI, userAPI } from '../../services/api';

const CATEGORIES = [
  'Health',
  'Career',
  'Education',
  'Personal',
  'Finance',
  'Hobby',
  'Relationships',
];

const CATEGORY_STYLES = {
  Health: { backgroundColor: '#dcfce7', color: '#059669' },
  Career: { backgroundColor: '#fef9c3', color: '#ca8a04' },
  Education: { backgroundColor: '#e0e7ff', color: '#4f46e5' },
  Personal: { backgroundColor: '#fce7f3', color: '#db2777' },
  Finance: { backgroundColor: '#dbeafe', color: '#2563eb' },
  Hobby: { backgroundColor: '#f3e8ff', color: '#9333ea' },
  Relationships: { backgroundColor: '#ffedd5', color: '#ea580c' },
};

const CollaboratorAvatar = ({ name }) => (
  <View style={styles.avatarCircle}>
    <Text style={styles.avatarText}>{name?.[0]?.toUpperCase() || '?'}</Text>
  </View>
);

const CollaboratorInvite = ({ goalId, onInvite }) => {
  const [query, setQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await userAPI.searchUsers(query);
      setFoundUsers(res.data || []);
      if ((res.data || []).length === 0) setMessage('No users found.');
    } catch (e) {
      setMessage('Search error');
    }
    setLoading(false);
  };

  const handleInvite = async (userId) => {
    if (!userId || typeof userId !== 'string' || userId.length !== 24) {
      setMessage('Invalid user ID for invitation');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await goalsAPI.inviteCollaborator(goalId, userId);
      setMessage('Invited!');
      setFoundUsers([]);
      setQuery('');
      if (onInvite) onInvite();
    } catch (e) {
      setMessage(e?.response?.data || 'Invitation error');
    }
    setLoading(false);
  };

  return (
    <View style={styles.inviteContainer}>
      <View style={styles.inviteHeader}>
        <Icon name="users" size={20} color="#1D4ED8" />
        <Text style={styles.inviteTitle}>Invite a Friend</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search user by email or name"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={[styles.searchButton, (!query.trim() || loading) && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading || !query.trim()}
        >
          <Text style={styles.searchButtonText}>{loading ? '...' : 'Search'}</Text>
        </TouchableOpacity>
      </View>
      {message ? <Text style={styles.messageText}>{message}</Text> : null}
      <ScrollView style={styles.foundUsersList}>
        {foundUsers.map((user) => (
          <View key={user._id || user.id} style={styles.foundUserItem}>
            <Text style={styles.foundUserName}>
              {user.name || user.username || user.email}
            </Text>
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => handleInvite(user._id || user.id)}
              disabled={loading}
            >
              <Text style={styles.inviteButtonText}>Invite</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ProgressBar компонент
const ProgressBar = ({ stepsCompleted, totalSteps }) => {
  const percent = totalSteps === 0 ? 0 : Math.round((stepsCompleted / totalSteps) * 100);
  const progressText = `${stepsCompleted} из ${totalSteps} шагов (${percent}%)`;

  return (
    <View style={progressStyles.wrapper}>
      <LinearGradient
        colors={['#facc15', '#e5e7eb']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={progressStyles.outerContainer}
      >
        <View style={progressStyles.innerPadding}>
          <View style={progressStyles.progressWrapper}>
            <LinearGradient
              colors={['#facc15', '#fde047']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                progressStyles.progress,
                {
                  width: `${percent}%`,
                  borderTopRightRadius: percent >= 95 ? 14 : 8,
                  borderBottomRightRadius: percent >= 95 ? 14 : 8,
                },
              ]}
            />
          </View>
          <View style={progressStyles.textWrapper}>
            <Text style={progressStyles.progressText}>{progressText}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const progressStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    // padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  outerContainer: {
    height: 48,
    width: '100%',
    borderRadius: 14,
    // overflow: 'hidden',
  },
  innerPadding: {
    flex: 1,
    borderRadius: 10,
    margin: 6,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#fff',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.7,
    // shadowRadius: 8,
    // elevation: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  progressWrapper: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 1,
  },
  progress: {
    height: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    letterSpacing: 0.3,
  },
});

const GoalDetailScreen = () => {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [inviteValue, setInviteValue] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  useEffect(() => {
    fetchGoal();
  }, [id]);

  const fetchGoal = async () => {
    setLoading(true);
    try {
      const res = await goalsAPI.getGoal(id);
      const data = res.data?.data ?? res.data ?? res;
      if (!data) {
        setGoal(null);
        return;
      }
      const dueDate =
        data.due_date && data.due_date !== '0001-01-01T00:00:00Z'
          ? data.due_date
          : null;
      const steps = Array.isArray(data.steps)
        ? data.steps.map((step) => {
            const stepTitle = typeof step === 'string' ? step : step.title;
            return stepTitle;
          })
        : [];
      setGoal({
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        status: data.status,
        dueDate,
        steps,
        progress: data.progress || {},
        collaborators: Array.isArray(data.collaborators)
          ? data.collaborators
          : [],
      });
    } catch (err) {
      console.error('Goal detail error:', err);
      setGoal(null);
      Alert.alert('Error', 'Failed to load goal details');
    } finally {
      setLoading(false);
    }
  };

  // Progress calculation
  const getProgress = (steps) => {
    if (!steps?.length) return 0;
    const completed = steps.filter(step => goal.progress[step]).length;
    return Math.round((completed / steps.length) * 100);
  };

  // Edit mode handlers
  const startEdit = () => {
    setEditForm({
      name: goal.name,
      description: goal.description,
      category: goal.category,
      dueDate: goal.dueDate,
      steps: goal.steps || []
    });
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditForm(null);
  };

  const saveEdit = async () => {
    try {
      await goalsAPI.updateGoal(goal.id, {
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        due_date: editForm.dueDate,
        steps: editForm.steps
      });
      setEditMode(false);
      setEditForm(null);
      await fetchGoal();
    } catch (err) {
      console.error('Save edit error:', err);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  // Steps edit
  const addStep = () => {
    setEditForm(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  const removeStep = (idx) => {
    setEditForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== idx)
    }));
  };

  const changeStep = (idx, val) => {
    setEditForm(prev => {
      const steps = [...prev.steps];
      steps[idx] = val;
      return { ...prev, steps };
    });
  };

  // Collaborator invite (mock)
  const inviteCollaborator = () => {
    if (!inviteValue.trim()) return;
    setGoal(g => ({ ...g, collaborators: [...g.collaborators, inviteValue.trim()] }));
    setInviteValue('');
  };

  const handleStepToggle = async (stepTitle) => {
    try {
      if (!goal || !goal.steps) {
        Alert.alert('Error', 'Goal data is not available');
        return;
      }
      const step = goal.steps.find((s) => s === stepTitle);
      if (!step) {
        Alert.alert('Error', 'Step not found');
        return;
      }
      const newStatus = goal.progress[stepTitle] ? 'pending' : 'completed';
      await goalsAPI.updateGoalStepStatus(goal.id, stepTitle, newStatus);
      await fetchGoal();
    } catch (error) {
      console.error('Step toggle error:', error);
      Alert.alert('Error', 'Failed to update step status');
    }
  };

  const CategoryPicker = () => (
    <Modal
      visible={showCategoryPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCategoryPicker(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Выберите категорию</Text>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.modalCategoryItem,
                { backgroundColor: CATEGORY_STYLES[cat].backgroundColor },
              ]}
              onPress={() => {
                setEditForm(prev => ({ ...prev, category: cat }));
                setShowCategoryPicker(false);
              }}
            >
              <Text
                style={[
                  styles.modalCategoryText,
                  { color: CATEGORY_STYLES[cat].color },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const handleShare = async () => {
    if (!goal) return;
    try {
      await Share.share({
        title: goal.name,
        message: `${goal.name}\n\n${goal.description || ''}`,
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to share');
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

  const progress = getProgress(goal.steps);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#f3f4f6', '#e0f2fe', '#d1fae5']} style={styles.background}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#1e40af" />
            </TouchableOpacity>
            <Text style={styles.title}>{goal.name}</Text>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Icon name="share-2" size={22} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {/* Progress bar */}
            <ProgressBar
              stepsCompleted={goal.steps.filter(step => goal.progress[step]).length}
              totalSteps={goal.steps.length}
            />

            {/* Edit mode */}
            {editMode ? (
              <View>
                <TextInput 
                  style={styles.input} 
                  value={editForm.name} 
                  onChangeText={v => setEditForm(f => ({ ...f, name: v }))}
                  placeholder="Goal name"
                />
                <TextInput 
                  style={styles.input} 
                  value={editForm.description} 
                  onChangeText={v => setEditForm(f => ({ ...f, description: v }))}
                  placeholder="Description"
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.categoryPickerButton,
                    editForm.category && {
                      backgroundColor: CATEGORY_STYLES[editForm.category].backgroundColor,
                    }
                  ]}
                  onPress={() => setShowCategoryPicker(true)}
                >
                  <Text style={[
                    styles.categoryPickerButtonText,
                    editForm.category && {
                      color: CATEGORY_STYLES[editForm.category].color,
                    }
                  ]}>
                    {editForm.category || 'Select Category'}
                  </Text>
                  <Icon 
                    name="chevron-down" 
                    size={20} 
                    color={editForm.category ? CATEGORY_STYLES[editForm.category].color : '#6b7280'} 
                  />
                </TouchableOpacity>
                <CategoryPicker />
                <TextInput 
                  style={styles.input} 
                  value={editForm.dueDate || ''} 
                  onChangeText={v => setEditForm(f => ({ ...f, dueDate: v }))} 
                  placeholder="Due date (YYYY-MM-DD)"
                />
                <Text style={styles.sectionTitle}>Steps</Text>
                {editForm.steps.map((step, idx) => (
                  <View key={idx} style={styles.stepEditContainer}>
                    <TextInput 
                      style={[styles.input, { flex: 1 }]} 
                      value={step} 
                      onChangeText={v => changeStep(idx, v)}
                      placeholder={`Step ${idx + 1}`}
                    />
                    <TouchableOpacity 
                      onPress={() => removeStep(idx)} 
                      style={styles.removeStepButton}
                    >
                      <Icon name="x" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity 
                  onPress={addStep} 
                  style={styles.addStepBtn}
                >
                  <Icon name="plus" size={20} color="#3b82f6" />
                  <Text style={styles.addStepText}>Add Step</Text>
                </TouchableOpacity>
                <View style={styles.editActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#3b82f6', flex: 1 }]} 
                    onPress={saveEdit}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#e5e7eb', flex: 1, marginLeft: 8 }]} 
                    onPress={cancelEdit}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.cardHeader}>
                  {goal.category && (
                    <View style={[styles.categoryBadge, getCategoryStyle(goal.category)]}>
                      <Text style={styles.categoryText}>{goal.category}</Text>
                    </View>
                  )}
                  {goal.status && (
                    <View style={[styles.statusBadge, getStatusStyle(goal.status)]}>
                      <Text style={styles.statusText}>{getStatusText(goal.status)}</Text>
                    </View>
                  )}
                </View>
                {goal.description && <Text style={styles.description}>{goal.description}</Text>}
                {goal.dueDate && goal.dueDate !== '0001-01-01T00:00:00Z' && (
                  <View style={styles.dateContainer}>
                    <Icon name="calendar" size={16} color="#6b7280" />
                    <Text style={styles.dateText}>
                      Due: {new Date(goal.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                <View style={styles.stepsContainer}>
                  <Text style={styles.sectionTitle}>Steps & Progress</Text>
                  {(!goal.steps || goal.steps.length === 0) && (
                    <Text style={styles.noStepsText}>No steps yet</Text>
                  )}
                  {goal.steps.map((step) => (
                    <TouchableOpacity
                      key={step}
                      style={styles.stepItem}
                      onPress={() => handleStepToggle(step)}
                    >
                      <View style={[
                        styles.checkbox,
                        goal.progress[step] && styles.checkboxCompleted
                      ]}>
                        {goal.progress[step] && (
                          <Icon name="check" size={16} color="#fff" />
                        )}
                      </View>
                      <Text style={[
                        styles.stepText,
                        goal.progress[step] && styles.stepTextCompleted
                      ]}>
                        {step}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Collaborators */}
                <View style={styles.collabContainer}>
                  <Text style={styles.sectionTitle}>Collaborators</Text>
                  {Array.isArray(goal.collaborators) && goal.collaborators.length > 0 && (
                    <View style={styles.collabList}>
                      {goal.collaborators.map((collab, idx) => (
                        <View key={idx} style={styles.collabItem}>
                          <CollaboratorAvatar name={collab} />
                          <Text style={styles.collabText}>{collab}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <CollaboratorInvite goalId={goal.id} onInvite={fetchGoal} />
                </View>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity style={styles.actionButton} onPress={startEdit}>
                    <Icon name="edit" size={20} color="#3b82f6" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() =>
                      Alert.alert('Delete Goal', 'Really delete?', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await goalsAPI.deleteGoal(goal.id);
                              navigation.goBack();
                            } catch {
                              Alert.alert('Error', 'Failed to delete goal');
                            }
                          },
                        },
                      ])
                    }
                  >
                    <Icon name="trash-2" size={20} color="#ef4444" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  content: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { marginRight: 16 },
  title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: '#1e40af' },
  shareButton: { marginLeft: 8, padding: 6 },
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
      android: { elevation: 3 },
    }),
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  categoryBadge: { padding: 6, borderRadius: 8 },
  categoryText: { fontSize: 14, fontWeight: 'bold' },
  statusBadge: { padding: 6, borderRadius: 8 },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  description: { marginBottom: 16, fontSize: 16, color: '#4b5563', lineHeight: 24 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dateText: { marginLeft: 8, fontSize: 14, color: '#6b7280' },
  stepsContainer: { marginBottom: 24 },
  sectionTitle: { marginBottom: 16, fontSize: 18, fontWeight: 'bold', color: '#1e40af' },
  stepItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#3b82f6', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxCompleted: { backgroundColor: '#3b82f6' },
  stepText: { flex: 1, fontSize: 16, color: '#374151' },
  stepTextCompleted: { textDecorationLine: 'line-through', color: '#9ca3af' },
  collabContainer: { marginBottom: 24 },
  collabList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  collabItem: { backgroundColor: '#e0f2fe', padding: 6, borderRadius: 8, marginRight: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  collabText: { color: '#1e40af', fontWeight: '600' },
  inviteContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D4ED8',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  messageText: {
    marginTop: 8,
    color: '#3B82F6',
    fontSize: 14,
  },
  foundUsersList: {
    marginTop: 12,
    maxHeight: 200,
  },
  foundUserItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  foundUserName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  inviteButton: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 14,
  },
  noStepsText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontStyle: 'italic',
  },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: '#f3f4f6', marginHorizontal: 4 },
  actionButtonText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#3b82f6' },
  deleteButton: { backgroundColor: '#fee2e2' },
  deleteButtonText: { color: '#ef4444' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6b7280' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#ef4444' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', marginBottom: 12 },
  stepEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeStepButton: {
    marginLeft: 8,
    padding: 8,
  },
  addStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
  },
  addStepText: {
    color: '#3b82f6',
    marginLeft: 8,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: '#1e40af',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalCategoryItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalCategoryText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryPickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  categoryPickerButtonText: {
    fontSize: 16,
    color: '#374151',
  },
});

export default GoalDetailScreen;
