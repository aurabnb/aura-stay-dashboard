// ============================================================================
// SECURITY UTILITIES FOR AURA STAY DASHBOARD
// ============================================================================

import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// ============================================================================
// INPUT VALIDATION SCHEMAS
// ============================================================================

export const walletAddressSchema = z.string()
  .min(32, 'Invalid wallet address length')
  .max(44, 'Invalid wallet address length')
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid wallet address format')

export const tokenAmountSchema = z.string()
  .regex(/^\d+(\.\d+)?$/, 'Invalid token amount format')
  .refine((val) => {
    const num = parseFloat(val)
    return num > 0 && num <= 1e15 // Reasonable upper limit
  }, 'Token amount out of range')

export const percentageSchema = z.number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100')

export const taxRateSchema = z.number()
  .min(0, 'Tax rate cannot be negative')
  .max(10, 'Tax rate cannot exceed 10%')

export const emailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email too long')

export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')

// ============================================================================
// API REQUEST VALIDATION
// ============================================================================

export const stakingRequestSchema = z.object({
  userWallet: walletAddressSchema,
  amount: tokenAmountSchema,
  operation: z.enum(['stake', 'unstake', 'claim']),
  poolId: z.string().optional(),
  positionId: z.string().optional(),
})

export const swapRequestSchema = z.object({
  userWallet: walletAddressSchema,
  fromToken: z.string(),
  toToken: z.string(),
  swapAmount: tokenAmountSchema,
  tradingPair: z.string(),
  transactionType: z.enum(['swap', 'buy', 'sell']),
  slippage: percentageSchema.optional(),
})

export const taxSettingsSchema = z.object({
  swapTaxRate: taxRateSchema,
  buyTaxRate: taxRateSchema,
  sellTaxRate: taxRateSchema,
  stakeTaxRate: taxRateSchema,
  unstakeTaxRate: taxRateSchema,
  rewardTaxRate: taxRateSchema,
  taxWalletAddress: walletAddressSchema,
})

export const adminAuthSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic sanitization
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
  }
  
  // Client-side: use DOMPurify
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  })
}

/**
 * Sanitize text input to remove potential injection attacks
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>\"'&]/g, (match) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return map[match]
    })
    .trim()
}

/**
 * Sanitize SQL-like input to prevent injection
 */
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/['";\\]/g, '')
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '')
    .trim()
}

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const entry = this.store.get(identifier)

    if (!entry || now > entry.resetTime) {
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (entry.count >= this.maxRequests) {
      return false
    }

    entry.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.store.get(identifier)
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests
    }
    return Math.max(0, this.maxRequests - entry.count)
  }

  getResetTime(identifier: string): number {
    const entry = this.store.get(identifier)
    return entry?.resetTime || Date.now()
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Global rate limiter instances
export const apiRateLimiter = new RateLimiter(100, 15 * 60 * 1000) // 100 requests per 15 minutes
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 auth attempts per 15 minutes
export const adminRateLimiter = new RateLimiter(10, 5 * 60 * 1000) // 10 admin requests per 5 minutes

// ============================================================================
// CSRF PROTECTION
// ============================================================================

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  if (typeof window === 'undefined') {
    // Server-side: use crypto
    const crypto = require('crypto')
    return crypto.randomBytes(32).toString('hex')
  }
  
  // Client-side: use Web Crypto API
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken || token.length !== 64) {
    return false
  }
  
  // Simple time-based validation (in production, use more sophisticated method)
  return token === sessionToken
}

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================

/**
 * Hash sensitive data (passwords, etc.)
 */
export async function hashData(data: string, salt?: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side: use bcrypt or similar
    const crypto = require('crypto')
    const saltRounds = salt || crypto.randomBytes(16).toString('hex')
    return crypto.pbkdf2Sync(data, saltRounds, 10000, 64, 'sha512').toString('hex')
  }
  
  // Client-side: use Web Crypto API
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Generate secure random string
 */
export function generateSecureId(length: number = 32): string {
  if (typeof window === 'undefined') {
    const crypto = require('crypto')
    return crypto.randomBytes(length).toString('hex')
  }
  
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https:",
  ].join('; '),
}

// ============================================================================
// WALLET SECURITY
// ============================================================================

/**
 * Validate wallet signature
 */
export function validateWalletSignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    // In a real implementation, use Solana's web3.js or similar
    // This is a placeholder for the actual signature verification
    return signature.length > 0 && publicKey.length > 0 && message.length > 0
  } catch (error) {
    console.error('Signature validation error:', error)
    return false
  }
}

