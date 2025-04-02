# LinkRio System Architecture

This document outlines the system architecture, workflow, and key components of the LinkRio URL shortener application.

## System Overview

LinkRio is a full-stack URL shortening application with:

- Frontend: React/TypeScript single-page application
- Backend: Node.js/Express REST API
- Database: PostgreSQL for data persistence
- Cache: Redis for performance optimization

## System Flow

### 1. Authentication Flow

```
┌─────────────┐    1. Login/Register    ┌─────────────┐
│             │───────────────────────▶│             │
│   Frontend  │                         │   Backend   │
│             │◀───────────────────────│             │
└─────────────┘    2. JWT Token         └─────────────┘
        │                                      │
        │ 3. Store Token                       │ 4. Verify User
        ▼                                      ▼
┌─────────────┐                         ┌─────────────┐
│  LocalStorage│                         │  Database   │
└─────────────┘                         └─────────────┘
```

**Implementation:**

- Frontend: `src/pages/Login.tsx`, `src/pages/Register.tsx`
- Backend: `src/controllers/auth.js`
- Auth middleware: `src/middleware/auth.js`

### 2. URL Shortening Flow

```
┌─────────────┐    1. Create URL      ┌─────────────┐
│             │───────────────────────▶│             │
│   Frontend  │                         │   Backend   │
│             │◀───────────────────────│             │
└─────────────┘    2. Short URL         └─────────────┘
                                                │
                                                │ 3. Store URL
                                                ▼
                                         ┌─────────────┐
                                         │  Database   │
                                         └─────────────┘
```

**Implementation:**

- Frontend: `src/pages/Dashboard.tsx` (URL form component)
- Backend: `src/controllers/url.js` (create URL endpoint)

### 3. URL Redirection Flow

```
┌─────────────┐    1. Visit Short URL   ┌─────────────┐
│             │───────────────────────▶│             │
│    User     │                         │   Backend   │
│    Browser  │◀───────────────────────│             │
└─────────────┘    2. Redirect to       └─────────────┘
                      Original URL              │
                                                │ 3. Log Analytics
                                                ▼
                                         ┌─────────────┐
                                         │  Database   │
                                         └─────────────┘
```

**Implementation:**

- Backend: `src/controllers/url.js` (redirect endpoint)

### 4. Analytics Flow

```
┌─────────────┐    1. Request Analytics ┌─────────────┐
│             │───────────────────────▶│             │
│   Frontend  │                         │   Backend   │
│             │◀───────────────────────│             │
└─────────────┘    2. Analytics Data    └─────────────┘
        │                                      │
        │ 3. Display Charts                    │ 4. Aggregate Data
        ▼                                      ▼
┌─────────────┐                         ┌─────────────┐
│   Charts    │                         │  Database   │
└─────────────┘                         └─────────────┘
```

**Implementation:**

- Frontend: `src/pages/Analytics.tsx`
- Backend: `src/controllers/url.js` (analytics endpoints)

### 5. Subscription Flow

```
┌─────────────┐    1. Upgrade Request   ┌─────────────┐
│             │───────────────────────▶│             │
│   Frontend  │                         │   Backend   │
│             │◀───────────────────────│             │
└─────────────┘    2. Payment Gateway    └─────────────┘
        │                 Token                │
        │                                      │
        ▼                                      ▼
┌─────────────┐    3. Payment         ┌─────────────┐
│   Midtrans  │───────────────────────▶│   Backend   │
│   Gateway   │      Notification      │  (Webhook)  │
└─────────────┘                        └─────────────┘
                                              │
                                              │ 4. Update Subscription
                                              ▼
                                       ┌─────────────┐
                                       │  Database   │
                                       └─────────────┘
```

**Implementation:**

- Frontend: `src/pages/Dashboard.tsx` (upgrade button), `src/pages/Payment.tsx`
- Backend: `src/controllers/subscription.js`

## Key Components

### Frontend

1. **Pages**

   - `src/pages/Index.tsx`: Landing page
   - `src/pages/Login.tsx` & `src/pages/Register.tsx`: Authentication
   - `src/pages/Dashboard.tsx`: Main user dashboard
   - `src/pages/Analytics.tsx`: URL statistics
   - `src/pages/Payment.tsx`: Payment processing

