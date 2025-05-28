import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const GradientAvatar = ({ name }) => {
  const initial = name ? name[0].toUpperCase() : "U";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#A855F7', '#10B981']}
        style={styles.gradient}
      >
        <Text style={styles.initial}>{initial}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -56,
    left: '50%',
    marginLeft: -56,
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 