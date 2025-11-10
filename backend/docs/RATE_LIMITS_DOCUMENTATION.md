# Rate Limits Documentation

This document provides a comprehensive overview of all rate limiting configurations in the SmartMess application, including their locations, codes, and purposes.

## Overview

Rate limiting is implemented to prevent abuse, ensure fair usage, and maintain system stability. The application uses multiple rate limiters for different types of operations.

## Rate Limit Configuration Files

### 1. Main Security Middleware
**File:** `backend/src/middleware/security.ts`
**Purpose:** Primary rate limiting for all API endpoints

#### General Rate Limiter
- **Code:** `generalRateLimiter`
- **Window:** 15 minutes (900,000 ms)
- **Development Limit:** 10,000 requests per window
- **Production Limit:** 1,000 requests per window
- **Message:** "Too many requests from this IP, please try again after 15 minutes"
- **Applied to:** All API routes via `app.use(generalRateLimiter)` in `server.ts`
- **Skip Conditions:** 
  - Health check endpoints (`/health`)
  - Localhost requests in development mode

#### Auth Rate Limiter
- **Code:** `authRateLimiter`
- **Window:** 15 minutes (900,000 ms)
- **Development Limit:** 100 requests per window
- **Production Limit:** 20 requests per window
- **Message:** "Too many authentication attempts, please try again after 15 minutes"
- **Key Generator:** IP address + email combination
- **Applied to:** Authentication endpoints (login, register, password reset)

### 2. Specialized Rate Limiters
**File:** `backend/src/middleware/rateLimiter.ts`
**Purpose:** Specific rate limiters for different operation types

#### API Rate Limiter
- **Code:** `apiLimiter`
- **Window:** 15 minutes (from CONFIG.RATE_LIMIT.WINDOW_MS)
- **Development Limit:** 10,000 requests per window
- **Production Limit:** 1,000 requests per window (from CONFIG.RATE_LIMIT.MAX_REQUESTS)
- **Message:** "Too many requests from this IP, please try again later."
- **Applied to:** General API endpoints

#### OTP Rate Limiter
- **Code:** `otpLimiter`
- **Window:** 1 hour (3,600,000 ms)
- **Development Limit:** 100 requests per window
- **Production Limit:** 3 requests per window
- **Message:** "Too many OTP requests, please try again later."
- **Applied to:** OTP generation and verification endpoints

#### File Upload Rate Limiter
- **Code:** `uploadLimiter`
- **Window:** 15 minutes (900,000 ms)
- **Development Limit:** 1,000 requests per window
- **Production Limit:** 10 requests per window
- **Message:** "Too many file uploads, please try again later."
- **Applied to:** File upload endpoints

### 3. Admin Rate Limiter
**File:** `backend/src/middleware/admin.ts`
**Purpose:** Rate limiting for admin operations

#### Admin Rate Limiter
- **Code:** `adminRateLimiter`
- **Default Window:** 15 minutes (900,000 ms)
- **Default Limit:** 100 requests per window
- **Configurable:** Yes, accepts custom maxRequests and windowMs parameters
- **Applied to:** Admin-specific operations
- **Features:** 
  - Redis-based rate limiting
  - Custom key generation
  - Error handling with fallback

### 4. Configuration Constants
**File:** `backend/src/constants/config.ts`
**Purpose:** Centralized rate limit configuration

```typescript
RATE_LIMIT: {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: process.env.NODE_ENV === 'development' ? 10000 : 1000,
}
```

## Rate Limit Error Responses

All rate limiters return standardized error responses:

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again after 15 minutes",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2025-01-07T12:56:48.000Z"
}
```

**HTTP Status Code:** 429 (Too Many Requests)

## Development vs Production Limits

### Development Mode
- **General API:** 10,000 requests per 15 minutes
- **Authentication:** 100 requests per 15 minutes
- **OTP:** 100 requests per hour
- **File Upload:** 1,000 requests per 15 minutes
- **Admin:** 100 requests per 15 minutes
- **Localhost Skip:** Enabled (no rate limiting for localhost)

### Production Mode
- **General API:** 1,000 requests per 15 minutes
- **Authentication:** 20 requests per 15 minutes
- **OTP:** 3 requests per hour
- **File Upload:** 10 requests per 15 minutes
- **Admin:** 100 requests per 15 minutes
- **Localhost Skip:** Disabled

## Rate Limit Headers

The application includes standard rate limit headers in responses:

- `X-RateLimit-Limit`: Maximum requests allowed per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Timestamp when the rate limit resets
- `Retry-After`: Seconds to wait before retrying (when rate limited)

## Implementation Details

### Key Generation
- **General/Auth:** IP address
- **Auth (specific):** IP address + email combination
- **Admin:** Custom key based on operation type

### Skip Conditions
1. **Health Checks:** `/health` endpoint
2. **Development Localhost:** 127.0.0.1, ::1, ::ffff:127.0.0.1
3. **Admin Operations:** Custom skip logic based on operation type

### Logging
All rate limit violations are logged with:
- IP address
- User agent
- Request URL
- Timestamp
- User ID (if available)

## Environment Variables

Rate limits can be configured via environment variables:

```bash
# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=1000 # Maximum requests per window

# Node environment
NODE_ENV=development  # or production
```

## Monitoring and Alerts

Rate limit violations are monitored through:
1. **Application Logs:** Warning level logs for rate limit violations
2. **Error Tracking:** Standardized error responses with codes
3. **Metrics:** Request count and rate limit hit ratios

## Best Practices

1. **Graceful Degradation:** Rate limiters include fallback mechanisms
2. **User-Friendly Messages:** Clear error messages with retry information
3. **Development-Friendly:** Higher limits and localhost skipping in development
4. **Security-Focused:** Stricter limits for authentication and sensitive operations
5. **Configurable:** Environment-based configuration for different deployments

## Troubleshooting

### Common Issues

1. **429 Errors in Development:**
   - Check if NODE_ENV is set to 'development'
   - Verify localhost IP detection
   - Check if rate limiter is properly configured

2. **Rate Limits Too Restrictive:**
   - Adjust limits in configuration files
   - Update environment variables
   - Consider implementing user-based rate limiting

3. **Rate Limits Not Working:**
   - Verify middleware order in server.ts
   - Check if rate limiters are properly imported
   - Ensure Redis connection (for admin rate limiter)

### Debug Commands

```bash
# Check current rate limit configuration
curl -I http://localhost:5000/api/health

# Test rate limiting
for i in {1..10}; do curl -I http://localhost:5000/api/test; done

# Check rate limit headers
curl -v http://localhost:5000/api/endpoint
```

## Future Enhancements

1. **User-Based Rate Limiting:** Implement per-user rate limits
2. **Dynamic Rate Limiting:** Adjust limits based on system load
3. **Rate Limit Analytics:** Dashboard for monitoring rate limit usage
4. **Whitelist/Blacklist:** IP-based allow/deny lists
5. **Rate Limit Bypass:** Admin override capabilities

---

**Last Updated:** January 7, 2025
**Version:** 1.0.0
**Maintainer:** SmartMess Development Team
