# Clone.io

A powerful AI-powered web development platform that allows users to create and customize websites using natural language prompts. Built with Next.js, Express, and Claude AI.

## Features

### Core Features

- **AI-Powered Code Generation**: Generate complete React/Node.js projects using natural language prompts
- **Real-time Preview**: Instant preview of your project with WebContainer integration
- **Read-Only Code Editor**: Monaco-based code editor with syntax highlighting for viewing generated code
- **File Management**: Browse and search through generated project files
- **Multiple Authentication**: Support for GitHub OAuth and local authentication
- **Project History**: Save and manage multiple projects with conversation history
- **Public Gallery**: View and explore public projects created by the community
- **Responsive Design**: Beautiful, mobile-friendly interface built with Tailwind CSS
- **Device Preview**: Test your projects in desktop, tablet, and mobile views

### AI Capabilities

- React + Vite project generation with TypeScript
- Node.js project scaffolding
- Intelligent code generation based on prompts
- Real-time streaming responses with step-by-step progress
- Automatic dependency management
- Project customization through conversational AI

### Developer Features

- **Live Development Server**: Automatic preview updates with hot reload
- **Package Management**: Automatic npm package installation
- **Code Execution**: In-browser code execution with WebContainer
- **Export Projects**: Download complete projects as ZIP files
- **S3 Integration**: Cloud storage for project files and snapshots
- **Project Visibility**: Toggle between public and private projects
- **Star Projects**: Mark favorite projects for easy access

## Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.4+ with custom design tokens
- **UI Components**: Radix UI primitives
- **State Management**: Redux Toolkit with persistence
- **Code Editor**: Monaco Editor
- **Animations**: Framer Motion (motion/react)
- **Icons**: Lucide React
- **Runtime**: WebContainer API for in-browser Node.js

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Database**: MongoDB with Mongoose
- **Cache**: Redis for session management
- **Authentication**: Passport.js (GitHub OAuth)
- **AI Integration**: Anthropic Claude API (Sonnet 4.5, Haiku 3)
- **Storage**: AWS S3 with CloudFront CDN
- **Security**: JWT tokens, bcrypt password hashing
- **File Upload**: Multer for multipart/form-data

### DevOps & Tools

- **Container**: WebContainer (in-browser Node.js runtime)
- **File Processing**: JSZip for project exports
- **API Communication**: REST with Server-Sent Events (SSE) for streaming

---

## Project Structure

```
clone-io/
├── frontend/             # Next.js frontend application
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # React components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── store/       # Redux store and slices
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
│
└── backend/             # Express.js backend application
    ├── config/          # Configuration files (S3, etc.)
    ├── controllers/     # Route controllers
    ├── database/        # Database connections (MongoDB, Redis)
    ├── middleware/      # Express middleware
    ├── models/          # Mongoose models
    ├── routes/          # API routes
    └── utils/           # Utility functions and AI prompts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance
- Redis instance
- AWS S3 bucket
- Anthropic API key

### Environment Variables

#### Frontend (.env.local)

```bash
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

#### Backend (.env)

```bash
# Server
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017
DB_NAME=clone-io

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRE=7d

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Anthropic API
ANTHROPIC_API_KEY=your-anthropic-api-key

# AWS S3
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
AWS_S3_ACCESS_KEY=your-access-key
AWS_S3_SECRET_ACCESS_KEY=your-secret-key
CDN_URL=https://your-cdn-url.cloudfront.net
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/whyismeleige/clone-io.git
cd clone-io
```

2. **Install dependencies**

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Set up environment variables**

Create `.env.local` in the frontend directory and `.env` in the backend directory with the required variables.

4. **Start MongoDB and Redis**

Make sure MongoDB and Redis are running on your system.

5. **Run the development servers**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:8080`.

## Usage

### Creating a New Project

1. **Login/Signup**: Authenticate using GitHub or email
2. **Enter Prompt**: Describe the website you want to create in natural language
3. **AI Generation**: Claude AI generates the complete project structure with files
4. **Live Preview**: View your project running in real-time in the browser
5. **Browse Code**: Explore generated files using the file browser and code editor
6. **Customize**: Continue the conversation to modify and enhance your project
7. **Export**: Download your project as a ZIP file when ready

### Example Prompts

```
"Create a modern portfolio website with dark mode and a hero section"

"Build a todo app with React using local storage for persistence"

"Make a landing page for a SaaS product with pricing tiers"

"Create a blog with markdown support and syntax highlighting"
```

### Managing Projects

- **Star Projects**: Click the star icon to mark important projects
- **Privacy Control**: Toggle between public and private visibility
- **Rename**: Update project names from the dropdown menu
- **Delete**: Remove projects you no longer need
- **Search**: Find projects by name in the sidebar

## API Documentation

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
  "user": { /* user object */ },
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
```

#### GitHub OAuth
```http
GET /api/auth/github
# Redirects to GitHub OAuth consent screen

GET /api/auth/github/callback
# Callback URL after GitHub authorization
```

