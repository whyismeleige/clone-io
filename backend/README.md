# Clone.io Backend

Express.js-based backend API for Clone.io - handles authentication, AI interactions, and data management.

## Architecture

### Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for session management
- **Authentication**: Passport.js (GitHub OAuth 2.0)
- **AI Integration**: Anthropic Claude API (Sonnet 4.5, Haiku 3)
- **Storage**: AWS S3 with CloudFront CDN
- **Security**: JWT tokens, bcrypt password hashing
- **File Upload**: Multer for multipart/form-data

### Project Structure

```
backend/
├── config/                  # Configuration files
│   └── s3.config.js        # AWS S3 client setup
│
├── controllers/             # Request handlers
│   ├── auth.controller.js  # Authentication logic (GitHub OAuth)
│   └── chat.controller.js  # Chat & AI interactions
│
├── database/                # Database connections
│   ├── mongoDB.js          # MongoDB connection
│   └── redis.js            # Redis client setup
│
├── middleware/              # Express middleware
│   ├── asyncHandler.js     # Async error wrapper
│   ├── auth.middleware.js  # JWT authentication
│   └── errorHandler.js     # Global error handler
│
├── models/                  # Mongoose schemas
│   ├── index.js            # Model exports
│   ├── user.model.js       # User schema with auth methods
│   └── chat.model.js       # Chat/Project schema
│
├── routes/                  # API routes
│   ├── auth.routes.js      # Auth endpoints
│   └── chat.routes.js      # Chat endpoints
│
├── utils/                   # Utility functions
│   ├── auth.utils.js       # Auth helpers (JWT, metadata)
│   ├── avatar.utils.js     # Avatar generation with Dicebear
│   ├── errors.utils.js     # Custom error classes
│   ├── s3.utils.js         # S3 operations (upload, fetch)
│   ├── dummyData.js        # Mock data for development
│   └── prompts/            # AI prompt templates
│       ├── index.js        # Main prompt builder
│       ├── constants.js    # Prompt constants
│       ├── stripindents.js # String formatting utility
│       └── defaults/       # Default templates
│           ├── react.js    # React + Vite template
│           └── node.js     # Node.js template
│
├── .env                     # Environment variables
├── server.js               # Application entry point
└── package.json            # Dependencies
```

## API Documentation

### Base URL

```
Development: http://localhost:8080/api
Production: https://your-domain.com/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}

Response: 200 OK
{
  "message": "User registered successfully",
  "type": "success",
  "user": {
    "_id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "data:image/svg+xml...",
    "createdAt": "2024-01-06T10:00:00Z"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "message": "User Logged In Successfully",
  "type": "success",
  "user": { /* user object */ },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}

Error (Account Locked): 401 Unauthorized
{
  "message": "Account is Locked, Due to Repeated Incorrect Login Attempts, Try after 5 minutes",
  "type": "error"
}
```

#### GitHub OAuth

```http
GET /api/auth/github
# Redirects to GitHub OAuth consent screen with scopes:
# - user:email
# - repo
# - admin:repo_hook

GET /api/auth/github/callback
# Callback URL after GitHub authorization
# Creates or links user account
# Stores temporary code in Redis
# Redirects to: {FRONTEND_URL}/auth/callback?code={tempCode}
```

#### Exchange OAuth Code

```http
POST /api/auth/exchange
Content-Type: application/json

{
  "code": "temp-code-from-redirect"
}

Response: 200 OK
{
  "message": "Successful Login",
  "type": "success",
  "user": { /* user object */ },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}

Note: The temporary code expires after 5 minutes (Redis TTL)
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response: 200 OK
{
  "message": "Logged Out Successfully",
  "type": "success"
}
```

#### Get User Profile

```http
GET /api/auth/profile
Authorization: Bearer <access-token>

Response: 200 OK
{
  "message": "User Profile Sent",
  "type": "success",
  "user": { /* sanitized user object */ }
}
```

### Chat/Project Endpoints

All chat endpoints (except public and snapshot upload) require authentication.

#### Get Project List

