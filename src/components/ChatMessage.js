import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';

const getFileIcon = (fileName) => {
  const extension = fileName?.split('.')?.pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'xls':
    case 'xlsx':
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
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function ChatMessage({ item, isMe, isPlaying, onPlayVoice, onStopVoice, onOpenFile, onOpenImage }) {
  const renderContent = () => {
    switch (item.type) {
      case 'voice':
        return (
          <TouchableOpacity 
            style={styles.voiceMessage}
            onPress={() => {
              if (isPlaying) {
                onStopVoice && onStopVoice();
              } else {
                onPlayVoice && onPlayVoice(item.uri, item.id);
              }
            }}
          >
            <Icon 
              name={isPlaying ? 'pause' : 'play'} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.voiceMessageText}>
              Voice Message {item.duration ? `(${item.duration})` : ''}
            </Text>
          </TouchableOpacity>
        );
      case 'image':
        const imageUrl = (item.file_url || item.uri || '').trim();
        const cleanUrl = imageUrl.replace(/['"]/g, '').replace(/\n/g, '');
        return (
          <TouchableOpacity 
            onPress={() => onOpenImage && onOpenImage(cleanUrl)}
            style={styles.imageContainer}
          >
            <Image 
              source={{ uri: cleanUrl }} 
              style={styles.messageImage}
              resizeMode="cover"
              onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
            />
          </TouchableOpacity>
        );
      case 'file':
        return (
          <TouchableOpacity 
            style={styles.fileMessage}
            onPress={() => onOpenFile && onOpenFile(item.file_url || item.uri)}
          >
            <Icon 
              name={getFileIcon(item.file_name || item.name)} 
              size={24} 
              color="#fff" 
            />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.file_name || item.name || 'Unnamed file'}
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
}

const styles = StyleSheet.create({
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
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
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
}); 