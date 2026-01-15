# Backend Mock Server

Mock OAuth 2.0 / OIDC Provider for extension development.

## Purpose

This mock server provides hardcoded OAuth/OIDC endpoints to enable extension development without requiring the full production OAuth implementation.

## Setup

```bash
# Install dependencies
pnpm install

# Start the mock server
pnpm run start:dev
```

The server runs on **http://localhost:3002** by default.

### Environment Variables

The server uses environment variables from `.env.development`:
- `PORT`: Server port (default: 3002)
- `BASE_URL`: Base URL for OAuth endpoints (default: http://localhost:3002)

You can override these by creating a `.env.development.local` file (not tracked in git).

## Endpoints

### 1. Authorization Endpoint
```
GET /oauth/authorize
```

**Query Parameters:**
- `client_id`: Client identifier
- `redirect_uri`: Callback URL
- `response_type`: `code` (authorization code flow)
- `scope`: Space-separated scopes (e.g., `openid profile email links:read links:write`)
- `state`: CSRF protection token (optional but recommended)
- `nonce`: Replay attack protection (optional)
- `code_challenge`: PKCE challenge (optional)
- `code_challenge_method`: `S256` or `plain` (optional)

**Example:**
```
http://localhost:3002/oauth/authorize?client_id=extension-client&redirect_uri=https://extension.local/callback&response_type=code&scope=openid%20profile%20email%20links:read%20links:write&state=random-state-123
```

**Response:**
Redirects to `redirect_uri` with:
- `code`: Mock authorization code (`mock_auth_code_12345`)
- `state`: Original state value

### 2. Token Endpoint
```
POST /oauth/token
Content-Type: application/json
```

**Body Parameters:**
- `grant_type`: `authorization_code` or `refresh_token`
- `code`: Authorization code (for authorization_code grant)
- `refresh_token`: Refresh token (for refresh_token grant)
- `redirect_uri`: Original redirect URI
- `client_id`: Client identifier
- `code_verifier`: PKCE verifier (optional)

**Example:**
```bash
curl -X POST http://localhost:3002/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "mock_auth_code_12345",
    "redirect_uri": "https://extension.local/callback",
    "client_id": "extension-client"
  }'
```

**Response:**
```json
{
  "access_token": "mock_access_token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "mock_refresh_token_abcdef123456",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "scope": "openid profile email links:read links:write"
}
```

### 3. UserInfo Endpoint
```
GET /oauth/userinfo
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "sub": "mock-user-id-12345",
  "email": "mock@test.com",
  "email_verified": true,
  "nickname": "Mock User",
  "given_name": "Mock",
  "family_name": "User",
  "picture": "https://example.com/avatar.png",
  "locale": "ko-KR"
}
```

### 4. OIDC Discovery Endpoint
```
GET /oauth/.well-known/openid-configuration
```

**Response:**
OpenID Connect configuration metadata for the mock server.

## Mock Data

All responses contain hardcoded values for testing:

- **Authorization Code**: `mock_auth_code_12345`
- **Access Token**: `mock_access_token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- **Refresh Token**: `mock_refresh_token_abcdef123456`
- **User ID**: `mock-user-id-12345`
- **User Email**: `mock@test.com`
- **User Nickname**: `Mock User`

## Extension Development

Configure your extension to use this mock server:

```javascript
const OAUTH_CONFIG = {
  authorizationEndpoint: 'http://localhost:3002/oauth/authorize',
  tokenEndpoint: 'http://localhost:3002/oauth/token',
  userInfoEndpoint: 'http://localhost:3002/oauth/userinfo',
  clientId: 'extension-client',
  redirectUri: 'https://your-extension-id.chromiumapp.org/callback',
  scope: 'openid profile email links:read links:write'
};
```

## Notes

- This is for **development only** - never use in production
- No actual authentication is performed
- All tokens are static and don't expire
- No database or state management
- CORS is enabled for all origins