2. **Components**

   - `src/components/Navbar.tsx`: Global navigation
   - `src/components/URLForm.tsx`: URL shortening form
   - `src/components/URLList.tsx`: List of user's URLs
   - `src/components/SubscriptionBanner.tsx`: Upgrade prompts

3. **State Management**

   - Local state: React useState
   - Shared state: Context API
   - Persistence: localStorage

4. **API Integration**
   - `src/lib/api.ts`: API client
   - `src/utils/fetchWithRetry.ts`: Resilient API requests

### Backend

1. **Controllers**

   - `src/controllers/auth.js`: User authentication
   - `src/controllers/url.js`: URL shortening and analytics
   - `src/controllers/subscription.js`: Payment and subscription

2. **Middleware**

   - `src/middleware/auth.js`: JWT authentication
   - `src/middleware/rateLimit.js`: Request throttling
   - `src/middleware/urlValidator.js`: URL validation

3. **Database**

   - `src/models/`: Database models
   - `migrations/`: Schema migrations

4. **Services**
   - `src/services/paymentGateway.js`: Midtrans integration
   - `src/services/analytics.js`: Analytics processing
   - `src/services/cache.js`: Redis caching

## Data Flow

### URL Creation

1. User submits URL in Dashboard
2. Frontend validates URL format
3. API request sent to `/api/url`
4. Backend validates URL and user subscription
5. Short code generated
6. URL saved to database
7. Response with short URL returned

### URL Analytics Collection

1. User visits shortened URL
2. Backend logs visit details:
   - IP address (for geolocation)
   - User-Agent (for browser/device)
   - Referrer
   - Timestamp
3. Analytics aggregated in database
4. Cached counters updated

### Subscription Management

1. User clicks "Upgrade to Pro"
2. Backend creates payment record
3. Midtrans payment token generated
4. User redirected to payment page
5. Payment completed on Midtrans
6. Webhook notification received
7. Subscription updated in database

## Caching Strategy

1. **URL Redirection Cache**

   - Short URL to original URL mapping
   - Implemented in Redis
   - TTL: 24 hours

2. **Analytics Cache**

   - Click counters
   - Implemented in Redis
   - Flushed to database every 5 minutes

3. **Subscription Status Cache**
   - User subscription details
   - Stored in localStorage
   - TTL: 1 hour

## Error Handling

1. **Frontend**

   - Network error retry mechanism
   - Graceful degradation for offline mode
   - Toast notifications for user feedback

2. **Backend**
   - Standardized error responses
   - Logging with Winston
   - Request validation with Joi

## Security Measures

1. **Authentication**

   - JWT with expiration
   - Refresh token mechanism
   - Password hashing with bcrypt

2. **API Security**

   - CORS configuration
   - Rate limiting
   - Input validation

3. **Payment Security**
   - Server-side verification
   - Secure webhooks with signatures

## Performance Optimizations

1. **Frontend**

   - Code splitting
   - Lazy loading of routes
   - Optimized bundle size

2. **Backend**
   - Connection pooling
   - Query optimization
   - Response compression

## Development Workflow

1. **Local Development**

   - Frontend: `npm run dev`
   - Backend: `npm run dev`

2. **Deployment**
   - CI/CD with GitHub Actions
   - Containerized with Docker
   - Hosting on Railway

## Troubleshooting Common Issues

1. **Authentication Issues**

   - Check token expiration
   - Verify localStorage persistence
   - Check for CORS issues

2. **URL Shortening Issues**

   - Verify URL format validation
   - Check subscription limits
   - Review rate limiting constraints

3. **Payment Issues**
   - Verify Midtrans credentials
   - Check webhook configuration
   - Review payment records in database

## Monitoring and Metrics

1. **Application Monitoring**

   - Server health checks
   - API response times
   - Error rates

2. **Business Metrics**
   - Daily active users
   - URL creation volume
   - Conversion rate to Pro

## Future Improvements

1. **Technical Enhancements**

   - WebSocket for real-time analytics
   - Progressive Web App capabilities
   - Serverless functions for scaling

2. **Feature Roadmap**
   - QR code generation
   - URL expiration options
   - Team collaboration
