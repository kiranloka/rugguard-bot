import { config } from 'dotenv';
import { TriggerListener } from './triggerListener';
import { AccountAnalysis } from './accountAnalysis';
import { TrustedAccounts } from './trustedAccounts';
import { ReplySystem } from './replySystem';

config();

const apiKey = process.env.TWITTER_API_KEY!;
const apiSecret = process.env.TWITTER_API_SECRET!;
const accessToken = process.env.TWITTER_ACCESS_TOKEN!;
const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET!;
const botScreenName = process.env.BOT_SCREEN_NAME!;

async function main() {
  const triggerListener = new TriggerListener(apiKey, apiSecret, accessToken, accessTokenSecret, botScreenName);
  const accountAnalysis = new AccountAnalysis(apiKey, apiSecret, accessToken, accessTokenSecret);
  const trustedAccounts = new TrustedAccounts(apiKey, apiSecret, accessToken, accessTokenSecret);
  const replySystem = new ReplySystem(apiKey, apiSecret, accessToken, accessTokenSecret);

  const processedTweets = new Set<string>();

  while (true) {
    try {
      const triggeredTweets = await triggerListener.getTriggeredTweets();
      for (const item of triggeredTweets) {
        if (processedTweets.has(item.reply_tweet_id)) continue;

        const analysis = await accountAnalysis.analyzeAccount(item.original_author_id);
        const trustedFollowers = await trustedAccounts.checkTrustedFollowers(item.original_author_id);
        const report = replySystem.generateReport(analysis, trustedFollowers);
        await replySystem.postReply(item.reply_tweet_id, report);

        processedTweets.add(item.reply_tweet_id);
      }
    } catch (error) {
      console.error('Error in main loop:', error);
    }
    await new Promise(resolve => setTimeout(resolve, 60_000)); // Poll every 60 seconds
  }
}

main().catch(console.error);
