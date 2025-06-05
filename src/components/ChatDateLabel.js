import React from 'react';
import { View, Text } from 'react-native';

export default function ChatDateLabel({ label }) {
  return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: 'bold' }}>{label}</Text>
    </View>
  );
} 