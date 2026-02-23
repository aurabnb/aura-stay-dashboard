import { google } from 'googleapis'

// Google Sheets configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// For development, we'll use a simplified approach
// In production, you should use service account credentials

export class GoogleAuthService {
  private oauth2Client: any
  private authenticated: boolean = false

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/auth/google/callback' // Callback URL
    )
  }

  // Generate authentication URL for OAuth flow
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.readonly'
    ]

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    })
  }

  // Set credentials using stored tokens
  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens)
    this.authenticated = true
  }

  // Get authenticated sheets client
  getSheetsClient() {
    if (!this.authenticated) {
      // For development, we'll return a mock client
      console.warn('Google Sheets not authenticated, using fallback')
      return null
    }

    return google.sheets({ version: 'v4', auth: this.oauth2Client })
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.authenticated
  }

  // Simple method to test authentication with a basic token
  async authenticateWithToken(accessToken: string, refreshToken?: string) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      
      // Test the connection
      const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client })
      await sheets.spreadsheets.get({
        spreadsheetId: '1CzTl1xO9fIEaV0MePMBWnUYaj9rp1i85l7_DtA8SLnk'
      })
      
      this.authenticated = true
      return true
    } catch (error) {
      console.error('Authentication failed:', error)
      this.authenticated = false
      return false
    }
  }
}

export const googleAuthService = new GoogleAuthService()

// Alternative: Simple function-based approach for testing
export async function createSheetsClient() {
  try {
    const auth = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET
    )

    // For development/testing - in production you'd handle this properly
    // You can manually set tokens here for testing:
    // auth.setCredentials({
    //   access_token: 'your_access_token_here',
    //   refresh_token: 'your_refresh_token_here'
    // })

    return google.sheets({ version: 'v4', auth })
  } catch (error) {
    console.error('Error creating sheets client:', error)
    return null
  }
} 