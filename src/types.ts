export interface AnalysisResult{
  screen_name:string;
  account_age_days:number;
  follower_following_ratio:number;
  bio:string;
  bio_length:number;
  engagement:{
    avg_likes:number;
    avg_retweets:number;
    reply_frequency:number;
  }
  sentiment:number;
}


export interface TriggeredTweet{
  reply_tweet_id:string;
  original_author_id:string;
  original_screen_name:string;
}
