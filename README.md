# LinkedIn Screenshot to Zoho Recruit Integration - v1.0 Single User

## 🎯 Overview

A complete web application that converts LinkedIn profile screenshots into structured candidate data and automatically uploads them to Zoho Recruit. This version is designed for single-user operation with working Zoho OAuth integration.

## ✅ Current Working Features

### Core Functionality
- **Single File Upload**: Upload individual LinkedIn screenshots with OCR processing
- **Bulk File Upload**: Process multiple screenshots sequentially with rate limiting
- **Zoho Recruit Integration**: Automatic candidate creation in Zoho Recruit portal
- **Real-time Progress Tracking**: Visual feedback during upload and processing
- **Error Handling & Retry**: Comprehensive error handling with retry mechanisms
- **File Validation**: PNG/JPG validation with size limits (max 10MB)

### User Interface
- **Drag & Drop Interface**: Intuitive file upload with preview
- **Responsive Design**: Works on desktop and mobile devices
- **LinkedIn-inspired Styling**: Professional color scheme and design
- **Settings Panel**: Configurable Zoho credentials and webhook settings
- **Progress Indicators**: Real-time upload progress and status feedback

### Backend Integration
- **Make.com Webhook**: Processes screenshots via Make.com automation
- **OCR Processing**: Extracts structured data from LinkedIn screenshots
- **Zoho OAuth**: Secure authentication with automatic token refresh
- **Rate Limiting**: 160-second delays between bulk uploads to respect Zoho limits
- **Field Mapping**: Proper mapping of LinkedIn data to Zoho Recruit fields

## 🔧 Environment Variables Required

### Frontend (.env)
```bash
# Webhook URL for Make.com integration
VITE_WEBHOOK_URL=https://your-deployment.vercel.app/api/gofullpage-webhook

# Tempo development (set to true for development)
VITE_TEMPO=true
```

### Backend (.env)
```bash
# Zoho OAuth Credentials
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
ZOHO_ACCESS_TOKEN=your_zoho_access_token

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## 🚀 Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Zoho OAuth Setup

#### Step 1: Create Zoho Application
1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Click "Add Client" → "Server-based Applications"
3. Fill in application details:
   - Client Name: Your app name
   - Homepage URL: Your domain
   - Authorized Redirect URIs: `https://your-domain.com/oauth/callback`

#### Step 2: Generate Authorization Code
1. Visit this URL (replace YOUR_CLIENT_ID):
```
https://accounts.zoho.com/oauth/v2/auth?scope=ZohoRecruit.modules.ALL&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=https://your-domain.com/oauth/callback
```
2. Authorize the application
3. Copy the authorization code from the redirect URL

#### Step 3: Generate Refresh Token
```bash
curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://your-domain.com/oauth/callback" \
  -d "code=YOUR_AUTHORIZATION_CODE"
```

#### Step 4: Configure Environment Variables
Add the obtained credentials to your backend `.env` file.

### 4. Make.com Webhook Setup

1. Create a Make.com scenario with:
   - Webhook trigger
   - OCR processing module
   - Data transformation
   - HTTP response

2. Configure the webhook URL in your frontend environment variables

### 5. Run the Application

#### Development Mode
```bash
# Frontend
npm run dev

# Backend (in separate terminal)
cd backend
node server.js
```

#### Production Build
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── home.tsx              # Main application component
│   │   ├── UploadArea.tsx         # File upload interface
│   │   ├── SubmissionForm.tsx     # Form for candidate details
│   │   ├── StatusFeedback.tsx     # Progress and status display
│   │   ├── ZohoSettings.tsx       # Settings configuration
│   │   └── ui/                    # Reusable UI components
│   ├── lib/
│   │   └── utils.ts               # Utility functions
│   └── main.tsx                   # Application entry point
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── zoho.service.js    # Zoho API integration
│   │   ├── routes/
│   │   │   └── upload.routes.js   # Upload endpoints
│   │   └── middleware/
│   │       └── auth.middleware.js # Authentication middleware
│   ├── app.js                     # Express app configuration
│   └── server.js                  # Server entry point
└── public/                        # Static assets
```

## 🔍 Key Components

### Frontend Components

- **home.tsx**: Main application logic with upload handling
- **UploadArea.tsx**: Drag & drop file upload with preview
- **SubmissionForm.tsx**: Candidate name and CRM selection
- **StatusFeedback.tsx**: Real-time progress and error handling
- **ZohoSettings.tsx**: Configuration panel for Zoho credentials

### Backend Services

- **zoho.service.js**: Complete Zoho Recruit API integration
  - OAuth token management
  - Candidate creation
  - Field mapping
  - Error handling

## 🐛 Known Issues & Solutions

### Issue 1: Token Refresh Failures
**Problem**: Zoho access tokens expire and refresh fails
**Solution**: Implemented automatic token refresh with comprehensive error handling

### Issue 2: Rate Limiting
**Problem**: Zoho API rate limits cause bulk upload failures
**Solution**: Added 160-second delays between bulk uploads

### Issue 3: Field Mapping Errors
**Problem**: Case-sensitive field names in Zoho API
**Solution**: Implemented proper field mapping with validation

### Issue 4: File Size Limits
**Problem**: Large screenshots cause upload failures
**Solution**: Added 10MB file size limit with validation

## 🔧 Troubleshooting

### Common Issues

1. **"Webhook URL not configured"**
   - Check VITE_WEBHOOK_URL in environment variables
   - Ensure Make.com webhook is active

2. **"Token refresh failed"**
   - Verify Zoho OAuth credentials
   - Check refresh token validity
   - Ensure proper scopes are granted

3. **"Upload failed"**
   - Check file format (PNG/JPG only)
   - Verify file size (max 10MB)
   - Check network connectivity

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## 📊 Performance Considerations

- **Single Upload**: ~5-10 seconds per file
- **Bulk Upload**: 160+ seconds per file (due to rate limiting)
- **File Processing**: Depends on Make.com OCR processing time
- **Memory Usage**: Optimized for large file handling

## 🔒 Security Features

- **OAuth 2.0**: Secure Zoho authentication
- **Token Encryption**: Secure token storage
- **CORS Protection**: Restricted cross-origin requests
- **Input Validation**: Comprehensive data validation
- **Error Sanitization**: Safe error message handling

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Backend (Vercel/Heroku)
```bash
cd backend
# Deploy using your preferred platform
```

## 📈 Future Enhancements (v2.0+)

- Multi-user support with user authentication
- Database integration for user management
- Advanced OCR with multiple providers
- Bulk processing optimization
- Real-time notifications
- Analytics dashboard
- Multiple CRM integrations

## 🤝 Contributing

This is v1.0 single-user version. For SaaS development, work on the `main` branch.

## 📄 License

Private project - All rights reserved

## 📞 Support

For issues with this version, check the troubleshooting section above or review the implementation details in the source code.

---

**Version**: 1.0.0-single-user  
**Last Updated**: January 2025  
**Status**: Production Ready (Single User)
