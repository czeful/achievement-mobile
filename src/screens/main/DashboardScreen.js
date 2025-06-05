import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import mainAI from '../../services/main_ai';
import { goalsAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Calendar } from 'react-native-calendars';
import { format, parseISO, isSameMonth } from 'date-fns';
import PromotionBanners from '../../components/PromotionBanners';

const { width, height } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goals, setGoals] = useState([]);
  const [chatHistoryByGoalId, setChatHistoryByGoalId] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bannersVisible, setBannersVisible] = useState(false);

  // Получить user_id из AsyncStorage
  const fetchUserId = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      console.log('AsyncStorage user:', userStr);
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
        return user.id;
      }
    } catch (e) {
      console.log('Error reading user from AsyncStorage', e);
    }
    return null;
  };

  // Загрузить цели пользователя
  const fetchGoals = async () => {
    setGoalsLoading(true);
    try {
      const userId = await fetchUserId();
      const res = await goalsAPI.getGoals();
      const apiGoals = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      console.log('Fetched goals raw:', apiGoals);
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      // Последний день месяца
      const lastDay = new Date(year, month + 1, 0).getDate();
      const goalsArr = apiGoals
        .filter(goal => !userId || String(goal.user_id) === String(userId))
        .map(goal => {
          let dueDate = goal.due_date;
          let needsRandom = false;
          if (dueDate === '0001-01-01T00:00:00Z') needsRandom = true;
          else {
            try {
              const d = new Date(dueDate);
              if (d.getFullYear() < 2025) needsRandom = true;
            } catch {}
          }
          if (needsRandom) {
            // Случайный день до конца месяца
            const randomDay = Math.floor(Math.random() * (lastDay - today.getDate() + 1)) + today.getDate();
            const randomDate = new Date(year, month, randomDay);
            dueDate = `${randomDate.getFullYear()}-${String(randomDate.getMonth() + 1).padStart(2, '0')}-${String(randomDate.getDate()).padStart(2, '0')}T00:00:00Z`;
          }
          console.log('Goal:', goal);
          return {
            id: goal.id,
            name: goal.name,
            description: goal.description,
            category: goal.category,
            status: goal.status || 'not_started',
            dueDate,
            steps: Array.isArray(goal.steps) ? goal.steps.map(s => (typeof s === 'string' ? s : s.title)) : [],
            progress: goal.progress,
          };
        });
      console.log('goalsArr for state:', goalsArr);
      setGoals(goalsArr);
    } catch (err) {
      setGoals([]);
      console.log('Error loading goals:', err);
    } finally {
      setGoalsLoading(false);
    }
  };

  // Открытие модалки — только сбросить выбранную цель и чат
  const openAIModal = () => {
    setAiModalVisible(true);
    setSelectedGoal(null);
    setChatHistoryByGoalId({});
  };

  // Загружать цели сразу при монтировании DashboardScreen
  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !selectedGoal) return;
    const goalId = selectedGoal.id;
    setChatHistoryByGoalId(prev => ({
      ...prev,
      [goalId]: [...(prev[goalId] || []), { role: 'user', text: input }]
    }));
    setLoading(true);
    try {
      const aiReply = await mainAI.askAI({ goal: selectedGoal, message: input });
      setChatHistoryByGoalId(prev => ({
        ...prev,
        [goalId]: [...(prev[goalId] || []), { role: 'ai', text: aiReply }]
      }));
    } catch (e) {
      setChatHistoryByGoalId(prev => ({
        ...prev,
        [goalId]: [...(prev[goalId] || []), { role: 'ai', text: 'Ошибка ответа от ИИ' }]
      }));
    }
    setInput('');
    setLoading(false);
  };

  const handleSelectGoal = (goal) => {
    setSelectedGoal(goal);
    setInput('');
  };

  const renderQuickAction = (icon, title, route) => (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={() => navigation.navigate(route)}
    >
      <View style={styles.quickActionIcon}>
        <Icon name={icon} size={24} color="#1E3A8A" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  // Календарная разметка для целей текущего месяца
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  // Собираем отметки для календаря
  const calendarMarks = {};
  goals.forEach(goal => {
    if (goal.dueDate && goal.dueDate !== '0001-01-01T00:00:00Z') {
      const dateObj = parseISO(goal.dueDate);
      if (isSameMonth(dateObj, today)) {
        const dateStr = format(dateObj, 'yyyy-MM-dd');
        if (!calendarMarks[dateStr]) {
          calendarMarks[dateStr] = { marked: true, dots: [{ color: '#3B82F6' }] };
        }
      }
    }
  });
  // Цели на выбранный день
  const goalsForSelectedDate = selectedDate
    ? goals.filter(goal => goal.dueDate && format(parseISO(goal.dueDate), 'yyyy-MM-dd') === selectedDate)
    : [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EFF6FF', '#ECFDF5', '#FDF4FF']}
        style={styles.gradient}
      >
        {/* Decorative gradient circles */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.titleContainer}>
                  <Svg width={32} height={32} viewBox="0 0 32 32" fill="none" stroke="#1E3A8A" strokeWidth={2}>
                    <Rect x={6} y={10} width={20} height={12} rx={6} />
                    <Path d="M11 17h10M13 13h6" />
                  </Svg>
                  <Text style={styles.title}>Dashboard</Text>
                </View>
                <Text style={styles.subtitle}>
                  Welcome to the Goal Management System!{' '}
                  <Text style={styles.highlightedText}>
                    Here you'll find your motivation, your templates, and your achievements.
                  </Text>
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'center', marginBottom: 24, marginTop: -12 }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#3b82f6',
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.18,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={() => setBannersVisible(true)}
                activeOpacity={0.85}
              >
                <Icon name="star" size={24} color="#fff" style={{ marginRight: 12 }} />
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 }}>
                  Why use this app?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              {renderQuickAction('message-circle', 'Chat', 'Chat')}
              {renderQuickAction('user', 'Profile', 'MyProfile')}
              {renderQuickAction('file-text', 'Templates', 'MyTemplates')}
              {renderQuickAction('target', 'Goals', 'Goals')}
              {renderQuickAction('users', 'Friends', 'FriendsList')}
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              <View style={styles.templateSection}>
                {/* Template Section Title */}
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Public Templates</Text>
                  <Text style={styles.sectionSubtitle}>
                    Open templates for all users
                  </Text>
                </View>

                {/* Template List */}
                <View style={styles.templateList}>
                  {/* Template items will be rendered here */}
                  <Text style={styles.comingSoon}>Coming soon...</Text>
                </View>
              </View>

              <View style={styles.infographicSection}>
                <Text style={styles.infographicTitle}>Your Goals and Progress</Text>
                {goals.length === 0 ? (
                  <Text style={{ color: '#9CA3AF', fontSize: 16, textAlign: 'center', marginVertical: 16 }}>No goals to display</Text>
                ) : (
                  goals.map(goal => {
                    const totalSteps = Array.isArray(goal.steps) ? goal.steps.length : 0;
                    const completedSteps = Array.isArray(goal.steps) && goal.progress
                      ? goal.steps.filter(step => goal.progress[step] === true)?.length
                      : 0;
                    const percent = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
                    return (
                      <View key={goal.id} style={styles.goalProgressBlock}>
                        <Text style={styles.goalTitle}>{goal.name}</Text>
                        <View style={styles.goalProgressBarBg}>
                          <View style={[styles.goalProgressBarFill, { width: `${percent}%` }]} />
                          <Text style={styles.goalProgressText}>{`${completedSteps} of ${totalSteps} steps (${percent}%)`}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
                <Text style={styles.infographicTitle}>Steps Completed by Goal</Text>
                <Text style={styles.infographicSubtitle}>How many steps you completed in each goal</Text>
                <BarChart
                  data={getStepsPerGoalChartData(goals)}
                  width={width * 0.92}
                  height={180}
                  yAxisLabel=""
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#f3f4f6',
                    backgroundGradientTo: '#e0e7ef',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(30, 58, 138, ${opacity})`,
                    style: { borderRadius: 16 },
                  }}
                  style={{ borderRadius: 16, marginTop: 16 }}
                  fromZero
                  showValuesOnTopOfBars
                />
              </View>

              <View style={styles.calendarSection}>
                <Text style={styles.calendarTitle}>Goals Calendar</Text>
                <Calendar
                  current={format(today, 'yyyy-MM-dd')}
                  markedDates={{
                    ...calendarMarks,
                    ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#3B82F6', marked: !!calendarMarks[selectedDate], dots: [{ color: '#3B82F6' }] } } : {})
                  }}
                  onDayPress={day => setSelectedDate(day.dateString)}
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
                  style={styles.calendarWidget}
                />
                {selectedDate && goalsForSelectedDate.length > 0 && (
                  <View style={styles.goalsForDayBlock}>
                    <Text style={styles.goalsForDayTitle}>Goals for {selectedDate}:</Text>
                    {goalsForSelectedDate.map(goal => (
                      <Text key={goal.id} style={styles.goalsForDayItem}>{goal.name}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
        {/* Абсолютная кнопка чата с ИИ */}
        <TouchableOpacity
          style={styles.aiChatButton}
          onPress={openAIModal}
          activeOpacity={0.85}
        >
          <Icon name="message-square" size={28} color="#fff" />
        </TouchableOpacity>
        {/* Модалка чата с ИИ */}
        <Modal
          visible={aiModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAiModalVisible(false)}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 32 : 0}
          >
            <View style={styles.aiModalOverlay}>
              <View style={styles.aiModalFullContent}>
                <View style={styles.aiModalHeader}>
                  <Text style={styles.aiModalTitle}>Чат с ИИ помощником</Text>
                  <TouchableOpacity onPress={() => setAiModalVisible(false)} style={styles.aiModalCloseIcon}>
                    <Icon name="x" size={26} color="#64748B" />
                  </TouchableOpacity>
                </View>
                {!selectedGoal ? (
                  <View style={styles.aiGoalSelectContent}>
                    <Text style={styles.aiModalSubtitle}>Выберите цель для получения советов:</Text>
                    {goalsLoading ? (
                      <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 32 }} />
                    ) : (
                      <FlatList
                        data={goals}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.aiGoalItem}
                            onPress={() => handleSelectGoal(item)}
                          >
                            <Text style={styles.aiGoalText}>{item.name}</Text>
                          </TouchableOpacity>
                        )}
                        contentContainerStyle={{ paddingBottom: 16 }}
                      />
                    )}
                  </View>
                ) : (
                  <View style={styles.aiChatKeyboardView}>
                    <View style={styles.aiChatHeaderRow}>
                      <TouchableOpacity onPress={() => setSelectedGoal(null)} style={styles.aiBackButton}>
                        <Icon name="arrow-left" size={20} color="#3B82F6" />
                        <Text style={styles.aiBackButtonText}>Сменить цель</Text>
                      </TouchableOpacity>
                      <Text style={styles.aiGoalName}>{selectedGoal.name}</Text>
                    </View>
                    <FlatList
                      data={chatHistoryByGoalId[selectedGoal.id] || []}
                      keyExtractor={(_, idx) => idx.toString()}
                      renderItem={({ item }) => (
                        <View style={item.role === 'ai' ? styles.aiBubbleLeft : styles.aiBubbleRight}>
                          <Text style={styles.aiBubbleText}>{item.text}</Text>
                        </View>
                      )}
                      contentContainerStyle={styles.aiChatList}
                    />
                    <View style={styles.aiInputRowSticky}>
                      <TextInput
                        style={styles.aiInput}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Задать вопрос..."
                        editable={!loading}
                      />
                      <TouchableOpacity style={styles.aiSendButton} onPress={handleSend} disabled={loading}>
                        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="send" size={22} color="#fff" />}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
       
      </LinearGradient>
      <PromotionBanners visible={bannersVisible} onClose={() => setBannersVisible(false)} />
    </View>
  );
};

function getStepsPerGoalChartData(goals) {
  const labels = goals.map(g => g.name);
  const data = goals.map(g =>
    Array.isArray(g.steps) && g.progress
      ? g.steps.filter(step => g.progress[step] === true)?.length
      : 0
  );
  return {
    labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(147, 197, 253, 0.2)',
    top: -width * 0.2,
    left: -width * 0.2,
    transform: [{ scale: 1.5 }],
    opacity: 0.2,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    bottom: -width * 0.3,
    right: -width * 0.3,
    transform: [{ scale: 1.5 }],
    opacity: 0.15,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  headerContent: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    lineHeight: 24,
  },
  highlightedText: {
    color: '#059669',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  quickAction: {
    flex: 1,
    minWidth: width / 3 - 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  mainContent: {
    paddingHorizontal: 16,
  },
  templateSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  sectionTitleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#60A5FA',
    fontWeight: '500',
    textAlign: 'center',
  },
  templateList: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  aiChatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiModalFullContent: {
    width: '96%',
    height: '88%',
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    padding: 0,
    overflow: 'hidden',
  },
  aiModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    position: 'relative',
  },
  aiModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    flex: 1,
  },
  aiModalCloseIcon: {
    position: 'absolute',
    right: 18,
    top: 14,
    padding: 4,
    zIndex: 2,
  },
  aiGoalSelectContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  aiModalSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  aiGoalItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  aiGoalText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  aiChatKeyboardView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  aiChatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 2,
  },
  aiBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#E0E7FF',
    marginRight: 10,
  },
  aiBackButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
    marginLeft: 6,
  },
  aiGoalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    flex: 1,
    textAlign: 'center',
  },
  aiChatList: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
  },
  aiBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: '80%',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  aiBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    borderTopRightRadius: 4,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: '80%',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  aiBubbleText: {
    fontSize: 16,
    color: '#1E3A8A',
  },
  aiInputRowSticky: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  aiInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    fontSize: 16,
  },
  aiSendButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infographicSection: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infographicTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  infographicSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 8,
  },
  goalProgressBlock: {
    marginBottom: 18,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 6,
  },
  goalProgressBarBg: {
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  goalProgressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    height: 32,
    zIndex: 1,
  },
  goalProgressText: {
    zIndex: 2,
    alignSelf: 'center',
    color: '#1E3A8A',
    fontWeight: 'bold',
    fontSize: 15,
  },
  calendarSection: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  calendarTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  calendarWidget: {
    borderRadius: 16,
    marginBottom: 12,
  },
  goalsForDayBlock: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  goalsForDayTitle: {
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 6,
  },
  goalsForDayItem: {
    color: '#3B82F6',
    fontSize: 16,
    marginBottom: 2,
  },
});

export default DashboardScreen; 