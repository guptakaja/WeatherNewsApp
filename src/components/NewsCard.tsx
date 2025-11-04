import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import tw from 'twrnc';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');

export const NewsCard: React.FC<NewsCardProps> = ({ article, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Open article URL in browser
      Linking.openURL(article.url).catch((err) => 
        console.error('Error opening article:', err)
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'depressing':
        return '#757575';
      case 'fear':
        return '#F44336';
      case 'winning':
        return '#4CAF50';
      case 'happiness':
        return '#FF9800';
      default:
        return '#2196F3';
    }
  };

  const getSentimentLabel = (sentiment?: string) => {
    switch (sentiment) {
      case 'depressing':
        return 'Serious News';
      case 'fear':
        return 'Alert News';
      case 'winning':
        return 'Victory News';
      case 'happiness':
        return 'Positive News';
      default:
        return 'General News';
    }
  };

  return (
    <TouchableOpacity style={tw`bg-white mx-4 my-2 rounded-xl shadow-sm`} onPress={handlePress}>
      <View style={tw`overflow-hidden rounded-xl`}>
        {article.urlToImage && (
          <Image
            source={{ uri: article.urlToImage }}
            style={tw`w-full h-50`}
            resizeMode="cover"
          />
        )}
        
        <View style={tw`p-4`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-xs text-gray-600 font-semibold flex-1 mr-2`} numberOfLines={1}>
              {article.source.name}
            </Text>
            <Text style={tw`text-xs text-gray-400`}>
              {formatDate(article.publishedAt)}
            </Text>
          </View>
          
          {article.sentiment && (
            <View style={tw`mb-2`}>
              <View 
                style={[
                  tw`self-start px-2 py-1 rounded-xl`,
                  { backgroundColor: getSentimentColor(article.sentiment) }
                ]}
              >
                <Text style={tw`text-xs text-white font-semibold`}>
                  {getSentimentLabel(article.sentiment)}
                </Text>
              </View>
            </View>
          )}
          
          <Text style={tw`text-base font-bold text-gray-800 leading-5 mb-2`} numberOfLines={3}>
            {article.title}
          </Text>
          
          {article.description && (
            <Text style={tw`text-sm text-gray-600 leading-5 mb-3`} numberOfLines={3}>
              {article.description}
            </Text>
          )}
          
          <View style={tw`border-t border-gray-100 pt-2`}>
            <Text style={tw`text-xs text-blue-500 font-semibold`}>Tap to read full article</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};



