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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { getCategoryStyle } from '../../utils/goalUtils';

const GoalCreateScreen = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    dueDate: '',
    steps: [''],
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }

    setLoading(true);
    const stepsArr = form.steps
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      // TODO: Implement API call
      // const token = await AsyncStorage.getItem('token');
      // await axios.post(
      //   '/goals',
      //   {
      //     name: form.name,
      //     description: form.description,
      //     category: form.category,
      //     steps: stepsArr,
      //     dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      //   },
      //   {
      //     headers: { Authorization: `Bearer ${token}` },
      //   }
      // );
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigation.navigate('GoalsList');
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to create goal'
      );
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
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Goal Name</Text>
              <TextInput
                style={styles.input}
                placeholder="For example: Read 20 books"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
            </View>

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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {Object.keys(getCategoryStyle).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      form.category === category && styles.categoryButtonActive,
                      getCategoryStyle(category),
                    ]}
                    onPress={() => setForm({ ...form, category })}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        form.category === category && styles.categoryButtonTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {form.dueDate ? new Date(form.dueDate).toLocaleDateString() : 'Select a date'}
                </Text>
                <Icon name="calendar" size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>

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
              <TouchableOpacity
                style={styles.addStepButton}
                onPress={handleAddStep}
              >
                <Icon name="plus" size={20} color="#3b82f6" />
                <Text style={styles.addStepButtonText}>Add Step</Text>
              </TouchableOpacity>
            </View>

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

      {showDatePicker && (
        <DateTimePicker
          value={form.dueDate ? new Date(form.dueDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setForm({ ...form, dueDate: selectedDate.toISOString() });
            }
          }}
        />
      )}
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#3b82f6',
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
});

export default GoalCreateScreen; 