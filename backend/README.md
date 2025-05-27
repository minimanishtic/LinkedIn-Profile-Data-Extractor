# LinkedIn Screenshot Uploader Backend

Backend API for the LinkedIn Screenshot Uploader application. This API handles authentication, file uploads, and integration with Zoho Recruit.

## Deployment Instructions

### Deploying to Vercel

1. Install Vercel CLI (if not already installed):
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy the backend:
   ```
   cd backend
   vercel
   ```

4. For production deployment:
   ```
   vercel --prod
   ```

### Environment Variables

The following environment variables need to be set in your Vercel project:

- `FRONTEND_URL`: URL of the frontend application (e.g., https://your-frontend-app.vercel.app)
- `JWT_SECRET`: Secret key for JWT token generation and verification
- `ZOHO_CLIENT_ID`: Client ID from Zoho Recruit API
- `ZOHO_CLIENT_SECRET`: Client Secret from Zoho Recruit API
- `ZOHO_REDIRECT_URI`: Redirect URI for Zoho OAuth (e.g., https://your-backend-api.vercel.app/api/auth/zoho/callback)

## API Documentation

### Make.com Webhook Endpoint

**POST /api/upload**

Receives candidate data from Make.com webhook.

**Request Body:**
```json
{
  "candidateData": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "linkedin_url": "https://linkedin.com/in/johndoe"
  },
  "userId": "user123",
  "webhookId": "webhook123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Candidate data received",
  "recordId": "uuid-generated-id",
  "timestamp": "2023-05-01T12:00:00.000Z"
}
```

### Zoho OAuth Endpoints

**GET /api/auth/zoho/connect**

Redirects to Zoho OAuth authorization URL.

**Query Parameters:**
- `userId`: User ID to associate with the Zoho connection

**Response:**
Redirects to Zoho OAuth authorization page.

**GET /api/auth/zoho/callback**

Handles the callback from Zoho OAuth.

**Query Parameters:**
- `code`: Authorization code from Zoho
- `state`: User ID passed in the connect request

**Response:**
HTML page that auto-closes the window after successful connection.

**GET /api/auth/zoho/status/:userId**

Checks the Zoho connection status for a user.

**Path Parameters:**
- `userId`: User ID to check connection status for

**Response:**
```json
{
  "connected": true|false,
  "userId": "user123"
}
```

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the required environment variables
4. Start the development server:
   ```
   npm run dev
   ```
5. The API will be available at http://localhost:3001
