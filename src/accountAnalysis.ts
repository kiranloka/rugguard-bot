import { TwitterApi, UserV2, TweetV2 } from 'twitter-api-v2';
import { differenceInDays } from 'date-fns';
import { Sentiment } from 'sentiment';
import { AnalysisResult } from './types';

export class AccountAnalysis {
  private client: TwitterApi;
  private sentiment: Sentiment;

  constructor(apiKey: string, apiSecret: string, accessToken: string, accessTokenSecret: string) {
    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });
    this.sentiment = new Sentiment();
  }

  async analyzeAccount(userId: string): Promise<AnalysisResult | null> {
    try {
      const user = await this.client.v2.user(userId, {
        'user.fields': ['created_at', 'public_metrics', 'description'],
      });
      if (!user.data) return null;

      const tweets = await this.client.v2.userTimeline(userId, {
        max_results: 20,
        'tweet.fields': ['public_metrics', 'in_reply_to_status_id'],
      });

      let totalLikes = 0, totalRetweets = 0, replyCount = 0, tweetText = '';
      let tweetCount = 0;

      for await (const tweet of tweets) {
        totalLikes += tweet.public_metrics?.like_count || 0;
        totalRetweets += tweet.public_metrics?.retweet_count || 0;
        if (tweet.in_reply_to_status_id) replyCount++;
        if (!tweet.text.startsWith('RT ')) tweetText += tweet.text + ' ';
        tweetCount++;
      }

      const sentimentResult = this.sentiment.analyze(tweetText);
      const analysis: AnalysisResult = {
        screen_name: user.data.username,
        account_age_days: differenceInDays(new Date(), new Date(user.data.created_at || Date.now())),
        follower_following_ratio: (user.data.public_metrics?.followers_count || 0) / Math.max(user.data.public_metrics?.following_count || 1, 1),
        bio: user.data.description || '',
        bio_length: user.data.description?.length || 0,
        engagement: {
          avg_likes: tweetCount ? totalLikes / tweetCount : 0,
          avg_retweets: tweetCount ? totalRetweets / tweetCount : 0,
          reply_frequency: tweetCount ? replyCount / tweetCount : 0,
        },
        sentiment: sentimentResult.score,
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing account:', error);
      return null;
    }
  }
}