```http
GET /api/chat/list
Authorization: Bearer <access-token>

Response: 200 OK
{
  "message": "Chats retrieved successfully",
  "type": "success",
  "chats": [
    {
      "_id": "chat-id",
      "projectName": "My Portfolio",
      "isStarred": false,
      "timestamp": "2024-01-06T10:00:00Z"
    }
  ]
}

Note: Automatically filters out deleted chats (isDeleted: false)
```

#### Get Single Project

```http
GET /api/chat/history?id=<chat-id>

Response: 200 OK
{
  "message": "Chat retrieved successfully",
  "type": "success",
  "chat": {
    "_id": "chat-id",
    "projectName": "My Portfolio",
    "model": "claude-sonnet-4-20250514",
    "conversations": [
      {
        "role": "user",
        "content": "Create a portfolio website",
        "timestamp": "2024-01-06T10:00:00Z"
      },
      {
        "role": "assistant",
        "content": "<boltArtifact>...</boltArtifact>",
        "timestamp": "2024-01-06T10:00:05Z"
      }
    ],
    "createdBy": { /* user object */ }
  },
  "files": [
    {
      "name": "src",
      "type": "folder",
      "path": "/src",
      "children": [
        {
          "name": "App.tsx",
          "type": "file",
          "path": "/src/App.tsx",
          "content": "import React..."
        }
      ]
    }
  ]
}

Note: Files are fetched from S3 and transformed into hierarchical structure
```

#### Create New Project

```http
POST /api/chat/template
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "prompt": "Create a modern portfolio website"
}

Response: 200 OK
{
  "message": "React Template created successfully",
  "type": "success",
  "newChat": {
    "_id": "chat-id",
    "projectName": "Modern Portfolio Website",
    "model": "claude-sonnet-4-20250514",
    "conversations": [],
    "createdBy": "user-id"
  },
  "prompts": [
    "For all designs I ask you to make, have them be beautiful...",
    "Here is an artifact that contains all files..."
  ],
  "uiPrompts": [
    "<boltArtifact id=\"project-import\" title=\"Project Files\">..."
  ]
}

Note: Uses Claude Haiku 3 (200 tokens) to classify as "react" or "node"
```

#### Send Prompt (Streaming)

```http
POST /api/chat/prompt
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Create a portfolio website"
    },
    {
      "role": "assistant",
      "content": "<boltArtifact>...</boltArtifact>"
    },
    {
      "role": "user",
      "content": "Add a dark mode toggle"
    }
  ],
  "chatId": "chat-id"
}

Response: text/event-stream
data: {"type":"message_start","message":{...}}

data: {"type":"text_block","delta":"Creating dark mode..."}

data: {"type":"text_block","delta":" toggle component..."}

data: {"type":"done","message":{...}}

Error Response (in stream):
data: {"type":"error","error":"Rate limit exceeded"}

Note: Uses Claude Sonnet 4.5 (16k tokens in production, 200 in dev)
Note: First conversation gets React template injected automatically
```

#### Upload Project Files to S3

```http
POST /api/chat/upload-project-files?id=<chat-id>
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "import React from 'react'..."
    },
    {
      "path": "package.json",
      "content": "{\"name\": \"my-app\"...}"
    }
  ]
}

Response: 200 OK
{
  "message": "Project Files saved successfully",
  "type": "success",
  "projectFiles": [
    {
      "key": "users/{userId}/chats/{chatId}/src/App.tsx",
      "url": "https://bucket.s3.region.amazonaws.com/users/..."
    }
  ]
}

Note: Files are stored with path: users/{userId}/chats/{chatId}/{filePath}
Note: Proper Content-Type is set based on file extension
```

#### Modify Project

```http
PATCH /api/chat/modify?id=<chat-id>
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "data": {
    "toggleStarStatus": true,       // Toggle star on/off
    "visibilityStatus": "public",   // "public" or "private"
    "projectName": "New Name"       // Rename project
  }
}

Response: 200 OK
{
  "message": "Successfully modified chat",
  "type": "success"
}

Note: All fields are optional, only provided fields are updated
```

#### Delete Project (Soft Delete)

