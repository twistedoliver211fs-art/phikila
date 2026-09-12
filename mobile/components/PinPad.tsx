import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
} from 'react-native';

interface PinPadProps {
  title?: string;
  pinLength?: number;
  onPinComplete: (pin: string) => void;
}

export default function PinPad({
  title = 'Enter PIN',
  pinLength = 4,
  onPinComplete,
}: PinPadProps) {
  const [pin, setPin] = useState('');

  const handleNumberPress = (num: string) => {
    if (pin.length < pinLength) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === pinLength) {
        onPinComplete(newPin);
        setPin('');
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < pinLength; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            i < pin.length && styles.dotFilled,
          ]}
        />
      );
    }
    return dots;
  };

  const renderKey = (label: string, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      style={styles.key}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Text style={styles.keyText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.dotsContainer}>{renderDots()}</View>
      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) =>
          renderKey(num, () => handleNumberPress(num))
        )}
        {renderKey('⌫', handleDelete)}
        {renderKey('0', () => handleNumberPress('0'))}
        {renderKey(' ', () => {})}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 48,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#475569',
  },
  dotFilled: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 280,
    gap: 20,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#f8fafc',
  },
});
