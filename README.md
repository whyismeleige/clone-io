# Clone.io

A powerful AI-powered web development platform that allows users to create, clone, and customize websites using natural language prompts. Built with Next.js, Express, and Claude AI.

## Features

### Core Features

- **AI-Powered Code Generation**: Generate complete web projects using natural language prompts

- **Real-time Preview**: Instant preview of your project with WebContainer integration

- **Code Editor**: Monaco-based code editor with syntax highlighting

- **File Management**: Full-featured file tree with create, edit, and delete operations

- **Multiple Authentication**: Support for Google, GitHub, and local authentication

- **Project History**: Save and manage multiple projects with chat history

- **Responsive Design**: Beautiful, mobile-friendly interface built with Tailwind CSS

### AI Capabilities

- Website cloning from URL or description

- Component generation with React + TypeScript

- Full-stack project scaffolding

- Intelligent code suggestions and modifications

- Real-time streaming responses

### Developer Features

- **Live Development Server**: Automatic preview updates

- **Package Management**: Automatic dependency installation

- **Code Execution**: In-browser code execution with WebContainer

- **Export Projects**: Download projects as ZIP files

- **S3 Integration**: Cloud storage for project files

## Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)

- **Language**: TypeScript

- **Styling**: Tailwind CSS

- **UI Components**: Radix UI

- **State Management**: Redux Toolkit

- **Code Editor**: Monaco Editor

- **Animations**: Framer Motion

- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js

- **Framework**: Express.js

- **Database**: MongoDB with Mongoose

- **Cache**: Redis

- **Authentication**: Passport.js (Google & GitHub OAuth)

- **AI Integration**: Anthropic Claude API

- **Storage**: AWS S3

- **Security**: JWT, bcrypt

### DevOps & Tools

- **Container**: WebContainer (in-browser Node.js runtime)

- **File Processing**: Various file format handlers

- **API Communication**: REST with Server-Sent Events (SSE)

---

## Project Structure

```

clone-io/

├── frontend/ # Next.js frontend application

│ ├── src/

│ │ ├── app/ # Next.js app router pages

│ │ ├── components/ # React components

│ │ ├── context/ # React context providers

│ │ ├── hooks/ # Custom React hooks

│ │ ├── store/ # Redux store and slices

│ │ ├── types/ # TypeScript type definitions

│ │ └── utils/ # Utility functions

│ └── public/ # Static assets

│

└── backend/ # Express.js backend application

├── config/ # Configuration files

├── controllers/ # Route controllers

├── database/ # Database connections

├── middleware/ # Express middleware

├── models/ # Mongoose models

├── routes/ # API routes

└── utils/ # Utility functions

```

## Usage

### Creating a New Project

1.  **Login/Signup**: Authenticate using Google, GitHub, or email

2.  **Enter Prompt**: Describe the website you want to create

3.  **AI Generation**: Claude AI generates the complete project structure

4.  **Live Preview**: View your project in real-time

5.  **Edit & Customize**: Modify code using the integrated editor

6.  **Export**: Download your project as a ZIP file

### Example Prompts

```

"Create a modern portfolio website with dark mode"

"Build a todo app with React and local storage"

"Clone the design of https://www.stripe.com"

"Make a snake game using HTML canvas"

```

## Security Features

- JWT-based authentication with refresh tokens

- Rate limiting on failed login attempts

- Account lockout after multiple failed attempts

- Secure password hashing with bcrypt

- Redis session management

- CORS protection

- OAuth 2.0 integration

- Environment variable protection

  ***

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user

- `POST /api/auth/login` - Login user

- `GET /api/auth/google` - Google OAuth

- `GET /api/auth/github` - GitHub OAuth

- `POST /api/auth/logout` - Logout user

### Chat Endpoints

- `GET /api/chat/list` - Get user's chat history

- `GET /api/chat/history?id=:chatId` - Get specific chat

- `POST /api/chat/template` - Create new project template

- `POST /api/chat/prompt` - Send prompt to AI (SSE)

- `POST /api/chat/upload-project-files` - Upload files to S3

## Roadmap

- [ ] Add deployment integration (Vercel, Netlify)

- [ ] Support for more AI models

- [ ] Collaborative editing

- [ ] Template marketplace

- [ ] Version control integration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team

- **Developer**: Piyush Jain

- **GitHub**: [@whyismeleige](https://github.com/whyismeleige)

---

Made with ❤️ by the Clone.io team
