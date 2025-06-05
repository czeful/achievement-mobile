import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Animated,
  Linking,
  Modal,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { friendsAPI } from '../../services/api';
import useChatSocket from '../../hooks/useChatSocket';
import { getChat } from '../../services/chat'; // REST-метод получения истории сообщений
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatMessage from '../../components/ChatMessage';
import ChatDateLabel from '../../components/ChatDateLabel';
import ChatMessageGroup from '../../components/ChatMessageGroup';

const ChatScreen = () => {
  console.log('ChatScreen');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const flatListRef = useRef(null);
  const recordingTimer = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const soundRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [friends, setFriends] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [token, setToken] = useState(null);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    const fetchTokenAndId = async () => {
      const t = await AsyncStorage.getItem('token');
      setToken(t);
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setMyId(user.id);
        } catch {}
      }
    };
    if (selectedFriend) fetchTokenAndId();
  }, [selectedFriend]);

  const send = useChatSocket({
    token,
    onMessage: (msg) => {
      console.log('onMessage from Socket.IO:', msg);
      if (!msg) return;
      setMessages(prev => [
        {
          id: msg.id || Date.now().toString(),
          type: msg.type,
          text: msg.text,
          uri: msg.file_url || msg.uri || null,
          name: msg.file_name || msg.name || null,
          size: msg.file_size || msg.size || null,
          mimeType: msg.mime_type || msg.mimeType || null,
          sender: msg.sender_id === myId ? 'me' : 'them',
          timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
          duration: msg.duration,
        },
        ...prev,
      ]);
    }
  });

  useEffect(() => {
    if (isRecording) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start recording timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      // Stop animations and timer
      pulseAnim.setValue(1);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    // Cleanup function to unload recording and sound when component unmounts
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoadingFriends(true);
      try {
        const data = await friendsAPI.getFriends();
        setFriends(data || []);
      } catch (e) {
        Alert.alert('Error', 'Failed to load friends');
      } finally {
        setIsLoadingFriends(false);
      }
    };
    fetchFriends();
  }, []);

  // Загрузка истории сообщений при выборе друга
  useEffect(() => {
    if (!selectedFriend) {
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const res = await getChat(selectedFriend.id);
        const rawList = res.data || [];
        const chatHistory = rawList.map(msg => ({
          id: msg.id ? msg.id.toString() : `${msg.created_at}_${msg.sender_id}`,
          sender: msg.sender_id === myId ? 'me' : 'them',
          type: msg.type,
          text: msg.text || null,
          uri: msg.file_url || null,
          name: msg.file_name || null,
          size: msg.file_size || null,
          mimeType: msg.mime_type || null,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(chatHistory.reverse());
      } catch (error) {
        console.error('Ошибка при загрузке истории чата:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить историю сообщений');
        setMessages([]);
      }
    })();
  }, [selectedFriend, myId]);

  useEffect(() => {
    console.log('messages.length:', messages.length);
  }, [messages]);

  const startRecording = async () => {
    try {
      // First, ensure any existing recording is cleaned up
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone access to record voice messages');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
      // Reset recording state in case of error
      setRecording(null);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
      // Reset recording state in case of error
      setRecording(null);
      setIsRecording(false);
    }
  };

  const cancelRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to cancel recording:', error);
      // Reset recording state in case of error
      setRecording(null);
      setIsRecording(false);
    }
  };

  const sendRecording = async () => {
    try {
      if (!recording) return;
      const uri = recording.getURI();
      
      // Create message before cleaning up recording
      const newMessage = {
        id: Date.now().toString(),
        type: 'voice',
        uri,
        duration: recordingDuration,
        sender: 'me',
        timestamp: new Date(),
      };

      // Clean up recording
      await recording.stopAndUnloadAsync();
      setRecording(null);
      setIsRecording(false);

      // Add message to chat
      sendMessage(newMessage);
    } catch (error) {
      console.error('Failed to send recording:', error);
      Alert.alert('Error', 'Failed to send recording');
      // Reset recording state in case of error
      setRecording(null);
      setIsRecording(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const uploadFileToServer = async (file, token) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'file',
      type: file.type || 'application/octet-stream',
    });
    const response = await fetch('http://192.168.8.38:4000/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error('File upload failed');
    return await response.json();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          name: asset.fileName || 'image.jpg',
          type: asset.type || 'image/jpeg',
        };
        // 1. Загрузка на сервер
        const data = await uploadFileToServer(file, token);
        // 2. Отправка сообщения через сокет
        const newMessage = {
          id: Date.now().toString(),
          type: 'image',
          file_url: data.url,
          file_name: data.name,
          sender: 'me',
          timestamp: new Date(),
        };
        sendMessage(newMessage);
      }
    } catch (error) {
      console.error('Failed to pick image or upload:', error);
      Alert.alert('Error', 'Failed to pick or upload image');
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'file-text';
      case 'doc':
      case 'docx':
        return 'file-text';
      case 'xls':
      case 'xlsx':
        return 'file-text';
      case 'ppt':
      case 'pptx':
        return 'file-text';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'mp3':
      case 'wav':
      case 'm4a':
        return 'music';
      case 'mp4':
      case 'mov':
      case 'avi':
        return 'video';
      case 'zip':
      case 'rar':
      case '7z':
        return 'archive';
      default:
        return 'file';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const pickDocument = async () => {
    try {
      console.log('Starting document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      console.log('Document picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileInfo = {
          uri: file.uri,
          name: file.name,
          size: file.size,
          type: file.mimeType,
        };
        console.log('Setting selected file:', fileInfo);
        setSelectedFile(fileInfo);
      } else {
        console.log('Document picker was cancelled or failed');
      }
    } catch (error) {
      console.error('Failed to pick document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
  };

  const sendFile = async () => {
    if (!selectedFile) {
      console.log('No file selected to send');
      return;
    }
    try {
      // 1. Загрузка на сервер
      const data = await uploadFileToServer(selectedFile, token);
      // 2. Отправка сообщения через сокет
      const isImage = selectedFile.type && selectedFile.type.startsWith('image/');
      const newMessage = {
        id: Date.now().toString(),
        type: isImage ? 'image' : 'file',
        file_url: data.url,
        file_name: data.name,
        sender: 'me',
        timestamp: new Date(),
      };
      sendMessage(newMessage);
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to upload or send file:', error);
      Alert.alert('Error', 'Failed to upload or send file');
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedFriend) return;
    const newMessage = {
      id: Date.now().toString(),
      type: 'text',
      text: inputText,
      senderId: 'me',
      to: selectedFriend.id,
      timestamp: new Date(),
    };
    sendMessage(newMessage);
    setInputText('');
  };

  const playVoiceMessage = async (uri, messageId) => {
    try {
      // Stop any currently playing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Create and play new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setPlayingMessageId(messageId);

      // Set up playback status listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingMessageId(null);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (error) {
      console.error('Failed to play voice message:', error);
      Alert.alert('Error', 'Failed to play voice message');
      setPlayingMessageId(null);
    }
  };

  const stopVoiceMessage = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setPlayingMessageId(null);
    } catch (error) {
      console.error('Failed to stop voice message:', error);
    }
  };

  const openFile = async (uri) => {
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        await Linking.openURL(uri);
      } else {
        Alert.alert('Error', 'Cannot open this file type');
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const openImage = (uri) => {
    setSelectedImage(uri);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const sendMessage = (msgObj) => {
    if (!token || !selectedFriend) {
      console.warn('No token or selectedFriend, cannot send message');
      return;
    }
    send({ ...msgObj, receiver_id: selectedFriend.id });
    setMessages(prev => [{ ...msgObj, sender: 'me' }, ...prev]);
  };

  // Группировка сообщений по датам
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = format(msg.timestamp, 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    // Сортируем даты по возрастанию (старые сверху)
    const sortedDates = Object.keys(groups).sort();
    return sortedDates.map(date => ({
      date,
      messages: groups[date].sort((a, b) => a.timestamp - b.timestamp)
    }));
  };

  const groupedMessages = groupMessagesByDate(messages);

  const renderDateLabel = (dateStr) => {
    const dateObj = parseISO(dateStr + 'T00:00:00');
    if (isToday(dateObj)) return 'Today';
    if (isYesterday(dateObj)) return 'Yesterday';
    return format(dateObj, 'dd.MM.yyyy');
  };

  const handlePlayVoice = (uri, messageId) => {
    playVoiceMessage(uri, messageId);
  };
  const handleStopVoice = () => {
    stopVoiceMessage();
  };
  const handleOpenFile = (uri) => {
    openFile(uri);
  };
  const handleOpenImage = (uri) => {
    openImage(uri);
  };

  const renderGroupedMessages = () => (
    <>
      {groupedMessages.map(group => (
        <ChatMessageGroup
          key={group.date}
          dateLabel={renderDateLabel(group.date)}
          messages={group.messages}
          myId={myId}
          playingMessageId={playingMessageId}
          onPlayVoice={handlePlayVoice}
          onStopVoice={handleStopVoice}
          onOpenFile={handleOpenFile}
          onOpenImage={handleOpenImage}
        />
      ))}
    </>
  );

  if (!selectedFriend) {
    return (
      <View style={styles.emptyChatContainer}>
        <View style={styles.emptyChatHeader}>
          <Icon name="message-circle" size={32} color="#3B82F6" style={styles.emptyChatIcon} />
          <Text style={styles.emptyChatTitle}>Select a friend to chat</Text>
          <Text style={styles.emptyChatSubtitle}>Start chatting with your friends</Text>
        </View>
        {isLoadingFriends ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : friends.length === 0 ? (
          <View style={styles.noFriendsContainer}>
            <Icon name="users" size={48} color="#9CA3AF" style={styles.noFriendsIcon} />
            <Text style={styles.noFriendsText}>У вас пока нет друзей</Text>
            <TouchableOpacity 
              style={styles.addFriendsButton}
              onPress={() => navigation.navigate('FindFriends')}
            >
              <Icon name="user-plus" size={20} color="#fff" style={styles.addFriendsIcon} />
              <Text style={styles.addFriendsText}>Найти друзей</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.friendsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.friendItem}
                activeOpacity={0.7}
                onPress={() => setSelectedFriend(item)}
              >
                <View style={styles.friendAvatar}>
                  <Icon name="user" size={24} color="#3B82F6" />
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{item.username}</Text>
                  <Text style={styles.friendEmail}>{item.email}</Text>
                </View>
                <View style={styles.friendAction}>
                  <Icon name="chevron-right" size={20} color="#A5B4FC" />
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <LinearGradient
        colors={['#F3F4F6', '#EBF8FF', '#F0FDF4']}
        style={styles.gradient}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', zIndex: 2, marginTop: 48 }}>
          <TouchableOpacity
            onPress={() => setSelectedFriend(null)}
            style={{ marginRight: 16, padding: 8, borderRadius: 20, backgroundColor: '#EFF6FF' }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Icon name="user" size={22} color="#2563EB" />
            </View>
            <View>
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#1E3A8A' }}>{selectedFriend?.username}</Text>
              <Text style={{ fontSize: 13, color: '#64748B' }}>{selectedFriend?.email}</Text>
            </View>
          </View>
        </View>
        <ScrollView
          ref={flatListRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        >
          {renderGroupedMessages()}
        </ScrollView>

        {selectedFile && (
          <View style={styles.filePreviewContainer}>
            <View style={styles.filePreview}>
              <Icon 
                name={getFileIcon(selectedFile.name)} 
                size={24} 
                color="#6B7280" 
              />
              <View style={styles.filePreviewInfo}>
                <Text style={styles.filePreviewName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text style={styles.filePreviewSize}>
                  {formatFileSize(selectedFile.size)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.filePreviewClose}
                onPress={clearSelectedFile}
              >
                <Icon name="x" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isRecording ? (
          <View style={styles.recordingContainer}>
            <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: pulseAnim }] }]}>
              <Icon name="mic" size={24} color="#EF4444" />
            </Animated.View>
            <Text style={styles.recordingDuration}>
              {formatDuration(recordingDuration)}
            </Text>
            <View style={styles.recordingControls}>
              <TouchableOpacity
                style={styles.recordingControlButton}
                onPress={cancelRecording}
              >
                <Icon name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.recordingControlButton, styles.sendRecordingButton]}
                onPress={sendRecording}
              >
                <Icon name="send" size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={pickDocument}
            >
              <Icon name="paperclip" size={24} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachButton}
              onPress={pickImage}
            >
              <Icon name="image" size={24} color="#6B7280" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              multiline
            />

            {selectedFile ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendFile}
              >
                <Icon name="send" size={24} color="#3B82F6" />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.voiceButton}
                  onPress={startRecording}
                >
                  <Icon name="mic" size={24} color="#6B7280" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSend}
                >
                  <Icon name="send" size={24} color="#3B82F6" />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <Modal
          visible={!!selectedImage}
          transparent={true}
          animationType="fade"
          onRequestClose={closeImage}
        >
          <StatusBar backgroundColor="#000" barStyle="light-content" />
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeImage}
            >
              <Icon name="x" size={24} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    padding: 8,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    fontSize: 16,
  },
  attachButton: {
    padding: 8,
  },
  voiceButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  voiceMessageText: {
    color: '#fff',
    marginLeft: 8,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  filePreviewContainer: {
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 8,
  },
  filePreviewInfo: {
    flex: 1,
    marginLeft: 8,
  },
  filePreviewName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filePreviewSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  filePreviewClose: {
    padding: 4,
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
    minWidth: 200,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 8,
  },
  fileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  fileSize: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  recordingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingDuration: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  recordingControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  recordingControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendRecordingButton: {
    backgroundColor: '#EFF6FF',
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChatContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  emptyChatHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyChatIcon: {
    marginBottom: 16,
  },
  emptyChatTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyChatSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFriendsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noFriendsIcon: {
    marginBottom: 16,
  },
  noFriendsText: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  addFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addFriendsIcon: {
    marginRight: 8,
  },
  addFriendsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  friendsList: {
    paddingBottom: 32,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  friendAction: {
    padding: 8,
  },
});

export default ChatScreen; 