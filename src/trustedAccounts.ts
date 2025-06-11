import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';

export class TrustedAccounts {
  private client: TwitterApi;
  private trustedListUrl: string = 'https://raw.githubusercontent.com/devsyrem/turst-list/main/list';

  constructor(apiKey: string, apiSecret: string, accessToken: string, accessTokenSecret: string) {
    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });
  }

  async checkTrustedFollowers(userId: string): Promise<boolean> {
    try {
      const response = await axios.get(this.trustedListUrl);
      const trustedIds: string[] = response.data.split('\n').filter((id: string) => id.trim());
      let trustedCount = 0;

      for (const trustedId of trustedIds) {
        try {
          const friendship = await this.client.v2.userFollowedBy(trustedId, { target_user_id: userId });
          if (friendship.data.following) trustedCount++;
          if (trustedCount >= 2) return true;
        } catch (error) {
          console.error(`Error checking friendship for ${trustedId}:`, error);
        }
      }
      return false;
    } catch (error) {
      console.error('Error fetching trusted accounts:', error);
      return false;
    }
  }
}
