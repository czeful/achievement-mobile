import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from '../../services/api';
import { useLoading } from '../../context/LoadingContext';
import TemplateCard from '../../components/template/TemplateCard';
import TemplateDetails from '../../components/template/TemplateDetails';

const { width } = Dimensions.get('window');

const MyTemplatesScreen = () => {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigation = useNavigation();
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/templates', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTemplates(Array.isArray(res.data) ? res.data : []);
      } catch {
        setTemplates([]);
      }
      setLoading(false);
    };
    fetchTemplates();
  }, [setLoading]);

  const renderTemplateCard = ({ item }) => (
    <TemplateCard
      template={item}
      onCopy={() => {}}
      onView={() => setSelected(item)}
      style={styles.templateCard}
    />
  );

  return (
    <LinearGradient
      colors={['#F3F4F6', '#EBF8FF', '#E0F2FE']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My templates</Text>
            <Text style={styles.subtitle}>
              All your created goal templates in one place
            </Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateTemplate')}
          >
            <Icon name="plus" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>New template</Text>
          </TouchableOpacity>
        </View>

        {/* Template List */}
        {templates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You don't have your own templates.
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Create new template!
            </Text>
          </View>
        ) : (
          <FlatList
            data={templates}
            renderItem={renderTemplateCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={width > 768 ? 3 : width > 480 ? 2 : 1}
            contentContainerStyle={styles.templateList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Template Details Modal */}
        {selected && (
          <TemplateDetails
            template={selected}
            onClose={() => setSelected(null)}
            onCopy={() => {}}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  templateList: {
    gap: 16,
    paddingBottom: 24,
  },
  templateCard: {
    flex: 1,
    margin: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#60A5FA',
    textAlign: 'center',
  },
});

export default MyTemplatesScreen; 