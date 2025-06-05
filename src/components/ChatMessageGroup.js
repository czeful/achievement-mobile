import React from 'react';
import { View } from 'react-native';
import ChatDateLabel from './ChatDateLabel';
import ChatMessage from './ChatMessage';

export default function ChatMessageGroup({ dateLabel, messages, myId, playingMessageId, onPlayVoice, onStopVoice, onOpenFile, onOpenImage }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <ChatDateLabel label={dateLabel} />
      {messages.map(item => (
        <ChatMessage
          key={item.id}
          item={item}
          isMe={item.sender === 'me' || item.sender_id === myId}
          isPlaying={playingMessageId === item.id}
          onPlayVoice={onPlayVoice}
          onStopVoice={onStopVoice}
          onOpenFile={onOpenFile}
          onOpenImage={onOpenImage}
        />
      ))}
    </View>
  );
} 