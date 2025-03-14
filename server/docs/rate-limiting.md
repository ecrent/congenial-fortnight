# Rate Limiting Documentation

This document explains the rate limiting configuration implemented in the Meeting Time Finder application.

## Overview

Rate limiting helps protect our API from abuse and ensures fair resource allocation. It prevents malicious attacks like brute force attempts and helps maintain server stability under heavy loads.

## Implemented Rate Limits

| Route Type | Time Window | Max Requests | Notes |
|------------|-------------|--------------|-------|
| Authentication | 1 minute | 5 | Login and registration endpoints |
| Admin Routes | 1 minute | 30 | All admin-related operations |
| General API | 1 minute | 100 | All other API routes |

## Rate Limit Headers

When rate limiting is active, the following headers are included in API responses:

- `RateLimit-Limit`: Maximum number of requests allowed in the window
- `RateLimit-Remaining`: Number of requests remaining in the current window
- `RateLimit-Reset`: Time when the rate limit window resets (in seconds)

## Rate Limit Exceeded Response

When a client exceeds the rate limit, they will receive:

- HTTP Status: `429 Too Many Requests`
- JSON Response:
  ```json
  {
    "status": "error",
    "message": "Too many requests, please try again later.",
    "details": "Rate limit exceeded"
  }
  ```

## Implementation Details

Rate limiting is implemented using the `express-rate-limit` package. Each limiter is configured in `middleware/rateLimiter.js` and applied to routes in `index.js`.

Rate limits are applied per IP address. In a production environment with a load balancer or reverse proxy, make sure to properly configure the `trustProxy` setting.

## Testing

Rate limiting is disabled in test environments to avoid interfering with automated tests.