```http
DELETE /api/chat/delete?id=<chat-id>
Authorization: Bearer <access-token>

Response: 200 OK
{
  "message": "Chat deleted successfully",
  "type": "success",
  "chatId": "chat-id"
}

Note: Soft delete - sets isDeleted: true, status: "deleted"
Note: Records deletedAt timestamp and deletedBy user ID
```

#### Get Public Projects

```http
GET /api/chat/public?limit=6

Response: 200 OK
{
  "message": "Public projects received",
  "type": "success",
  "projects": [
    {
      "_id": "project-id",
      "projectName": "Portfolio Website",
      "snapshot": "https://cdn.cloudfront.net/snapshots/...",
      "model": "claude-sonnet-4-20250514",
      "views": 42,
      "createdBy": "user-id",
      "creator": {
        "_id": "user-id",
        "name": "John Doe",
        "avatar": "data:image/svg+xml..."
      },
      "createdAt": "2024-01-06T10:00:00Z"
    }
  ]
}

Note: Returns random sample of public, non-deleted projects
Note: Default limit is 6, can be adjusted via query parameter
```

#### Increment View Count

```http
PATCH /api/chat/public/:projectId/view

Response: 200 OK
{
  "message": "View count incremented",
  "type": "success"
}

Note: Only increments for public, non-deleted projects
```

#### Upload Project Snapshot

```http
POST /api/chat/upload-snapshot
Content-Type: multipart/form-data

Form Data:
- snapshot: <image file>
- chatId: <chat-id>

Response: 200 OK
{
  "message": "Snapshot uploaded successfully",
  "url": "https://cdn.cloudfront.net/snapshots/{chatId}/ss/{filename}"
}

Note: Stored at: snapshots/{chatId}/ss/{filename}
Note: Uses CloudFront CDN for fast delivery
Note: File size limit: 5MB (enforced by multer)
```

### Error Responses

All endpoints return consistent error format:

```json
{
  "message": "Error description",
  "type": "error",
  "stack": "Error: ...\n    at ..." // Only in development
}
```

**Common HTTP Status Codes:**

- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token, expired session)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limited by Claude API)
- `500` - Internal Server Error
- `502` - Bad Gateway (external API error - Claude, S3, etc.)

**Example Error Responses:**

```json
// Validation Error
{
  "message": "Enter Valid Input",
  "type": "error"
}

// Authentication Error
{
  "message": "Invalid Session, Login Again",
  "type": "error"
}

// Claude API Error
{
  "message": "Rate limit exceeded. Please try again later",
  "type": "error"
}
```

## Security Features

### Authentication & Authorization

**JWT Token Strategy:**

```javascript
// Access Token (1 hour)
const accessToken = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Refresh Token (7 days)
const refreshToken = jwt.sign(
  { id: user._id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

**Token Storage:**
- Refresh tokens stored in MongoDB with metadata
- User sessions cached in Redis (5 min TTL)
- Token metadata includes: IP, user agent, browser, OS, device, location

**Account Protection:**

```javascript
// Auto-lock after 5 failed attempts
if (user.security.loginAttempts === 5) {
  user.security.lockUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
}

// Check if locked
if (user.isLocked()) {
  throw new Error('Account is locked');
}
```

**Password Security:**

```javascript
// Bcrypt hashing with 12 rounds
UserSchema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

// Password comparison
const passwordsMatch = await user.passwordsMatch(password);
```

### Rate Limiting (Recommended)

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### CORS Configuration

```javascript
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://josh-net.vercel.app/",
    "https://your-production-domain.com"
  ],
  credentials: true
}));
```

### Input Validation

```javascript
// Mongoose schema validation
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is Required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters']
  }
});
```

## AI Integration

### Claude API Configuration

```javascript
const { Anthropic } = require("@anthropic-ai/sdk");
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Available Models:
// - claude-sonnet-4-5-20250929 (Sonnet 4.5)
// - claude-3-haiku-20240307 (Haiku 3)
```

### Streaming Responses

```javascript
const stream = await anthropic.messages.stream({
  messages: messages,
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 16000,
  system: getSystemPrompt()
});

stream.on('connect', (message) => {
  res.write(`data: ${JSON.stringify({
    type: 'message_start',
    message: message
  })}\n\n`);
});

