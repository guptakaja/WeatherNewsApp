import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherData, NewsArticle, AppSettings, AppContextType } from '../types';
import { weatherService } from '../services/weatherService';
import { newsService } from '../services/newsService';
import { locationService } from '../services/locationService';
import { weatherNewsFilter } from '../utils/weatherNewsFilter';

// Action types
type Action = 
  | { type: 'SET_WEATHER'; payload: WeatherData | null }
  | { type: 'SET_NEWS'; payload: NewsArticle[] }
  | { type: 'SET_FILTERED_NEWS'; payload: NewsArticle[] }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'SET_LOADING'; payload: { weather?: boolean; news?: boolean } }
  | { type: 'SET_ERROR'; payload: { weather?: string | null; news?: string | null } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> };

// State type
interface AppState {
  weather: WeatherData | null;
  news: NewsArticle[];
  filteredNews: NewsArticle[];
  settings: AppSettings;
  loading: {
    weather: boolean;
    news: boolean;
  };
  error: {
    weather: string | null;
    news: string | null;
  };
}

// Initial state
const initialState: AppState = {
  weather: null,
  news: [],
  filteredNews: [],
  settings: {
    temperatureUnit: 'celsius' as const,
    newsCategories: ['general', 'business', 'technology'],
    location: null,
  },
  loading: {
    weather: false,
    news: false,
  },
  error: {
    weather: null,
    news: null,
  },
};

// Reducer
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_WEATHER':
      return { ...state, weather: action.payload };
    case 'SET_NEWS':
      return { ...state, news: action.payload };
    case 'SET_FILTERED_NEWS':
      return { ...state, filteredNews: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: { ...state.error, ...action.payload } };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
};

// Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load settings from AsyncStorage on app start
  useEffect(() => {
    loadSettings();
  }, []);

  // Load settings from storage
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'SET_SETTINGS', payload: settings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Save settings to storage
  const saveSettings = async (settings: AppSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Update settings
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...state.settings, ...newSettings };
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
    await saveSettings(updatedSettings);
  };

  // Fetch weather data using ONLY live GPS location
  const fetchWeather = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { weather: true } });
      dispatch({ type: 'SET_ERROR', payload: { weather: null } });

      console.log('🌤️ Starting weather fetch with live GPS location...');

      // Get LIVE GPS location - no fallbacks
      const location = await locationService.getCurrentLocation();
      console.log(`🎯 Using live coordinates: ${location.latitude}, ${location.longitude}`);
      
      // Update settings with live location
      await updateSettings({ 
        location: { lat: location.latitude, lon: location.longitude } 
      });

      // Fetch weather data using your OpenWeatherMap API key and live coordinates
      const weatherData = await weatherService.getCurrentWeather(
        location.latitude, 
        location.longitude
      );

      console.log(`🌤️ Live weather data received:`);
      console.log(`   Location: ${weatherData.location.name}, ${weatherData.location.country}`);
      console.log(`   Temperature: ${weatherData.current.temp}°C`);
      console.log(`   Condition: ${weatherData.current.weather.description}`);
      
      dispatch({ type: 'SET_WEATHER', payload: weatherData });

      // Fetch filtered news based on live weather data
      if (weatherData) {
        await fetchFilteredNews(weatherData);
      }
    } catch (error) {
      console.error('❌ Weather fetch failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather data';
      
      // Clear any existing weather data on error
      dispatch({ type: 'SET_WEATHER', payload: null });
      dispatch({ type: 'SET_ERROR', payload: { weather: `Live location required: ${errorMessage}` } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { weather: false } });
    }
  };

  // Fetch news data
  const fetchNews = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { news: true } });
      dispatch({ type: 'SET_ERROR', payload: { news: null } });

      console.log('Fetching general news headlines...');
      
      // Fetch general news using your API key
      const news = await newsService.getTopHeadlines('us', 'general');
      console.log(`Fetched ${news.length} news articles`);
      
      dispatch({ type: 'SET_NEWS', payload: news });

    } catch (error) {
      console.error('Error fetching news:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news';
      dispatch({ type: 'SET_ERROR', payload: { news: errorMessage } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { news: false } });
    }
  };

  // Fetch weather-based filtered news
  const fetchFilteredNews = async (weatherData?: WeatherData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { news: true } });
      dispatch({ type: 'SET_ERROR', payload: { news: null } });

      const currentWeather = weatherData || state.weather;
      if (!currentWeather) {
        throw new Error('No weather data available');
      }

      console.log(`Fetching weather-based news for temperature: ${currentWeather.current.temp}°C`);

      // Get weather-based filtered news using real APIs
      const filteredNews = await weatherNewsFilter.getWeatherBasedNews(
        currentWeather,
        state.settings.temperatureUnit
      );

      console.log(`Received ${filteredNews.length} filtered news articles`);

      dispatch({ type: 'SET_FILTERED_NEWS', payload: filteredNews });
      dispatch({ type: 'SET_NEWS', payload: filteredNews });

    } catch (error) {
      console.error('Error fetching filtered news:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch filtered news';
      dispatch({ type: 'SET_ERROR', payload: { news: errorMessage } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { news: false } });
    }
  };

  const contextValue: AppContextType = {
    weather: state.weather,
    news: state.news,
    filteredNews: state.filteredNews,
    settings: state.settings,
    loading: state.loading,
    error: state.error,
    updateSettings,
    fetchWeather,
    fetchNews,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};