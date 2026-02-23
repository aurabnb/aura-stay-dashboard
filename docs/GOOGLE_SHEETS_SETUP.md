# Google Sheets Integration Setup

This document explains how to set up Google Sheets integration for treasury expense tracking.

## Current Status

✅ **Google API Credentials Added**  
✅ **Google Sheets Service Created**  
✅ **API Routes Implemented**  
✅ **ExpenseTracker Updated**  
⚠️ **OAuth Flow Pending** (Currently using fallback data)

## Credentials Configured

- **Client ID**: `318223185888-6fnjbkaeaommc0ju6luplqoh1ligf0cg.apps.googleusercontent.com`
- **Client Secret**: `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`
- **Spreadsheet ID**: `1CzTl1xO9fIEaV0MePMBWnUYaj9rp1i85l7_DtA8SLnk` (default)

## Environment Variables

Add these to your `.env` file:

```bash
GOOGLE_CLIENT_ID="318223185888-6fnjbkaeaommc0ju6luplqoh1ligf0cg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
GOOGLE_SHEETS_SPREADSHEET_ID="your_actual_spreadsheet_id_here"
```

## Google Sheets Structure

Your Google Sheet should have the following columns (in order):

| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H | Column I |
|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| Date | Description | Category | Amount | Currency | SOL Price | Wallet | Transaction Hash | Status |

### Example Data:

```
Date          | Description              | Category      | Amount | Currency | SOL Price | Wallet | Transaction Hash | Status
2024-01-15    | Marketing Campaign Q1    | Marketing     | 5000   | USDC     |           |        |                  | confirmed
2024-01-12    | Development Infrastructure| Operations    | 15.5   | SOL      | 150.25    |        |                  | confirmed
2024-01-10    | Legal Consultation       | Business Costs| 3500   | USDC     |           |        |                  | confirmed
```

## Setting Up OAuth Flow

### Step 1: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Enable the Google Sheets API
4. Configure OAuth consent screen
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://your-domain.vercel.app/api/auth/google/callback` (production)

### Step 2: Get Access Tokens

For development, you can use the Google OAuth2 Playground:

1. Go to [OAuth2 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon and check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In Step 1, select "Google Sheets API v4" scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive.readonly`
5. Authorize APIs and get your access and refresh tokens

### Step 3: Store Tokens Securely

Add these to your `.env` file:

```bash
GOOGLE_ACCESS_TOKEN="your_access_token_here"
GOOGLE_REFRESH_TOKEN="your_refresh_token_here"
```

## API Endpoints

### Get Treasury Expenses
```bash
GET /api/treasury-expenses?type=expenses
```

### Get Treasury Summary
```bash
GET /api/treasury-expenses?type=summary
```

### Add New Expense
```bash
POST /api/treasury-expenses
Content-Type: application/json

{
  "date": "2024-01-15",
  "description": "New expense",
  "category": "Operations",
  "amount": 1000,
  "currency": "USDC",
  "status": "confirmed"
}
```

## Current Behavior

Until OAuth is properly configured, the system:

1. **Attempts** to fetch from Google Sheets API
2. **Falls back** to realistic mock data if API fails
3. **Logs** informative messages about the fallback
4. **Maintains** full functionality for development

## Fallback Data

The system includes realistic fallback data:

- Marketing Campaign expenses
- Development infrastructure costs
- Legal and compliance fees
- Smart contract audits
- Community rewards

## Next Steps

1. **Configure OAuth flow** using the provided credentials
2. **Test connection** to your Google Sheet
3. **Add real data** to your spreadsheet
4. **Verify integration** in the user dashboard

## Troubleshooting

### Common Issues

1. **"Failed to fetch treasury expenses"**
   - Check if Google Sheets API is enabled
   - Verify credentials are correct
   - Ensure spreadsheet ID is valid

2. **"Authentication failed"**
   - Check OAuth tokens are valid
   - Verify redirect URI is configured
   - Ensure proper scopes are granted

3. **"No data found in Google Sheets"**
   - Check spreadsheet structure matches expected format
   - Verify sheet name (default: "Sheet1")
   - Ensure data starts from row 2 (row 1 is headers)

### Debug Mode

The service logs detailed information:

```bash
# Check browser console for:
- "Google Sheets service initialized"
- "No expenses found in Google Sheets, using fallback data"
- "Falling back to mock data"
```

## Production Deployment

For production on Vercel:

1. Add environment variables to Vercel dashboard
2. Update redirect URI to your production domain
3. Consider using service account for server-to-server auth
4. Implement proper token refresh logic

## Security Notes

- Never commit tokens to version control
- Use environment variables for all sensitive data
- Consider implementing token encryption
- Regularly rotate access tokens
- Monitor API usage and set up quotas 