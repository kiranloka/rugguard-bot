import { TwitterApi,TweetV2,UserV2 } from "twitter-api-v2";
import { TriggeredTweet } from "./types";



export class TriggerListener{
  private client:TwitterApi;
  private botScreenName:string;


  constructor(apiKey:string,apiSecret:string,accessToken:string,accessTokenSecret:string,botScreenName:string){
    this.client=new TwitterApi({
      appKey:apiKey,
      appSecret:apiSecret,
      accessToken:accessToken,
      accessSecret:accessTokenSecret
    });
    this.botScreenName=botScreenName
  }

  async getTriggerTweets():Promise<TriggeredTweet[]>{
    try{
      const query = `to ${this.botScreenName} riddle me this`;
      const tweets=await this.client.v2.search(query,{
        expansions:['in_reply_to_status_id','author_id'],
        'user.fields':['username','id'],
        'tweet.fields':['in_reply_to_user_id']
      })
      const triggered:TriggeredTweet[]=[];

      for (const tweet of tweets){
        if(tweet.text.toLowerCase().includes('riddle me this') && tweet.in_reply_to_status_id){
          const originalTweet=await this.client.v2.singleTweet(tweet.in_reply_to_status_id,{
            expansions:['author_id'],
            'user.fields':['username'],
          });
          const author  = originalTweet.includes?.users?.[0];
          if(author){
            triggered.push({
              reply_tweet_id:tweet.id,
              original_author_id:author.id,
              original_screen_name:author.username
            });

          }

        }
      }
      return triggered;
    }catch(e){
      console.error("Unable to find triggered tweets",e);
      return []
    }
  }
}


