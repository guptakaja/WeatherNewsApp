// Weather API Types
export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    };
  };
  forecast: DayForecast[];
}

export interface DayForecast {
  date: string;
  temp: {
    min: number;
    max: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  };
}

// News API Types
export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  sentiment?: 'depressing' | 'fear' | 'winning' | 'happiness';
}

export interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
}

// Weather Conditions
export type WeatherCondition = 'cold' | 'hot' | 'cool' | 'moderate';

// App Settings
export interface AppSettings {
  temperatureUnit: 'celsius' | 'fahrenheit';
  newsCategories: string[];
  location: {
    lat: number;
    lon: number;
  } | null;
}

// Context Types
export interface AppContextType {
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
  updateSettings: (settings: Partial<AppSettings>) => void;
  fetchWeather: () => Promise<void>;
  fetchNews: () => Promise<void>;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};