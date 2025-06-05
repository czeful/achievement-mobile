import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { getCategoryStyle } from '../../utils/goalUtils';
import { goalsAPI } from '../../services/api';
import { generateSteps } from '../../services/ai';
import { Calendar } from 'react-native-calendars';

// Категории и стили (хардкод)
const CATEGORY_STYLES = {
  Health: { backgroundColor: '#dcfce7', color: '#059669' },
  Career: { backgroundColor: '#fef9c3', color: '#ca8a04' },
  Education: { backgroundColor: '#e0e7ff', color: '#4f46e5' },
  Personal: { backgroundColor: '#fce7f3', color: '#db2777' },
  Finance: { backgroundColor: '#dbeafe', color: '#2563eb' },
  Hobby: { backgroundColor: '#f3e8ff', color: '#9333ea' },
  Relationships: { backgroundColor: '#ffedd5', color: '#ea580c' },
};
const CATEGORIES = Object.keys(CATEGORY_STYLES);

const GoalCreateScreen = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    dueDate: '',
    steps: [''],
  });
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const navigation = useNavigation();

  const handleStepChange = (idx, value) => {
    const newSteps = [...form.steps];
    newSteps[idx] = value;
    setForm({ ...form, steps: newSteps });
  };

  const handleAddStep = () => {
    setForm({ ...form, steps: [...form.steps, ''] });
  };

  const handleRemoveStep = (idx) => {
    const newSteps = [...form.steps];
    newSteps.splice(idx, 1);
    setForm({ ...form, steps: newSteps });
  };

  const handleGenerate = async () => {
    if (!form.name.trim() || !form.category.trim() || !form.description.trim()) {
      setGenError('Пожалуйста, заполните все поля.');
      return;
    }
    setGenError('');
    setGenLoading(true);
    try {
      const generated = await generateSteps({
        name: form.name,
        category: form.category,
        description: form.description,
      });
      setForm({ ...form, steps: generated });
    } catch (err) {
      setGenError('Ошибка при генерации шагов. Попробуйте ещё раз.');
    } finally {
      setGenLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }
    setLoading(true);
    const stepsArr = form.steps
      .map((s, i) => ({
        title: s.trim(),
        description: '',
        order: i + 1,
      }))
      .filter(s => s.title.length > 0);
    try {
      await goalsAPI.createGoal({
        name: form.name,
        description: form.description,
        category: form.category,
        due_date: form.dueDate ? form.dueDate : null,
        steps: stepsArr,
      });
      navigation.navigate('GoalsList');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create goal');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#f3f4f6', '#e0f2fe', '#d1fae5']}
        style={styles.background}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Icon name="target" size={32} color="#1e40af" />
            <Text style={styles.title}>Create New Goal</Text>
          </View>

          <View style={styles.form}>
            {/* Goal Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Goal Name</Text>
              <TextInput
                style={styles.input}
                placeholder="For example: Read 20 books"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your goal..."
                multiline
                numberOfLines={4}
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={[
                  styles.categorySelectButton,
                  form.category
                    ? { backgroundColor: CATEGORY_STYLES[form.category].backgroundColor }
                    : {},
                ]}
                onPress={() => setCategoryModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categorySelectText,
                    form.category
                      ? { color: CATEGORY_STYLES[form.category].color }
                      : { color: '#6b7280' },
                  ]}
                >
                  {form.category ? form.category : 'Select category...'}
                </Text>
                <Icon
                  name="chevron-down"
                  size={20}
                  color={form.category ? CATEGORY_STYLES[form.category].color : '#6b7280'}
                />
              </TouchableOpacity>

              <Modal
                visible={categoryModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCategoryModalVisible(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setCategoryModalVisible(false)}
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
                          setForm({ ...form, category: cat });
                          setCategoryModalVisible(false);
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

              {form.category ? (
                <View
                  style={[
                    styles.categoryPreview,
                    { backgroundColor: CATEGORY_STYLES[form.category].backgroundColor },
                  ]}
                >
                  <Text
                    style={{ color: CATEGORY_STYLES[form.category].color, fontWeight: 'bold' }}
                  >
                    {form.category}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Due Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setDateModalVisible(true)}
              >
                <Text style={styles.dateButtonText}>
                  {form.dueDate
                    ? new Date(form.dueDate).toLocaleDateString()
                    : 'Select a date'}
                </Text>
                <Icon name="calendar" size={20} color="#3b82f6" />
              </TouchableOpacity>
              <Modal
                visible={dateModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDateModalVisible(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setDateModalVisible(false)}
                >
                  <View style={[styles.modalContent, { padding: 0, minWidth: undefined }]}> 
                    <Calendar
                      onDayPress={day => {
                        setForm({ ...form, dueDate: day.dateString });
                        setDateModalVisible(false);
                      }}
                      markedDates={form.dueDate ? { [form.dueDate.slice(0, 10)]: { selected: true, selectedColor: '#3B82F6' } } : {}}
                      current={form.dueDate ? form.dueDate.slice(0, 10) : undefined}
                      theme={{
                        backgroundColor: '#fff',
                        calendarBackground: '#fff',
                        textSectionTitleColor: '#1E3A8A',
                        selectedDayBackgroundColor: '#3B82F6',
                        selectedDayTextColor: '#fff',
                        todayTextColor: '#3B82F6',
                        dayTextColor: '#1E3A8A',
                        textDisabledColor: '#D1D5DB',
                        dotColor: '#3B82F6',
                        selectedDotColor: '#fff',
                        arrowColor: '#3B82F6',
                        monthTextColor: '#1E3A8A',
                        indicatorColor: '#3B82F6',
                        textDayFontWeight: '500',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: '600',
                        textDayFontSize: 16,
                        textMonthFontSize: 18,
                        textDayHeaderFontSize: 14,
                      }}
                      style={{ borderRadius: 16 }}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            {/* Steps */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Steps</Text>
              {form.steps.map((step, idx) => (
                <View key={idx} style={styles.stepContainer}>
                  <TextInput
                    style={[styles.input, styles.stepInput]}
                    placeholder={`Step ${idx + 1}`}
                    value={step}
                    onChangeText={(text) => handleStepChange(idx, text)}
                  />
                  <TouchableOpacity
                    style={styles.removeStepButton}
                    onPress={() => handleRemoveStep(idx)}
                  >
                    <Icon name="x" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addStepButton} onPress={handleAddStep}>
                <Icon name="plus" size={20} color="#3b82f6" />
                <Text style={styles.addStepButtonText}>Add Step</Text>
              </TouchableOpacity>
            </View>

            {/* Генерация шагов */}
            {genLoading && (
              <View style={styles.genLoaderContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.genLoaderText}>
                  Генерируем шаги для вашей цели...
                </Text>
              </View>
            )}
            {genError ? <Text style={styles.errorText}>{genError}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, genLoading && styles.submitButtonDisabled]}
              onPress={handleGenerate}
              disabled={genLoading}
            >
              <Text style={styles.submitButtonText}>
                {genLoading ? 'Генерация...' : 'Сгенерировать шаги через ИИ'}
              </Text>
            </TouchableOpacity>

            {/* Создание цели */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating...' : 'Create Goal'}
              </Text>
            </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginLeft: 12,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepInput: {
    flex: 1,
    marginRight: 8,
  },
  removeStepButton: {
    padding: 8,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginTop: 8,
  },
  addStepButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    marginLeft: 8,
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
  errorText: {
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'center',
  },
  genLoaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  genLoaderText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
    marginLeft: 12,
  },
  categoryPreview: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categorySelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  categorySelectText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    minWidth: 260,
    alignItems: 'stretch',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalCategoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalCategoryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoalCreateScreen;