stream.on('text', (text) => {
  fullText += text;
  res.write(`data: ${JSON.stringify({
    type: 'text_block',
    delta: text
  })}\n\n`);
});

stream.on('end', async () => {
  const finalMessage = await stream.finalMessage();
  await chat.saveConversation('assistant', finalMessage.content[0].text);
  
  res.write(`data: ${JSON.stringify({
    type: 'done',
    message: finalMessage
  })}\n\n`);
  res.end();
});
```

### Prompt Engineering

**System Prompt Structure:**

```javascript
const getSystemPrompt = (cwd = '/home/project') => `
You are Bolt, an expert AI assistant and exceptional senior software developer.

<system_constraints>
  WebContainer limitations:
  - Browser-based Node.js runtime
  - No native binaries
  - Python limited to standard library (no pip)
  - No C/C++ compiler
  - Git not available
</system_constraints>

<artifact_info>
  Create comprehensive artifacts with:
  - Shell commands (npm install, npm run dev)
  - File creation with full content
  - Folder structure
</artifact_info>

<boltArtifact id="unique-id" title="Project Title">
  <boltAction type="file" filePath="src/App.tsx">
    // Full file content here
  </boltAction>
  
  <boltAction type="shell">
    npm install && npm run dev
  </boltAction>
</boltArtifact>
`;
```

**Default Templates:**

- **React Template**: Vite + React + TypeScript + Tailwind CSS
- **Node Template**: Basic Node.js with package.json

### Error Handling

```javascript
const handleClaudeErrors = (error) => {
  if (error.status === 401) {
    throw new ExternalAPIError('Invalid API Key', error);
  }
  if (error.status === 429) {
    throw new ExternalAPIError('Rate limit exceeded', error);
  }
  if (error.status === 500) {
    throw new ExternalAPIError('Claude API unavailable', error);
  }
  throw new ExternalAPIError('Failed to process prompt', error);
};
```

## Database Schema

### User Model

```javascript
{
  // Authentication
  email: String,              // Unique, indexed, lowercase
  password: String,           // Hashed with bcrypt (12 rounds)
  googleID: String,           // OAuth ID (removed from use)
  githubId: String,           // OAuth ID
  providers: [String],        // ['github', 'local']
  
  // Profile
  name: String,               // Min 2, max 50 characters
  avatar: String,             // Auto-generated with Dicebear
  
  // Projects
  chats: [ObjectId],          // References to Chat documents
  
  // Activity Tracking
  activity: {
    lastLogin: Date,
    totalLogins: [{
      loginTime: Date,
      attemptsReached: Number,
      maxAttemptsReached: Boolean,
      metadata: {
        ipAddress: String,
        userAgent: String,
        browser: { name, version, major },
        os: { name, version },
        device: { vendor, model, type },
        location: { country, region, city, latitude, longitude, timezone }
      }
    }]
  },
  
  // Security
  security: {
    loginAttempts: Number,    // Max 5
    lockUntil: Date          // Unlock timestamp
  },
  
  // Session Management
  refreshTokens: [{
    token: String,
    createdAt: Date,          // Auto-expires after 7 days
    metadata: MetadataSchema
  }],
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**User Methods:**

```javascript
// Check if account is locked
user.isLocked()

// Verify password
await user.passwordsMatch(password)

// Track failed login
await user.inSuccessfulLogin()

// Track successful login
await user.successfulLogin(metadata)

// Save refresh token
await user.saveToken(refreshToken, metadata)

// Save chat reference
await user.saveChat(chatId)
```

### Chat Model

```javascript
{
  // Project Info
  projectName: String,        // Required, indexed for search
  projectS3Url: String,       // S3 bucket URL (optional)
  model: String,              // AI model used
  
  // Files
  projectFiles: [{
    key: String,              // S3 key
    url: String               // S3 URL
  }],
  
  // Preview
  snapshot: String,           // CloudFront CDN URL
  
  // Conversations
  conversations: [{
    role: String,             // 'user' or 'assistant'
    content: String,          // Message content
    timestamp: Date
  }],
  
  // Deployment (optional)
  githubRepo: String,         // GitHub repo URL
  deploymentLink: String,     // Deployment URL
  
  // Visibility & Status
  views: Number,              // View count (default: 0)
  visibilityStatus: String,   // 'public' or 'private'
  isStarred: Boolean,         // User starred
  isDeployed: Boolean,        // Deployed status
  deployedAt: Date,
  
  // Ownership
  createdBy: ObjectId,        // Reference to User
  lastActivity: Date,
  status: String,             // 'active', 'archived', 'deleted'
  
  // Soft Delete
  isDeleted: Boolean,         // Default: false
  deletedAt: Date,
  deletedBy: ObjectId,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Chat Methods:**

```javascript
// Modify chat properties
await chat.modifyChat({ toggleStarStatus: true })
await chat.modifyChat({ visibilityStatus: 'public' })
await chat.modifyChat({ projectName: 'New Name' })

// Save conversation
await chat.saveConversation('user', 'Create a todo app')
await chat.saveConversation('assistant', '<boltArtifact>...</boltArtifact>')

// Save project files
await chat.saveProjectFiles([
  { key: 'users/...', url: 'https://...' }
])

// Save snapshot
await chat.saveSnapshot('https://cdn.cloudfront.net/...')

// Soft delete
await chat.softDelete(userId)
```

**Indexes:**

```javascript
ChatSchema.index({ createdBy: 1, createdAt: -1 });
ChatSchema.index({ projectName: 'text' });
```

## AWS S3 Integration

### S3 Configuration

```javascript
const { S3Client } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
  }
});
```

### File Upload

```javascript
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function uploadS3File(key, file, metadata) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key, // users/{userId}/chats/{chatId}/{path}
    Body: file.content,
    ContentType: getContentType(file.path),
    Metadata: metadata
  });
  
  await s3Client.send(command);
  
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
```

### File Download

```javascript
const { GetObjectCommand } = require("@aws-sdk/client-s3");

