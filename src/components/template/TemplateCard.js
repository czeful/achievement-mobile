import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TemplateCard = ({ template, onCopy, onView, style }) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onView(template)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {template.title}
            </Text>
            <Text style={styles.category} numberOfLines={1}>
              {template.category}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onCopy(template)}
            >
              <Icon name="copy" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {template.description}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Icon name="users" size={16} color="#6B7280" />
              <Text style={styles.statText}>{template.uses || 0}</Text>
            </View>
            <View style={styles.stat}>
              <Icon name="star" size={16} color="#6B7280" />
              <Text style={styles.statText}>{template.rating || 0}</Text>
            </View>
          </View>
          <View style={styles.author}>
            <Text style={styles.authorText}>by {template.author}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
  },
  author: {
    flex: 1,
    alignItems: 'flex-end',
  },
  authorText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default TemplateCard; 