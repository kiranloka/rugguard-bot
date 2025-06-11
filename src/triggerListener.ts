import { TwitterApi, TweetV2 } from 'twitter-api-v2';
import { TriggeredTweet } from './types';

export class TriggerListener {
  private client: TwitterApi;
  private botScreenName: string;

  constructor(apiKey: string, apiSecret: string, accessToken: string, accessTokenSecret: string, botScreenName: string) {
    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });
    this.botScreenName = botScreenName;
  }

  async getTriggeredTweets(): Promise<TriggeredTweet[]> {
    try {
      const query = `to:${this.botScreenName} riddle me this`;
      const searchResults =await  this.client.v2.search(query, {
        expansions: ['author_id', 'in_reply_to_user_id'],
        'user.fields': ['username', 'id'],
        'tweet.fields': ['in_reply_to_user_id', 'text', 'author_id'],
      });

      const triggered: TriggeredTweet[] = [];

      for await (const tweet of searchResults) {
        // Ensure text includes trigger phrase and in_reply_to_status_id exists
        if (
          tweet.text.toLowerCase().includes('riddle me this') &&
          tweet.in_reply_to_user_id !== undefined
        ) {
          // Fetch the original tweet
          const originalTweet = await this.client.v2.singleTweet(tweet.in_reply_to_user_id, {
            expansions: ['author_id'],
            'user.fields': ['username', 'id'],
            'tweet.fields': ['author_id'],
          });

          const author = originalTweet.includes?.users?.find(
            (user) => user.id === originalTweet.data.author_id
          );

          if (author && originalTweet.data.author_id) {
            triggered.push({
              reply_tweet_id: tweet.id,
              original_author_id: author.id,
              original_screen_name: author.username,
            });
          }
        }
      }
      return triggered;
    } catch (error) {
      console.error('Error fetching triggered tweets:', error);
      return [];
    }
  }
}
