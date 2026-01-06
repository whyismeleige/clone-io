
# Clone.io Backend

  

Express.js-based backend API for Clone.io - handles authentication, AI interactions, and data management.

  

## Architecture

  

### Tech Stack

  

-  **Runtime**: Node.js 18+

-  **Framework**: Express.js 4.18+

-  **Database**: MongoDB with Mongoose

-  **Cache**: Redis

-  **Authentication**: Passport.js (OAuth 2.0)

-  **AI Integration**: Anthropic Claude API

-  **Storage**: AWS S3

-  **Security**: JWT, bcrypt, rate limiting

  

### Project Structure

  

```

backend/

├── config/ # Configuration files

│ └── s3.config.js # AWS S3 client setup

│

├── controllers/ # Request handlers

│ ├── auth.controller.js # Authentication logic

│ └── chat.controller.js # Chat & AI interactions

│

├── database/ # Database connections

│ ├── mongoDB.js # MongoDB connection

│ └── redis.js # Redis client setup

│

├── middleware/ # Express middleware

│ ├── asyncHandler.js # Async error wrapper

│ ├── auth.middleware.js # JWT authentication

│ └── errorHandler.js # Global error handler

│

├── models/ # Mongoose schemas

│ ├── index.js # Model exports

│ ├── user.model.js # User schema

│ └── chat.model.js # Chat schema

│

├── routes/ # API routes

│ ├── auth.routes.js # Auth endpoints

│ └── chat.routes.js # Chat endpoints

│

├── utils/ # Utility functions

│ ├── auth.utils.js # Auth helpers

│ ├── avatar.utils.js # Avatar generation

│ ├── errors.utils.js # Custom error classes

│ ├── s3.utils.js # S3 operations

│ ├── dummyData.js # Mock data (development)

│ └── prompts/ # AI prompt templates

│ ├── index.js # Main prompt builder

│ ├── constants.js # Prompt constants

│ ├── stripindents.js # String formatting

│ └── defaults/ # Default templates

│ ├── react.js

│ └── node.js

│

├── .env # Environment variables

├── server.js # Application entry point

└── package.json # Dependencies

```
  

## API Documentation

  

### Base URL

  

```

http://localhost:8080/api

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

"user": { ... },

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

"user": { ... },

"accessToken": "eyJhbGc...",

"refreshToken": "eyJhbGc..."

}

```

  

#### Google OAuth

```http

GET /api/auth/google

# Redirects to Google OAuth consent screen

```

  

#### GitHub OAuth

```http

GET /api/auth/github

# Redirects to GitHub OAuth authorization

```

  

#### Exchange OAuth Code

```http

POST /api/auth/exchange-code

Content-Type: application/json

  

{

"code": "temp-code-from-redirect"

}

  

Response: 200 OK

{

"message": "Successful Login",

"type": "success",

"user": { ... },

"accessToken": "eyJhbGc...",

"refreshToken": "eyJhbGc..."

}

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

  

### Chat Endpoints

  

All chat endpoints require authentication.

  

#### Get Chat History

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

```

  

#### Get Single Chat

```http

GET /api/chat/history?id=<chat-id>

Authorization: Bearer <access-token>

  

Response: 200 OK

{

"message": "Chat retrieved successfully",

"type": "success",

"chat": { ... }

}

```

  

#### Create Template

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

"newChat": { ... },

"prompts": [ ... ],

"uiPrompts": [ ... ]

}

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

"content": "Add a dark mode toggle"

}

],

"chatId": "chat-id"

}

  

Response: text/event-stream

data: {"type":"message_start","message":{...}}

  

data: {"type":"text_block","delta":"Creating dark mode..."}

  

data: {"type":"done","message":{...},"fullText":"...","truncated":false}

```

  

#### Upload Project Files

```http

POST /api/chat/upload-project-files?id=<chat-id>

Authorization: Bearer <access-token>

Content-Type: application/json

  

{

"files": [

{

"path": "src/App.tsx",

"content": "import React..."

}

]

}

  

Response: 200 OK

{

"message": "Project Files saved successfully",

"type": "success",

"projectFiles": [ ... ]

}

```

  

### Error Responses

  

All endpoints may return error responses:

  

```json

{

"message":  "Error message",

"type":  "error",

"stack":  "..."  // Only in development

}

```

  

Common status codes:

-  `400`: Bad Request (validation error)

-  `401`: Unauthorized (invalid/missing token)

-  `403`: Forbidden (insufficient permissions)

-  `404`: Not Found

-  `429`: Too Many Requests (rate limited)

-  `500`: Internal Server Error

-  `502`: Bad Gateway (external API error)

  

##  Security Features

  

### Authentication & Authorization

  

**JWT Token Strategy**

- Access tokens: 1 hour expiry

- Refresh tokens: 7 days expiry

- Tokens stored in MongoDB with metadata

- Redis caching for user sessions (5 min TTL)

  

**Account Protection**

```javascript

// Auto-lock after 5 failed attempts

if (user.security.loginAttempts ===  5) {

user.security.lockUntil = Date.now() +  5  *  60  *  1000;

}

```

  

**Password Security**

- Bcrypt hashing (12 rounds)

- Minimum 8 characters

- Not stored in plain text

  

### Rate Limiting

  

```javascript

// Implement rate limiting (recommended)

const rateLimit =  require('express-rate-limit');

  

const limiter =  rateLimit({

windowMs:  15  *  60  *  1000,  // 15 minutes

max:  100  // limit each IP to 100 requests per windowMs

});

  

