import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';

interface ErrorViewProps {
  error: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  error,
  onRetry,
  retryText = 'Try Again',
}) => {
  return (
    <View style={tw`flex-1 justify-center items-center p-5`}>
      <Text style={tw`text-5xl mb-4`}>⚠️</Text>
      <Text style={tw`text-base text-gray-600 text-center mb-5 leading-6`}>{error}</Text>
      {onRetry && (
        <TouchableOpacity style={tw`bg-blue-500 px-6 py-3 rounded-lg`} onPress={onRetry}>
          <Text style={tw`text-white text-base font-semibold`}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

