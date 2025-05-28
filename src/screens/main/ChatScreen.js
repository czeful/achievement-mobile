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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { format } from 'date-fns';

const ChatScreen = () => {
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
      setMessages(prev => [...prev, newMessage]);
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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const newMessage = {
          id: Date.now().toString(),
          type: 'image',
          uri: result.assets[0].uri,
          sender: 'me',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to pick image');
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

  const sendFile = () => {
    if (!selectedFile) {
      console.log('No file selected to send');
      return;
    }

    console.log('Sending file:', selectedFile);

    const newMessage = {
      id: Date.now().toString(),
      type: 'file',
      uri: selectedFile.uri,
      name: selectedFile.name,
      size: selectedFile.size,
      mimeType: selectedFile.type,
      sender: 'me',
      timestamp: new Date(),
    };

    console.log('Creating new message:', newMessage);
    setMessages(prev => [...prev, newMessage]);
    setSelectedFile(null);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      type: 'text',
      text: inputText,
      sender: 'me',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
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

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    const isPlaying = playingMessageId === item.id;

    const renderContent = () => {
      switch (item.type) {
        case 'voice':
          return (
            <TouchableOpacity 
              style={styles.voiceMessage}
              onPress={() => {
                if (isPlaying) {
                  stopVoiceMessage();
                } else {
                  playVoiceMessage(item.uri, item.id);
                }
              }}
            >
              <Icon 
                name={isPlaying ? "pause" : "play"} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.voiceMessageText}>
                Voice Message {item.duration ? `(${formatDuration(item.duration)})` : ''}
              </Text>
            </TouchableOpacity>
          );
        case 'image':
          return (
            <TouchableOpacity 
              onPress={() => openImage(item.uri)}
              style={styles.imageContainer}
            >
              <Image 
                source={{ uri: item.uri }} 
                style={styles.messageImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          );
        case 'file':
          console.log('Rendering file message:', item);
          return (
            <TouchableOpacity 
              style={styles.fileMessage}
              onPress={() => openFile(item.uri)}
            >
              <Icon 
                name={getFileIcon(item.name)} 
                size={24} 
                color="#fff" 
              />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {item.name || 'Unnamed file'}
                </Text>
                <Text style={styles.fileSize}>
                  {formatFileSize(item.size || 0)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        default:
          return <Text style={styles.messageText}>{item.text}</Text>;
      }
    };

    return (
      <View style={[
        styles.messageContainer,
        isMe ? styles.myMessage : styles.theirMessage
      ]}>
        {renderContent()}
        <Text style={styles.timestamp}>
          {format(item.timestamp, 'HH:mm')}
        </Text>
      </View>
    );
  };

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
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          inverted
          onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0 })}
        />

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
});

export default ChatScreen; 