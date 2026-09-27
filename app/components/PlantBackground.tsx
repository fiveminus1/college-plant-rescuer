import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/theme';

interface PlantBackgroundProps {
  children: ReactNode;
}

export function PlantBackground({ children }: PlantBackgroundProps) {
  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.decorations}>
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />
        <View style={styles.leafShape} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#EEF7EA',
    top: -205,
    right: -120,
    transform: [{ rotate: '22deg' }],
  },
  bottomGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFF7E8',
    bottom: -205,
    left: -125,
  },
  leafShape: {
    position: 'absolute',
    width: 150,
    height: 70,
    borderRadius: 100,
    backgroundColor: '#E6F2E7',
    top: 115,
    left: -78,
    transform: [{ rotate: '-25deg' }],
    opacity: 0.45,
  },
});