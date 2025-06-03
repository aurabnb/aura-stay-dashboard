# 🔗 API Setup Guide for Real-time Community Metrics

## Overview

This guide explains how to set up API integrations for fetching real-time community metrics from X (Twitter), Telegram, and LinkedIn.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Social Media API Keys for Real-time Community Metrics
TWITTER_BEARER_TOKEN="your_twitter_bearer_token_here"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"  
LINKEDIN_ACCESS_TOKEN="your_linkedin_access_token_here"
```

## 🐦 Twitter/X API Setup

### 1. Create Twitter Developer Account
- Go to [https://developer.twitter.com/](https://developer.twitter.com/)
- Apply for a developer account
- Create a new project/app

### 2. Generate Bearer Token
- In your Twitter app dashboard, go to "Keys and tokens"
- Generate a "Bearer Token"
- Add to `.env.local` as `TWITTER_BEARER_TOKEN`

### 3. API Endpoints Used
- `GET /2/users/by/username/{username}?user.fields=public_metrics`
- Fetches follower count for @aura_bnb

### Rate Limits
- 300 requests per 15-minute window
- Component caches data for 5 minutes

## 📱 Telegram API Setup

### 1. Create Telegram Bot
- Message [@BotFather](https://t.me/botfather) on Telegram
- Send `/newbot` and follow instructions
- Save the bot token provided

### 2. Add Bot to Channel
- Add your bot to the @aura_bnb Telegram channel
- Make it an admin with "View Messages" permission

### 3. API Endpoints Used
- `GET /bot{token}/getChatMemberCount?chat_id=@aura_bnb`
- Fetches member count for Telegram channel

### Rate Limits
- 30 requests per second
- Component caches data for 5 minutes

## 💼 LinkedIn API Setup

### 1. Create LinkedIn App
- Go to [https://developer.linkedin.com/](https://developer.linkedin.com/)
- Create a new app for your company page
- Request access to "Marketing Developer Platform"

### 2. Generate Access Token
- Use OAuth 2.0 flow to generate access token
- Scope needed: `r_organization_social`
- Add to `.env.local` as `LINKEDIN_ACCESS_TOKEN`

### 3. API Endpoints Used
- `GET /v2/organizations/{companyId}?fields=followersCount`
- Fetches follower count for company page

### Rate Limits
- 500 requests per day for basic access
- Component caches data for 5 minutes

## 🔄 How It Works

### 1. API Route (`/api/community-metrics`)
- Fetches data from all 3 platforms concurrently
- Stores historical data in PostgreSQL for growth calculations
- Returns current metrics + growth percentages
- Includes fallback data if APIs fail

### 2. Frontend Component
- Fetches data every 5 minutes automatically
- Manual refresh button for immediate updates
- Shows online/offline status
- Graceful fallback to cached data on errors

### 3. Database Storage
- `CommunityMetrics` table stores historical data
- Growth percentages calculated from previous data points
- Enables trend analysis and chart generation

## 📊 Real-time Features

### Auto-refresh
- Component refreshes every 5 minutes
- Network status detection (online/offline)
- Automatic retry on network reconnection

### Error Handling
- Graceful fallback to cached/default data
- Visual indicators for API status
- Error messages for debugging

### Performance
- API responses cached for 5 minutes
- Concurrent API calls for faster loading
- Database indexing for historical queries

## 🚀 Deployment Considerations

### Production Setup
1. Use production API credentials
2. Set proper CORS headers for APIs
3. Monitor API rate limits
4. Set up error alerting

### Environment Variables
```bash
# Production values
TWITTER_BEARER_TOKEN="prod_bearer_token"
TELEGRAM_BOT_TOKEN="prod_bot_token"
LINKEDIN_ACCESS_TOKEN="prod_access_token"
```

### Database Migration
Run this to add the community metrics table:

```bash
npx prisma db push
```

## 🛠️ Troubleshooting

### Common Issues

1. **Twitter API 401 Error**
   - Check bearer token is valid
   - Ensure account has access to API v2

2. **Telegram Bot Can't Access Channel**
   - Add bot to channel as admin
   - Ensure channel is public or bot has permissions

3. **LinkedIn API 403 Error**
   - Verify access token scope includes `r_organization_social`
   - Check if app has access to Marketing Developer Platform

4. **Database Errors**
   - Run `npx prisma generate` to update client
   - Ensure `CommunityMetrics` table exists

### Debug Mode
Add this to see API responses:
```bash
DEBUG=api:community-metrics npm run dev
```

## 📈 Metrics Available

### Real-time Data
- **Twitter**: Follower count, growth rate
- **Telegram**: Member count, growth rate  
- **LinkedIn**: Follower count, growth rate

### Calculated Metrics
- Total community size across platforms
- Average growth rate
- Platform-specific growth trends
- Historical data for charts

## 🔒 Security Best Practices

1. **API Keys**
   - Never commit API keys to git
   - Use environment variables only
   - Rotate keys regularly

2. **Rate Limiting**
   - Respect API rate limits
   - Implement exponential backoff
   - Cache responses appropriately

3. **Error Handling**
   - Don't expose API errors to users
   - Log errors for monitoring
   - Provide meaningful fallbacks

## 📋 Testing

### Manual Testing
1. Check `/api/community-metrics` endpoint
2. Verify component shows live data
3. Test offline/online behavior
4. Confirm auto-refresh functionality

### Monitoring
- Set up alerts for API failures
- Monitor response times
- Track growth calculation accuracy

---

**✅ Result**: 100% real-time community metrics with automatic updates, error handling, and seamless fallbacks! 