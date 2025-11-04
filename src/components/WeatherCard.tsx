import React from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
} from 'react-native';
import tw from 'twrnc';
import { WeatherData } from '../types';
import { weatherService } from '../services/weatherService';
import { weatherNewsFilter } from '../utils/weatherNewsFilter';

interface WeatherCardProps {
  weather: WeatherData;
  temperatureUnit: 'celsius' | 'fahrenheit';
}

const { width } = Dimensions.get('window');

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, temperatureUnit }) => {
  const displayTemp = (temp: number) => {
    const convertedTemp = weatherNewsFilter.convertTemperature(
      temp, 
      'celsius', 
      temperatureUnit
    );
    return `${Math.round(convertedTemp)}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`;
  };

  const condition = weatherNewsFilter.getWeatherCondition(weather.current.temp, 'celsius');
  const filterDescription = weatherNewsFilter.getFilterDescription(condition);

  return (
    <View style={tw`bg-white m-4 rounded-2xl p-5 shadow-lg`}>
      {/* Current Weather */}
      <View style={tw`items-center mb-5`}>
        <View style={tw`mb-2.5`}>
          <Text style={tw`text-lg font-semibold text-gray-800 text-center`}>
            {weather.location.name}, {weather.location.country}
          </Text>
        </View>
        
        <View style={tw`flex-row items-center mb-2.5`}>
          <Image
            source={{
              uri: weatherService.getWeatherIconUrl(weather.current.weather.icon),
            }}
            style={tw`w-20 h-20 mr-2.5`}
          />
          <Text style={tw`text-5xl font-bold text-blue-500`}>
            {displayTemp(weather.current.temp)}
          </Text>
        </View>
        
        <Text style={tw`text-base text-gray-600 capitalize mb-5`}>
          {weather.current.weather.description}
        </Text>
        
        <View style={tw`flex-row justify-around w-full`}>
          <View style={tw`items-center`}>
            <Text style={tw`text-xs text-gray-400 mb-1`}>Feels like</Text>
            <Text style={tw`text-sm font-semibold text-gray-800`}>
              {displayTemp(weather.current.feels_like)}
            </Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={tw`text-xs text-gray-400 mb-1`}>Humidity</Text>
            <Text style={tw`text-sm font-semibold text-gray-800`}>{weather.current.humidity}%</Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={tw`text-xs text-gray-400 mb-1`}>Pressure</Text>
            <Text style={tw`text-sm font-semibold text-gray-800`}>{weather.current.pressure} hPa</Text>
          </View>
        </View>
      </View>

      {/* News Filter Info */}
      <View style={tw`bg-blue-50 p-3 rounded-lg mb-5`}>
        <Text style={tw`text-sm font-semibold text-blue-700 mb-1`}>News Filter Active</Text>
        <Text style={tw`text-xs text-blue-700`}>{filterDescription}</Text>
      </View>

      {/* 5-Day Forecast */}
      <View style={tw`mt-2.5`}>
        <Text style={tw`text-base font-semibold text-gray-800 mb-3`}>5-Day Forecast</Text>
        <View style={tw`flex-row justify-between`}>
          {weather.forecast.map((day, index) => (
            <View key={index} style={tw`items-center flex-1`}>
              <Text style={tw`text-xs text-gray-600 mb-1`}>
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Image
                source={{
                  uri: weatherService.getWeatherIconUrl(day.weather.icon),
                }}
                style={tw`w-10 h-10 mb-1`}
              />
              <Text style={tw`text-xs text-gray-800 text-center`}>
                {displayTemp(day.temp.max)}/{displayTemp(day.temp.min)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};



