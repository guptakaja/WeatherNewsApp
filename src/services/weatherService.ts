import axios from 'axios';
import { WeatherData } from '../types';
import { API_CONFIG } from '../config/api';

const API_KEY = API_CONFIG.OPENWEATHER_API_KEY;
const BASE_URL = API_CONFIG.OPENWEATHER_BASE_URL;

export const weatherService = {
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      console.log(`🌤️ Fetching weather for coordinates: ${latitude}, ${longitude}`);
      console.log(`🌍 Location appears to be: ${latitude > 0 ? 'Northern' : 'Southern'} Hemisphere, ${longitude > 0 ? 'Eastern' : 'Western'} Hemisphere`);
      
      // Check if coordinates are in India (rough bounds: 6-37°N, 68-97°E)
      if (latitude >= 6 && latitude <= 37 && longitude >= 68 && longitude <= 97) {
        console.log(`✅ Coordinates are within India bounds`);
      } else {
        console.warn(`⚠️ Coordinates (${latitude}, ${longitude}) are NOT in India! Expected location: Hyderabad (~17.3850°N, 78.4867°E)`);
      }
      
      // Get current weather using your API key
      const currentResponse = await axios.get(
        `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      // Get 5-day forecast using your API key
      const forecastResponse = await axios.get(
        `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      // Process forecast data to get daily forecasts
      const dailyForecasts = this.processForecastData(forecastResponse.data.list);

      const weatherData = {
        location: {
          name: currentResponse.data.name,
          country: currentResponse.data.sys.country,
          lat: currentResponse.data.coord.lat,
          lon: currentResponse.data.coord.lon,
        },
        current: {
          temp: currentResponse.data.main.temp,
          feels_like: currentResponse.data.main.feels_like,
          humidity: currentResponse.data.main.humidity,
          pressure: currentResponse.data.main.pressure,
          weather: {
            main: currentResponse.data.weather[0].main,
            description: currentResponse.data.weather[0].description,
            icon: currentResponse.data.weather[0].icon,
          },
        },
        forecast: dailyForecasts,
      };

      console.log(`Weather data fetched successfully for ${weatherData.location.name}, ${weatherData.location.country}`);
      console.log(`Current temperature: ${weatherData.current.temp}°C`);
      
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data from OpenWeatherMap:', error);
      throw new Error(`Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },



  processForecastData(forecastList: any[]) {
    const dailyData: { [key: string]: any } = {};

    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          temps: [],
          weather: item.weather[0],
        };
      }
      
      dailyData[date].temps.push(item.main.temp);
    });

    return Object.values(dailyData).slice(0, 5).map((day: any) => ({
      date: day.date,
      temp: {
        min: Math.min(...day.temps),
        max: Math.max(...day.temps),
      },
      weather: day.weather,
    }));
  },

  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  },
};