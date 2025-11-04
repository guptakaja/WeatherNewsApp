import { WeatherData, WeatherCondition, NewsArticle } from '../types';
import { newsService } from '../services/newsService';

export const weatherNewsFilter = {
  /**
   * Determine weather condition based on temperature
   * Cold: < 10°C (50°F)
   * Hot: > 30°C (86°F)  
   * Cool: 10-20°C (50-68°F)
   * Moderate: 20-30°C (68-86°F)
   */
  getWeatherCondition(temperature: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): WeatherCondition {
    const tempInCelsius = unit === 'fahrenheit' ? (temperature - 32) * 5/9 : temperature;
    
    if (tempInCelsius < 10) {
      return 'cold';
    } else if (tempInCelsius > 30) {
      return 'hot';
    } else if (tempInCelsius >= 10 && tempInCelsius <= 20) {
      return 'cool';
    } else {
      return 'moderate';
    }
  },

  /**
   * Get news sentiment based on weather condition
   * Cold weather -> Depressing news
   * Hot weather -> Fear-based news
   * Cool weather -> Winning/Happiness news
   * Moderate weather -> Mix of all
   */
  getNewsSentimentForWeather(condition: WeatherCondition): ('depressing' | 'fear' | 'winning' | 'happiness')[] {
    switch (condition) {
      case 'cold':
        return ['depressing'];
      case 'hot':
        return ['fear'];
      case 'cool':
        return ['winning', 'happiness'];
      case 'moderate':
      default:
        return ['winning', 'happiness']; // Default to positive news
    }
  },

  /**
   * Filter and fetch news based on current weather
   */
  async getWeatherBasedNews(weatherData: WeatherData, unit: 'celsius' | 'fahrenheit' = 'celsius'): Promise<NewsArticle[]> {
    try {
      const condition = this.getWeatherCondition(weatherData.current.temp, unit);
      const sentiments = this.getNewsSentimentForWeather(condition);
      
      console.log(`Weather condition: ${condition}, Temperature: ${weatherData.current.temp}°${unit === 'celsius' ? 'C' : 'F'}`);
      console.log(`Fetching news with sentiments: ${sentiments.join(', ')}`);

      // Fetch news for each sentiment
      const newsPromises = sentiments.map(sentiment => 
        newsService.getNewsBySentiment(sentiment)
      );

      const newsResults = await Promise.all(newsPromises);
      
      // Combine and shuffle the results
      let combinedNews: NewsArticle[] = [];
      newsResults.forEach(articles => {
        combinedNews = [...combinedNews, ...articles];
      });

      // Shuffle the combined news to mix different sentiments
      return this.shuffleArray(combinedNews).slice(0, 20); // Limit to 20 articles
    } catch (error) {
      console.error('Error filtering news based on weather:', error);
      throw error;
    }
  },

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Get a description of the news filtering logic for the user
   */
  getFilterDescription(condition: WeatherCondition): string {
    switch (condition) {
      case 'cold':
        return 'It\'s cold outside! Showing more serious and somber news to match the mood.';
      case 'hot':
        return 'It\'s hot today! Showing news about challenges and urgent matters.';
      case 'cool':
        return 'Perfect weather! Showing uplifting news about victories and positive events.';
      case 'moderate':
      default:
        return 'Nice weather today! Showing a mix of positive and uplifting news.';
    }
  },

  /**
   * Convert temperature between units
   */
  convertTemperature(temp: number, fromUnit: 'celsius' | 'fahrenheit', toUnit: 'celsius' | 'fahrenheit'): number {
    if (fromUnit === toUnit) return temp;
    
    if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
      return (temp * 9/5) + 32;
    } else {
      return (temp - 32) * 5/9;
    }
  },
};