import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();

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
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

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
});

export default DashboardScreen; 