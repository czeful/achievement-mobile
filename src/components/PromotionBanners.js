import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

const BANNERS = [
  {
    title: 'AI-powered Goal Assistant',
    desc: 'Get smart suggestions and step-by-step plans for any goal. Achieve more with the help of AI!',
    icon: 'zap',
    colors: ['#fbbf24', '#f59e42'],
  },
  {
    title: 'Visual Progress Tracking',
    desc: 'See your progress with beautiful charts and infographics. Stay motivated every day!',
    icon: 'bar-chart-2',
    colors: ['#3b82f6', '#06b6d4'],
  },
  {
    title: 'Collaborate with Friends',
    desc: 'Invite friends, share goals, and achieve together. Social motivation works best!',
    icon: 'users',
    colors: ['#a78bfa', '#f472b6'],
  },
  {
    title: 'Personal Templates & Library',
    desc: 'Use ready-made templates or create your own. Save time and focus on what matters!',
    icon: 'book-open',
    colors: ['#10b981', '#fbbf24'],
  },
];

const PromotionBanners = ({ visible, onClose }) => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    setIndex(0);
    startTimer(0);
    return () => clearTimer();
    // eslint-disable-next-line
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    Animated.timing(progress, {
      toValue: (index + 1) / BANNERS.length,
      duration: 4000,
      useNativeDriver: false,
    }).start();
  }, [index, visible]);

  const startTimer = (startIdx) => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (startIdx + 1 < BANNERS.length) {
        setIndex(startIdx + 1);
        startTimer(startIdx + 1);
      } else {
        handleClose();
      }
    }, 4000);
  };

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleSkip = () => {
    clearTimer();
    if (index + 1 < BANNERS.length) {
      setIndex(index + 1);
      startTimer(index + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    clearTimer();
    onClose && onClose();
  };

  if (!visible) return null;
  const banner = BANNERS[index];

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <LinearGradient colors={banner.colors} style={styles.bannerBg}>
          <View style={styles.progressBarWrap}>
            {BANNERS.map((_, i) => (
              <View
                key={i}
                style={[styles.progressBar,
                  { backgroundColor: i <= index ? '#fff' : 'rgba(255,255,255,0.3)' },
                  i === index && { flex: 2 },
                ]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>{index + 1 < BANNERS.length ? 'Skip' : 'Close'}</Text>
          </TouchableOpacity>
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <Icon name={banner.icon} size={48} color="#fff" />
            </View>
            <Text style={styles.title}>{banner.title}</Text>
            <Text style={styles.desc}>{banner.desc}</Text>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  progressBarWrap: {
    flexDirection: 'row',
    position: 'absolute',
    top: 48,
    left: 24,
    right: 24,
    width: width - 48,
    height: 6,
    zIndex: 2,
    gap: 6,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  skipBtn: {
    position: 'absolute',
    top: 48,
    right: 32,
    zIndex: 3,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  skipText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.2,
  },
  desc: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default PromotionBanners; 