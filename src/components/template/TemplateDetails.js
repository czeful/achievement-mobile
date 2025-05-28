import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const TemplateDetails = ({ template, onClose, onCopy }) => {
  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{template.title}</Text>
                <Text style={styles.category}>{template.category}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Icon name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent}>
              {/* Description */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{template.description}</Text>
              </View>

              {/* Goals */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Goals</Text>
                {template.goals?.map((goal, index) => (
                  <View key={index} style={styles.goalItem}>
                    <Icon name="check-circle" size={20} color="#10B981" />
                    <Text style={styles.goalText}>{goal}</Text>
                  </View>
                ))}
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Icon name="users" size={20} color="#6B7280" />
                  <Text style={styles.statValue}>{template.uses || 0}</Text>
                  <Text style={styles.statLabel}>Uses</Text>
                </View>
                <View style={styles.stat}>
                  <Icon name="star" size={20} color="#6B7280" />
                  <Text style={styles.statValue}>{template.rating || 0}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.stat}>
                  <Icon name="calendar" size={20} color="#6B7280" />
                  <Text style={styles.statValue}>
                    {new Date(template.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.statLabel}>Created</Text>
                </View>
              </View>

              {/* Author */}
              <View style={styles.authorSection}>
                <Text style={styles.authorLabel}>Created by</Text>
                <Text style={styles.authorName}>{template.author}</Text>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.copyButton]}
                onPress={() => onCopy(template)}
              >
                <Icon name="copy" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Copy Template</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.useButton]}
                onPress={() => {
                  onClose();
                  // Navigate to create goal with template
                }}
              >
                <Icon name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Use Template</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#6B7280',
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  goalText: {
    fontSize: 16,
    color: '#4B5563',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  authorSection: {
    marginBottom: 24,
  },
  authorLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  copyButton: {
    backgroundColor: '#3B82F6',
  },
  useButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TemplateDetails; 