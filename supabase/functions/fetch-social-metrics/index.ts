
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SocialMetrics {
  twitter: { followers: number; error?: string };
  telegram: { members: number; error?: string };
  linkedin: { followers: number; error?: string };
}

async function fetchTwitterFollowers(): Promise<{ followers: number; error?: string }> {
  try {
    // Using Twitter API v2 - requires Bearer Token
    const bearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
    
    if (!bearerToken) {
      console.warn('Twitter Bearer Token not found');
      return { followers: 0, error: 'API key not configured' };
    }

    const response = await fetch(
      'https://api.twitter.com/2/users/by/username/Aura_bnb?user.fields=public_metrics',
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    const followers = data.data?.public_metrics?.followers_count || 0;
    
    console.log('Twitter followers fetched:', followers);
    return { followers };

  } catch (error) {
    console.error('Error fetching Twitter followers:', error);
    return { followers: 0, error: 'Failed to fetch' };
  }
}

async function fetchTelegramMembers(): Promise<{ members: number; error?: string }> {
  try {
    // Using Telegram Bot API
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID'); // The chat ID for the group
    
    if (!botToken || !chatId) {
      console.warn('Telegram credentials not found');
      return { members: 0, error: 'API credentials not configured' };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMemberCount?chat_id=${chatId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const data = await response.json();
    const members = data.result || 0;
    
    console.log('Telegram members fetched:', members);
    return { members };

  } catch (error) {
    console.error('Error fetching Telegram members:', error);
    return { members: 0, error: 'Failed to fetch' };
  }
}

async function fetchLinkedInFollowers(): Promise<{ followers: number; error?: string }> {
  try {
    // LinkedIn API is more complex and requires OAuth
    // For now, we'll use a placeholder or scraping approach
    const accessToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');
    
    if (!accessToken) {
      console.warn('LinkedIn access token not found');
      return { followers: 0, error: 'API token not configured' };
    }

    // LinkedIn Company API
    const response = await fetch(
      'https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:aura-bnb',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    const data = await response.json();
    const followers = data.elements?.[0]?.followerCounts?.organicFollowerCount || 0;
    
    console.log('LinkedIn followers fetched:', followers);
    return { followers };

  } catch (error) {
    console.error('Error fetching LinkedIn followers:', error);
    return { followers: 0, error: 'Failed to fetch' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Fetching social media metrics...');

    const [twitter, telegram, linkedin] = await Promise.all([
      fetchTwitterFollowers(),
      fetchTelegramMembers(),
      fetchLinkedInFollowers()
    ]);

    const metrics: SocialMetrics = {
      twitter,
      telegram,
      linkedin
    };

    console.log('All metrics fetched:', metrics);

    return new Response(
      JSON.stringify(metrics),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in social metrics function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
