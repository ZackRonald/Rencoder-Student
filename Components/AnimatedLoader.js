import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';

const AnimatedLoader = () => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const widthAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(widthAnim, {
              toValue: 80,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
            Animated.timing(moveAnim, {
              toValue: 0,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
          ]),
          Animated.parallel([
            Animated.timing(widthAnim, {
              toValue: 16,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
            Animated.timing(moveAnim, {
              toValue: 64,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
          ]),
          Animated.parallel([
            Animated.timing(widthAnim, {
              toValue: 80,
              duration: 500,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
            Animated.timing(moveAnim, {
              toValue: 0,
              duration: 500,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
          ]),
        ])
      ).start();
    };

    animate();
  }, [moveAnim, widthAnim]);

  return (
    <View style={styles.loader}>
      <Text style={styles.loaderText}>loading</Text>
      <Animated.View
        style={[
          styles.load,
          {
            transform: [{ translateX: moveAnim }],
            width: widthAnim,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    width: 80,
    height: 50,
    position: 'relative',
    justifyContent: 'center',
    backgroundColor:"transparent",
  },
  loaderText: {
    position: 'absolute',
    top: 0,
    color: '#C8B6FF',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  load: {
    backgroundColor: '#9A79FF',
    borderRadius: 50,
    height: 16,
    position: 'absolute',
    bottom: 0,
  },
});

export default AnimatedLoader;