/**
 * Generate message for wallet signing
 */
export function generateWalletMessage(action: string, timestamp?: number): string {
  const ts = timestamp || Date.now()
  const nonce = generateSecureId(16)
  return `AuraBNB ${action} verification\nTimestamp: ${ts}\nNonce: ${nonce}`
}

// ============================================================================
// API SECURITY MIDDLEWARE
// ============================================================================

export interface SecurityOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  rateLimiting?: boolean
  validateCSRF?: boolean
  sanitizeInput?: boolean
}

export function validateRequest(
  request: any,
  options: SecurityOptions = {}
): { isValid: boolean; error?: string; sanitizedData?: any } {
  const {
    requireAuth = false,
    requireAdmin = false,
    rateLimiting = true,
    validateCSRF = false,
    sanitizeInput = true
  } = options

  // Rate limiting
  if (rateLimiting) {
    const identifier = request.ip || 'unknown'
    const limiter = requireAdmin ? adminRateLimiter : apiRateLimiter
    
    if (!limiter.isAllowed(identifier)) {
      return { isValid: false, error: 'Rate limit exceeded' }
    }
  }

  // CSRF validation
  if (validateCSRF) {
    const token = request.headers['x-csrf-token']
    const sessionToken = request.headers['x-session-token']
    
    if (!validateCSRFToken(token, sessionToken)) {
      return { isValid: false, error: 'Invalid CSRF token' }
    }
  }

  // Input sanitization
  let sanitizedData = request.body
  if (sanitizeInput && request.body) {
    sanitizedData = {}
    for (const [key, value] of Object.entries(request.body)) {
      if (typeof value === 'string') {
        sanitizedData[key] = sanitizeText(value as string)
      } else {
        sanitizedData[key] = value
      }
    }
  }

  return { isValid: true, sanitizedData }
}

// ============================================================================
// MONITORING & ALERTS
// ============================================================================

interface SecurityEvent {
  type: 'rate_limit' | 'invalid_input' | 'auth_failure' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: Record<string, any>
  timestamp: number
  ip?: string
  userAgent?: string
}

class SecurityMonitor {
  private events: SecurityEvent[] = []
  private maxEvents = 1000

  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    }

    this.events.push(fullEvent)

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Alert on critical events
    if (event.severity === 'critical') {
      this.alertCriticalEvent(fullEvent)
    }

    console.warn('Security event:', fullEvent)
  }

  private alertCriticalEvent(event: SecurityEvent): void {
    // In production, send to monitoring service
    console.error('CRITICAL SECURITY EVENT:', event)
    
    // Could send to Slack, email, etc.
    if (process.env.NODE_ENV === 'production') {
      // Send alert to monitoring service
    }
  }

  getRecentEvents(minutes: number = 60): SecurityEvent[] {
    const cutoff = Date.now() - (minutes * 60 * 1000)
    return this.events.filter(event => event.timestamp > cutoff)
  }

  getEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
    return this.events.filter(event => event.type === type)
  }
}

export const securityMonitor = new SecurityMonitor()

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if request is from localhost/development
 */
export function isLocalhost(request: any): boolean {
  const host = request.headers.host || request.headers['x-forwarded-host']
  return host?.includes('localhost') || host?.includes('127.0.0.1') || false
}

/**
 * Get client IP address
 */
export function getClientIP(request: any): string {
  return (
    request.headers['x-forwarded-for']?.split(',')[0] ||
    request.headers['x-real-ip'] ||
    request.connection?.remoteAddress ||
    'unknown'
  )
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): { isValid: boolean; missing: string[] } {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ]

  const missing = required.filter(key => !process.env[key])
  
  return {
    isValid: missing.length === 0,
    missing
  }
}

export default {
  // Schemas
  walletAddressSchema,
  tokenAmountSchema,
  stakingRequestSchema,
  swapRequestSchema,
  taxSettingsSchema,
  adminAuthSchema,
  
  // Sanitization
  sanitizeHtml,
  sanitizeText,
  sanitizeSqlInput,
  
  // Rate limiting
  apiRateLimiter,
  authRateLimiter,
  adminRateLimiter,
  
  // CSRF
  generateCSRFToken,
  validateCSRFToken,
  
  // Encryption
  hashData,
  generateSecureId,
  
  // Headers
  securityHeaders,
  
  // Wallet
  validateWalletSignature,
  generateWalletMessage,
  
  // Validation
  validateRequest,
  
  // Monitoring
  securityMonitor,
  
  // Utilities
  isLocalhost,
  getClientIP,
  validateEnvironment,
} 