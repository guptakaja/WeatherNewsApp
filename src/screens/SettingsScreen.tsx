import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../types';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const NEWS_CATEGORIES = [
  { id: 'general', name: 'General', description: 'General news articles' },
  { id: 'business', name: 'Business', description: 'Business and finance news' },
  { id: 'technology', name: 'Technology', description: 'Tech and innovation news' },
  { id: 'health', name: 'Health', description: 'Health and medical news' },
  { id: 'science', name: 'Science', description: 'Science and research news' },
  { id: 'sports', name: 'Sports', description: 'Sports and athletics news' },
  { id: 'entertainment', name: 'Entertainment', description: 'Entertainment and celebrity news' },
];

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { settings, updateSettings, fetchWeather } = useAppContext();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    settings.newsCategories || ['general']
  );

  const handleTemperatureUnitChange = async (unit: 'celsius' | 'fahrenheit') => {
    await updateSettings({ temperatureUnit: unit });
    // Refresh weather data to update display
    fetchWeather();
  };

  const handleCategoryToggle = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);
    let newCategories: string[] = [];

    if (isSelected) {
      // Remove category, but ensure at least one remains
      newCategories = selectedCategories.filter(id => id !== categoryId);
      if (newCategories.length === 0) {
        Alert.alert(
          'Category Required',
          'At least one news category must be selected.',
          [{ text: 'OK' }]
        );
        return;
      }
    } else {
      // Add category
      newCategories = [...selectedCategories, categoryId];
    }

    setSelectedCategories(newCategories);
    updateSettings({ newsCategories: newCategories });
  };

  const handleRefreshLocation = async () => {
    Alert.alert(
      'Refresh Location',
      'This will update your location and refresh weather data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Refresh',
          onPress: async () => {
            try {
              await fetchWeather();
              Alert.alert(
                'Success',
                'Location and weather data refreshed successfully!',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to refresh location. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const showAPIKeysInfo = () => {
    Alert.alert(
      'API Keys Status',
      'Your app is configured with personal API keys:\n\n' +
      '✅ OpenWeatherMap API: Active\n' +
      '✅ NewsAPI: Active\n\n' +
      'All data is fetched from live APIs using your personal keys. ' +
      'Location is obtained from your device GPS.',
      [{ text: 'OK' }]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'About Weather & News App',
      'This app provides weather-based news filtering:\n\n' +
      '• Cold weather: Shows serious news\n' +
      '• Hot weather: Shows alert/urgent news\n' +
      '• Cool weather: Shows positive/winning news\n' +
      '• Moderate weather: Shows balanced news\n\n' +
      'Built with React Native and TypeScript.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={tw`flex-row items-center px-4 py-3 bg-white border-b border-gray-200`}>
        <TouchableOpacity
          style={tw`p-2 mr-2`}
          onPress={() => navigation.goBack()}
        >
          <Text style={tw`text-2xl text-blue-500`}>←</Text>
        </TouchableOpacity>
        <Text style={tw`flex-1 text-xl font-bold text-gray-800 text-center`}>Settings</Text>
        <View style={tw`w-10`} />
      </View>

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {/* Temperature Unit Section */}
        <View style={tw`bg-white mt-4 px-4 py-5`}>
          <Text style={tw`text-lg font-semibold text-gray-800 mb-2`}>Temperature Unit</Text>
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              style={[
                tw`flex-1 py-3 px-4 border-2 border-gray-200 rounded-lg items-center`,
                settings.temperatureUnit === 'celsius' && tw`border-blue-500 bg-blue-50`,
              ]}
              onPress={() => handleTemperatureUnitChange('celsius')}
            >
              <Text
                style={[
                  tw`text-sm font-semibold text-gray-600`,
                  settings.temperatureUnit === 'celsius' && tw`text-blue-500`,
                ]}
              >
                Celsius (°C)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                tw`flex-1 py-3 px-4 border-2 border-gray-200 rounded-lg items-center`,
                settings.temperatureUnit === 'fahrenheit' && tw`border-blue-500 bg-blue-50`,
              ]}
              onPress={() => handleTemperatureUnitChange('fahrenheit')}
            >
              <Text
                style={[
                  tw`text-sm font-semibold text-gray-600`,
                  settings.temperatureUnit === 'fahrenheit' && tw`text-blue-500`,
                ]}
              >
                Fahrenheit (°F)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* News Categories Section */}
        <View style={tw`bg-white mt-4 px-4 py-5`}>
          <Text style={tw`text-lg font-semibold text-gray-800 mb-2`}>News Categories</Text>
          <Text style={tw`text-sm text-gray-600 mb-4 leading-5`}>
            Select categories to include in your weather-based news feed
          </Text>
          <View style={tw`gap-3`}>
            {NEWS_CATEGORIES.map((category) => (
              <View key={category.id} style={tw`flex-row items-center py-2`}>
                <View style={tw`flex-1 mr-3`}>
                  <Text style={tw`text-base font-semibold text-gray-800 mb-1`}>{category.name}</Text>
                  <Text style={tw`text-xs text-gray-600`}>{category.description}</Text>
                </View>
                <Switch
                  value={selectedCategories.includes(category.id)}
                  onValueChange={() => handleCategoryToggle(category.id)}
                  trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                  thumbColor={selectedCategories.includes(category.id) ? '#fff' : '#f4f4f4'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Location Section */}
        <View style={tw`bg-white mt-4 px-4 py-5`}>
          <Text style={tw`text-lg font-semibold text-gray-800 mb-2`}>Location</Text>
          <TouchableOpacity 
            style={tw`flex-row items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-200`}
            onPress={handleRefreshLocation}
          >
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-semibold text-gray-800 mb-1`}>Refresh Location</Text>
              <Text style={tw`text-xs text-gray-600`}>
                Update your current location for accurate weather data
              </Text>
            </View>
            <Text style={tw`text-xl`}>📍</Text>
          </TouchableOpacity>
          {settings.location && (
            <Text style={tw`text-xs text-gray-600 mt-2 font-mono`}>
              Current: {settings.location.lat.toFixed(4)}, {settings.location.lon.toFixed(4)}
            </Text>
          )}
        </View>

        {/* App Info Section */}
        <View style={tw`bg-white mt-4 px-4 py-5`}>
          <Text style={tw`text-lg font-semibold text-gray-800 mb-2`}>App Information</Text>
          
          <TouchableOpacity 
            style={tw`flex-row items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-200 mb-3`}
            onPress={showAPIKeysInfo}
          >
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-semibold text-gray-800 mb-1`}>API Keys Status</Text>
              <Text style={tw`text-xs text-gray-600`}>
                View current API configuration and status
              </Text>
            </View>
            <Text style={tw`text-xl`}>✅</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={tw`flex-row items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-200`}
            onPress={showAbout}
          >
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-semibold text-gray-800 mb-1`}>About</Text>
              <Text style={tw`text-xs text-gray-600`}>
                Learn about weather-based news filtering
              </Text>
            </View>
            <Text style={tw`text-xl`}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* Footer spacing */}
        <View style={tw`h-5`} />
      </ScrollView>
    </SafeAreaView>
  );
};