async function getS3TextFile(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  });
  
  const data = await s3Client.send(command);
  
  // Check if binary file
  if (isBinaryFile(data.ContentType, key)) {
    return null;
  }
  
  return data.Body.transformToString('utf-8');
}
```

### Content Type Detection

```javascript
function getContentType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const contentTypes = {
    // Text files
    txt: 'text/plain',
    md: 'text/markdown',
    json: 'application/json',
    
    // Web files
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    jsx: 'application/javascript',
    ts: 'application/typescript',
    tsx: 'application/typescript',
    
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    svg: 'image/svg+xml',
    
    // ... 40+ types supported
  };
  
  return contentTypes[ext] || 'application/octet-stream';
}
```

### Snapshot Upload (with CDN)

```javascript
async function uploadSnapshot(chatId, fileName, buffer, mimeType) {
  const key = `snapshots/${chatId}/ss/${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    CacheControl: 'public, max-age=3600'
  });
  
  await s3Client.send(command);
  
  // Return CDN URL instead of S3 URL
  return `${process.env.CDN_URL}/${key}`;
}
```

## Error Handling

### Custom Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode, type = 'error') {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(message = 'Invalid Input') {
    super(message, 400, 'error');
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication Failed') {
    super(message, 401, 'error');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Unauthorized Access') {
    super(message, 403, 'error');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'error');
  }
}

class ExternalAPIError extends AppError {
  constructor(message, originalError) {
    super(message, 502, 'error');
    this.originalError = originalError;
  }
}
```

### Global Error Handler

```javascript
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  // Handle specific errors
  if (err.code === 11000) {
    err = new ValidationError('Duplicate field value entered');
  }
  
  if (err.name === 'JsonWebTokenError') {
    err = new AuthenticationError('Invalid Session, Login Again');
  }
  
  if (err.name === 'TokenExpiredError') {
    err = new AuthenticationError('Session Expired, Login Again');
  }

  res.status(err.statusCode || 500).send({
    message: err.message || 'Server Error',
    type: err.type || 'error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      ...(err.originalError && { apiError: err.originalError.message })
    })
  });
});
```

### Async Handler Wrapper

```javascript
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage
exports.getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ createdBy: req.user._id });
  res.status(200).send({ chats });
});
```

## Deployment

### Environment Variables

```bash
# Server
PORT=8080
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net
DB_NAME=clone-io