#### Exchange OAuth Code
```http
POST /api/auth/exchange
Content-Type: application/json

{
  "code": "temp-code-from-redirect"
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
```

### Chat/Project Endpoints

All chat endpoints require authentication via Bearer token.

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
```

#### Get Single Project
```http
GET /api/chat/history?id=<chat-id>
Authorization: Bearer <access-token>

Response: 200 OK
{
  "message": "Chat retrieved successfully",
  "type": "success",
  "chat": { /* chat object with conversations */ },
  "files": [ /* file tree structure */ ]
}
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
  "newChat": { /* chat object */ },
  "prompts": [ /* system prompts */ ],
  "uiPrompts": [ /* UI template */ ]
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
data: {"type":"done","message":{...}}
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
      "content": "import React..."
    }
  ]
}
```

#### Modify Project
```http
PATCH /api/chat/modify?id=<chat-id>
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "data": {
    "toggleStarStatus": true,
    "visibilityStatus": "public",
    "projectName": "New Name"
  }
}
```

#### Delete Project
```http
DELETE /api/chat/delete?id=<chat-id>
Authorization: Bearer <access-token>
```

#### Get Public Projects
```http
GET /api/chat/public?limit=6

Response: 200 OK
{
  "message": "Public projects received",
  "type": "success",
  "projects": [ /* array of public projects */ ]
}
```

#### Upload Project Snapshot
```http
POST /api/chat/upload-snapshot
Content-Type: multipart/form-data

Form Data:
- snapshot: <image file>
- chatId: <chat-id>
```

### Error Responses

All endpoints may return error responses with the following structure:

```json
{
  "message": "Error message",
  "type": "error",
  "stack": "..." // Only in development mode
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
- `502` - Bad Gateway (external API error)

## Security Features

### Authentication & Authorization

**JWT Token Strategy:**
- Access tokens: 1 hour expiry
- Refresh tokens: 7 days expiry
- Tokens stored in MongoDB with metadata
- Redis caching for user sessions (5 min TTL)

**Account Protection:**
- Auto-lock after 5 failed login attempts
- 5-minute lockout period
- Login attempt tracking with metadata (IP, user agent, location)

**Password Security:**
- Bcrypt hashing with 12 salt rounds
- Minimum 8 characters required
- Never stored in plain text

### Data Protection

- Environment variables for sensitive data
- CORS protection with whitelisted origins
- Secure HTTP-only cookies (in production)
- Input validation and sanitization
- MongoDB injection prevention

## Architecture Highlights

### Frontend Architecture

**State Management:**
- Redux Toolkit for global state (auth, alerts)
- React Context for chat/project state
- Redux Persist for authentication persistence
- Zustand-like hooks for local component state

**Routing:**
- Next.js App Router for file-based routing
- Protected routes with authentication guards
- Public routes for landing and auth pages
- Dynamic routes for individual chat pages

**Real-time Features:**
- Server-Sent Events (SSE) for AI streaming
- WebContainer for in-browser Node.js execution
- Live preview with automatic refresh
- Hot module replacement in development

### Backend Architecture

**API Design:**
- RESTful endpoints with clear naming
- Streaming responses for AI interactions
- Error handling with custom error classes
- Async/await with try-catch wrappers

**Database Design:**
- MongoDB for flexible document storage
- Mongoose schemas with validation
- Virtual properties for computed values
- Pre/post hooks for business logic
- Soft delete pattern for data retention

**AI Integration:**
- Claude Sonnet 4.5 for code generation (16k max tokens)
- Claude Haiku 3 for quick classifications (200 tokens)
- Streaming responses with event-based architecture
- Custom prompt engineering for optimal results
- WebContainer constraints in system prompts

## Deployment

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy automatically on push

### Backend Deployment

**Option 1: Traditional Hosting**
```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start server.js --name clone-io-api

# Configure nginx reverse proxy
# Set environment variables
# Enable SSL with Let's Encrypt
```

**Option 2: Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
```

### Database & Storage

- **MongoDB Atlas**: Managed MongoDB hosting
- **Redis Cloud**: Managed Redis hosting
- **AWS S3**: File storage with CloudFront CDN
- **Environment**: Separate staging and production

## Monitoring & Logging

### Health Checks

```http
GET /health

Response: 200 OK
{
  "status": "success",
  "message": "JOSH Net API is running",
  "timestamp": "2024-01-06T10:00:00Z"
}
```

### Recommended Tools

- **Sentry**: Error tracking and monitoring
- **Winston**: Structured logging
- **PM2**: Process management and monitoring
- **MongoDB Atlas Monitoring**: Database performance
- **CloudWatch**: AWS service monitoring

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Anthropic Claude AI](https://www.anthropic.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Code editor powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- In-browser runtime by [WebContainer](https://webcontainer.io/)

## Team

- **Developer**: Piyush Jain
- **GitHub**: [@whyismeleige](https://github.com/whyismeleige)
- **Email**: pjain.work@proton.me

---

Made with ❤️ using Next.js, Express, and Claude