import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import tw from 'twrnc';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  text,
  color = '#3b82f6',
}) => {
  return (
    <View style={tw`flex-1 justify-center items-center p-5`}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[tw`mt-3 text-base text-center`, { color }]}>{text}</Text>}
    </View>
  );
};