# Redis
REDIS_HOST=redis-host.cloud.redislabs.com
REDIS_PORT=16379
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-strong-jwt-secret-min-32-chars
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=your-strong-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRE=7d

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-your-api-key

# AWS S3
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
AWS_S3_ACCESS_KEY=your-access-key
AWS_S3_SECRET_ACCESS_KEY=your-secret-key
CDN_URL=https://your-distribution.cloudfront.net
```

### Production Setup

**1. Process Manager (PM2):**

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start server.js --name clone-io-api

# Enable startup script
pm2 startup
pm2 save

# Monitor
pm2 monit

# View logs
pm2 logs clone-io-api
```

**2. Docker Deployment:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); });"

# Start server
CMD ["node", "server.js"]
```

**Build and run:**

```bash
docker build -t clone-io-backend .
docker run -p 8080:8080 --env-file .env clone-io-backend
```

**3. Nginx Reverse Proxy:**

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # For SSE streaming
        proxy_buffering off;
        proxy_cache off;
    }
}
```

### Database Configuration

**MongoDB Atlas:**
1. Create cluster on MongoDB Atlas
2. Add IP whitelist (0.0.0.0/0 for any IP)
3. Create database user
4. Get connection string
5. Update MONGO_URI in .env

**Redis Cloud:**
1. Create database on Redis Cloud
2. Get endpoint and password
3. Update Redis config in .env

### Storage Configuration

**AWS S3 + CloudFront:**

1. Create S3 bucket
2. Set bucket policy for public read (if needed)
3. Create CloudFront distribution
4. Point distribution to S3 bucket
5. Update CDN_URL in .env

## Monitoring & Logging

### Health Check Endpoint

```http
GET /health

Response: 200 OK
{
  "status": "success",
  "message": "JOSH Net API is running",
  "timestamp": "2024-01-06T10:00:00Z"
}
```

### Logging Best Practices

```javascript
// Structured logging
console.log({
  level: 'info',
  message: 'User logged in',
  userId: user._id,
  email: user.email,
  timestamp: new Date().toISOString()
});

// Error logging
console.error({
  level: 'error',
  message: err.message,
  stack: err.stack,
  url: req.originalUrl,
  method: req.method,
  timestamp: new Date().toISOString()
});
```

### Recommended Tools

- **Sentry**: Error tracking and performance monitoring
- **Winston**: Advanced logging with transports
- **Morgan**: HTTP request logging
- **PM2**: Process monitoring and management
- **MongoDB Atlas Monitoring**: Database performance metrics
- **AWS CloudWatch**: S3 and infrastructure monitoring

## Testing

### Unit Tests (Jest)

```javascript
const { createAccessToken } = require('./auth.utils');

describe('Auth Utils', () => {
  test('should create valid access token', () => {
    const token = createAccessToken({ id: 'user-id' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });
});
```

### Integration Tests (Supertest)

```javascript
const request = require('supertest');
const app = require('./server');

describe('Auth API', () => {
  test('POST /api/auth/register - should register user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123456',
        name: 'Test User'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.type).toBe('success');
    expect(res.body.user).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

**1. MongoDB Connection Failed:**
- Check MONGO_URI format
- Verify IP whitelist in Atlas
- Check database user credentials
- Ensure network connectivity

**2. Redis Connection Failed:**
- Verify Redis host and port
- Check Redis password
- Ensure Redis server is running
- Check firewall settings

**3. Claude API Errors:**
- Verify API key is correct
- Check account credits/limits
- Monitor rate limits (429 errors)
- Check request format

**4. S3 Upload Failures:**
- Verify AWS credentials
- Check bucket permissions
- Verify bucket region matches config
- Check file size limits

**5. OAuth Not Working:**
- Verify OAuth credentials
- Check callback URL configuration
- Ensure redirect URIs match exactly
- Check OAuth scopes

### Debug Mode

Enable detailed logging:

```javascript
// Add to .env
DEBUG=true
LOG_LEVEL=debug

// Use in code
if (process.env.DEBUG === 'true') {
  console.log('Debug info:', data);
}
```

## Contributing

See the main repository README for contribution guidelines.

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ using Express.js and Node.js