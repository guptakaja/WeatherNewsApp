import axios from 'axios';
import { NewsResponse, NewsArticle } from '../types';
import { API_CONFIG } from '../config/api';

const API_KEY = API_CONFIG.NEWS_API_KEY;
const BASE_URL = API_CONFIG.NEWS_API_BASE_URL;

export const newsService = {
  async getTopHeadlines(country: string = 'us', category?: string): Promise<NewsArticle[]> {
    try {
      console.log(`Fetching top headlines for ${country}${category ? ` in ${category} category` : ''} using NewsAPI`);
      
      const params: any = {
        apiKey: API_KEY,
        country,
        pageSize: 50,
      };

      if (category) {
        params.category = category;
      }

      const response = await axios.get<NewsResponse>(`${BASE_URL}/top-headlines`, {
        params,
      });

      const articles = response.data.articles.filter(article => 
        article.title && 
        article.description && 
        article.title !== '[Removed]' &&
        article.urlToImage // Only include articles with images
      );

      console.log(`Successfully fetched ${articles.length} news articles`);
      return articles;
    } catch (error) {
      console.error('Error fetching news from NewsAPI:', error);
      throw new Error(`Failed to fetch news: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },



  async searchNews(query: string): Promise<NewsArticle[]> {
    try {
      console.log(`Searching news for: "${query}" using NewsAPI`);
      
      const response = await axios.get<NewsResponse>(`${BASE_URL}/everything`, {
        params: {
          apiKey: API_KEY,
          q: query,
          sortBy: 'publishedAt',
          pageSize: 20,
          language: 'en',
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
        },
      });

      const articles = response.data.articles.filter(article => 
        article.title && 
        article.description && 
        article.title !== '[Removed]' &&
        article.urlToImage // Only include articles with images
      );

      console.log(`Found ${articles.length} articles for query: "${query}"`);
      return articles;
    } catch (error) {
      console.error('Error searching news:', error);
      throw new Error(`Failed to search news: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get news based on sentiment keywords for weather-based filtering
  async getNewsBySentiment(sentiment: 'depressing' | 'fear' | 'winning' | 'happiness'): Promise<NewsArticle[]> {
    const queries = {
      depressing: 'crisis OR recession OR unemployment OR bankruptcy OR decline OR failure',
      fear: 'threat OR danger OR warning OR alert OR emergency OR security OR terror',
      winning: 'victory OR success OR achievement OR breakthrough OR triumph OR win OR milestone',
      happiness: 'celebration OR festival OR joy OR positive OR award OR honor OR achievement OR good news'
    };

    try {
      console.log(`Fetching ${sentiment} news using keywords: ${queries[sentiment]}`);
      const articles = await this.searchNews(queries[sentiment]);
      
      // Add sentiment tag to articles
      const sentimentArticles = articles.slice(0, 10).map(article => ({
        ...article,
        sentiment,
      }));

      console.log(`Found ${sentimentArticles.length} ${sentiment} articles`);
      return sentimentArticles;
    } catch (error) {
      console.error(`Error fetching ${sentiment} news:`, error);
      throw new Error(`Failed to fetch ${sentiment} news: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};