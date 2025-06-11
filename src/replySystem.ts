import { TwitterApi } from 'twitter-api-v2';
import { AnalysisResult } from './types';

export class ReplySystem {
  private client: TwitterApi;

  constructor(apiKey: string, apiSecret: string, accessToken: string, accessTokenSecret: string) {
    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });
  }

  generateReport(analysis: AnalysisResult | null, trustedFollowers: boolean): string {
    if (!analysis) return 'Error: Unable to analyze account.';

    let score = 0;
    let report = `Trustworthiness Report for @${analysis.screen_name}:\n`;

    // Account age
    if (analysis.account_age_days > 365) {
      score += 30;
      report += '- Account age: Over 1 year (Positive)\n';
    } else {
      report += '- Account age: Less than 1 year (Neutral)\n';
    }

    // Follower/following ratio
    if (analysis.follower_following_ratio > 1) {
      score += 20;
      report += '- Follower/Following ratio: High (Positive)\n';
    } else {
      report += '- Follower/Following ratio: Low (Neutral)\n';
    }

    // Bio length
    if (analysis.bio_length > 10) {
      score += 10;
      report += '- Bio: Descriptive (Positive)\n';
    } else {
      report += '- Bio: Short or missing (Neutral)\n';
    }

    // Engagement
    if (analysis.engagement.avg_likes > 10) {
      score += 15;
      report += '- Engagement: High likes (Positive)\n';
    } else {
      report += '- Engagement: Low likes (Neutral)\n';
    }

    // Sentiment
    if (analysis.sentiment > 0) {
      score += 15;
      report += '- Tweet sentiment: Positive\n';
    } else {
      report += '- Tweet sentiment: Neutral or negative\n';
    }

    // Trusted followers
    if (trustedFollowers) {
      score += 10;
      report += '- Followed by trusted accounts: Yes (Positive)\n';
    } else {
      report += '- Followed by trusted accounts: No (Neutral)\n';
    }

    report += `- Trust Score: ${score}/100`;
    return report;
  }

  async postReply(replyTweetId: string, report: string): Promise<void> {
    try {
      await this.client.v2.tweet({
        text: report,
        reply: { in_reply_to_tweet_id: replyTweetId },
      });
      console.log('Reply posted successfully');
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  }
}
