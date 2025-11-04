import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppContext } from '../context/AppContext';
import { WeatherCard } from '../components/WeatherCard';
import { NewsCard } from '../components/NewsCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {
    weather,
    news,
    settings,
    loading,
    error,
    fetchWeather,
    fetchNews,
  } = useAppContext();

  useEffect(() => {
    // Fetch initial data when component mounts
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await fetchWeather();
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([fetchWeather(), fetchNews()]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  // Show loading state when initially loading weather
  if (loading.weather && !weather) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-100`}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <LoadingSpinner text="Getting your live GPS location and weather..." />
      </SafeAreaView>
    );
  }

  // Show error state if weather fails to load
  if (error.weather && !weather) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-100`}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <ErrorView
          error={error.weather}
          onRetry={loadInitialData}
          retryText="Try Again with Live Location"
        />
      </SafeAreaView>
    );
  }

  const isRefreshing = loading.weather || loading.news;

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={tw`flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200`}>
        <Text style={tw`text-xl font-bold text-gray-800`}>Weather & News</Text>
        <TouchableOpacity
          style={tw`p-2`}
          onPress={navigateToSettings}
        >
          <Text style={{fontSize: 20}}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={tw`flex-1`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Weather Section */}
        {weather && (
          <WeatherCard
            weather={weather}
            temperatureUnit={settings.temperatureUnit}
          />
        )}

        {/* News Section */}
        <View style={tw`mt-2`}>
          <View style={tw`flex-row justify-between items-center px-4 py-3`}>
            <Text style={tw`text-lg font-semibold text-gray-800`}>
              Weather-Based News Headlines
            </Text>
            {news.length > 0 && (
              <Text style={tw`text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-full`}>
                {news.length} articles
              </Text>
            )}
          </View>

          {/* News Loading */}
          {loading.news && news.length === 0 && (
            <View style={tw`p-5`}>
              <LoadingSpinner 
                text="Loading personalized news based on weather..." 
                size="small"
              />
            </View>
          )}

          {/* News Error */}
          {error.news && news.length === 0 && (
            <View style={tw`m-4`}>
              <ErrorView
                error={error.news}
                onRetry={fetchNews}
                retryText="Retry News"
              />
            </View>
          )}

          {/* News Articles */}
          {news.length > 0 && (
            <View style={tw`pb-4`}>
              {news.map((article, index) => (
                <NewsCard
                  key={`${article.url}-${index}`}
                  article={article}
                />
              ))}
            </View>
          )}

          {/* Empty State */}
          {!loading.news && !error.news && news.length === 0 && (
            <View style={tw`items-center p-10`}>
              <Text style={tw`text-5xl mb-4`}>📰</Text>
              <Text style={tw`text-sm text-gray-600 text-center mb-5 leading-5`}>
                No news articles available at the moment.
              </Text>
              <TouchableOpacity
                style={tw`bg-blue-500 px-5 py-2.5 rounded-lg`}
                onPress={fetchNews}
              >
                <Text style={tw`text-white text-sm font-semibold`}>Load News</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer spacing */}
        <View style={tw`h-5`} />
      </ScrollView>
    </SafeAreaView>
  );
};