app.use('/api/', limiter);

```

  

### CORS Configuration

  

```javascript

app.use(cors({

origin: [

"http://localhost:3000",

"https://your-production-domain.com"

],

credentials:  true

}));

```

  

## AI Integration

  

### Claude API Configuration

  

```javascript

const  { Anthropic }  =  require("@anthropic-ai/sdk");

const anthropic =  new  Anthropic();

  

const response =  await anthropic.messages.create({

model:  "claude-sonnet-4-20250514",

max_tokens:  16000,

messages: [

{ role:  "user", content: prompt }

],

system:  getSystemPrompt()

});

```

  

### Streaming Responses

  

```javascript

const stream =  await anthropic.messages.stream({

messages,

model:  "claude-3-5-haiku-latest",

max_tokens:  16000

});

  

stream.on('text',  (text)  =>  {

res.write(`data: ${JSON.stringify({ type:  'text_block', delta:  text  })}\n\n`);

});

  

stream.on('end',  async  ()  =>  {

const finalMessage =  await stream.finalMessage();

res.write(`data: ${JSON.stringify({ type:  'done', message:  finalMessage  })}\n\n`);

res.end();

});

```

  

### Prompt Engineering

  

System prompts are modular and support:

- React + Vite templates

- Node.js templates

- WebContainer constraints

- File modification tracking

- Best practices enforcement

  

See `utils/prompts/` for detailed prompt structure.

  

## Database Schema

  

### User Model

  

```javascript

{

email: String,  // Unique, indexed

password: String,  // Hashed with bcrypt

name: String,

googleID: String,  // OAuth ID

githubId: String,  // OAuth ID

providers: [String],  // ['google', 'github', 'local']

avatar: String,  // Auto-generated

chats: [ObjectId],  // References to Chat

activity:  {

lastLogin: Date,

totalLogins: [{  ...  }] // Login history with metadata

},

security:  {

loginAttempts: Number,

lockUntil: Date

},

refreshTokens: [{  ...  }]

}

```

  

### Chat Model

  

```javascript

{

projectName: String,

projectS3Url: String,

projectFiles: [{ key, url }],

model: String,  // AI model used

conversations: [{

role: String,  // 'user' or 'assistant'

content: String,

timestamp: Date

}],

githubRepo: String,

deploymentLink: String,

visibilityStatus: String,  // 'public' or 'private'

isStarred: Boolean,

isDeployed: Boolean,

deployedAt: Date,

createdBy: ObjectId,  // Reference to User

lastActivity: Date,

status: String // 'active', 'archived', 'deleted'

}

```

  

## AWS S3 Integration

  

### File Upload

  

```javascript

const  { PutObjectCommand }  =  require("@aws-sdk/client-s3");

  

async  function  uploadS3File(key,  file,  metadata)  {

const command =  new  PutObjectCommand({

Bucket: process.env.S3_BUCKET_NAME,

Key: key,  // users/{userId}/chats/{chatId}/{path}

Body: file.content,

ContentType:  getContentType(file.path),

Metadata: metadata

});

await s3Client.send(command);

return  `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

}

```

  

### Content Type Detection

  

```javascript

const contentTypes =  {

js:  "application/javascript",

ts:  "application/typescript",

jsx:  "application/javascript",

tsx:  "application/typescript",

html:  "text/html",

css:  "text/css",

json:  "application/json",

// ... 40+ types supported

};

```

  

##  Error Handling

  

### Custom Error Classes

  

```javascript

class  ValidationError  extends  AppError  {

constructor(message  =  "Invalid Input")  {

super(message,  400,  "error");

}

}

  

class  AuthenticationError  extends  AppError  {

constructor(message  =  "Authentication Failed")  {

super(message,  401,  "error");

}

}

  

class  ExternalAPIError  extends  AppError  {

constructor(message,  originalError)  {

super(message,  502,  "error");

this.originalError = originalError;

}

}

```

  

### Global Error Handler

  

```javascript

app.use((err,  req,  res,  next)  =>  {

console.error({

message: err.message,

stack: err.stack,

url: req.originalUrl,

method: req.method

});

res.status(err.statusCode ||  500).send({

message: err.message ||  "Server Error",

type: err.type ||  "error",

...(process.env.NODE_ENV  ===  "development"  &&  {

stack: err.stack

})

});

});

```

  

## Deployment

  

### Production Setup

  

1.  **Environment Variables**: Set all production values

2.  **Database**: Configure MongoDB Atlas or production DB

3.  **Redis**: Set up Redis Cloud or production instance

4.  **SSL**: Ensure HTTPS for OAuth callbacks

5.  **CORS**: Update allowed origins

  

### Docker Deployment (Optional)

  

```dockerfile

FROM node:18-alpine

  

WORKDIR /app

  

COPY package*.json ./

RUN npm ci --only=production

  

COPY . .

  

EXPOSE 8080

  

CMD ["node", "server.js"]

```

  

### Health Check

  

```http

GET /health

  

Response: 200 OK

{

"status": "success",

"message": "JOSH Net API is running",

"timestamp": "2024-01-06T10:00:00Z"

}

```

  

##  Monitoring & Logging

  

### Request Logging

  

```javascript

app.use((req,  res,  next)  =>  {

console.log(`${req.method}  ${req.path}`,  {

ip: req.ip,

userAgent: req.get('user-agent')

});

next();

});

```

  

### Error Tracking

  

Consider integrating:

- Sentry for error tracking

- Winston for structured logging

- PM2 for process management

  

---

Built with ❤️ using Express.js and Node.js