# Clone.io Frontend

Next.js-based frontend application for Clone.io - an AI-powered web development platform.

## Architecture

### Tech Stack

-   **Framework**: Next.js 14.0+ (App Router)
-   **Language**: TypeScript 5.0+
-   **Styling**: Tailwind CSS 3.4+
-   **State Management**: Redux Toolkit
-   **UI Components**: Radix UI primitives
-   **Code Editor**: Monaco Editor
-   **Animations**: Framer Motion
-   **Icons**: Lucide React

### Project Structure

```
frontend/
├── public/                    # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── auth/             # Authentication pages
│   │   ├── chat/             # Chat interface pages
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   │
│   ├── components/           # React components
│   │   ├── pages/           # Page-specific components
│   │   │   ├── Auth/        # Authentication UI
│   │   │   ├── Chat/        # Chat interface
│   │   │   │   ├── Chat-Section/  # Chat message area
│   │   │   │   ├── Editor/        # Code editor
│   │   │   │   ├── Preview/       # Live preview
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Main.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── Landing/     # Landing page
│   │   │
│   │   ├── routes/          # Route guards
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── PublicRoute.tsx
│   │   │
│   │   ├── shared/          # Shared components
│   │   │   ├── Alert/
│   │   │   ├── Auth/
│   │   │   ├── Dropdown/
│   │   │   ├── ModelCombobox/
│   │   │   └── Navbar/
│   │   │
│   │   ├── motion-primitives/  # Animation components
│   │   │   ├── animated-group.tsx
│   │   │   └── text-effect.tsx
│   │   │
│   │   └── ui/              # Base UI components (Radix-based)
│   │       ├── accordion.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── sidebar.tsx
│   │       ├── tabs.tsx
│   │       └── ... (30+ components)
│   │
│   ├── context/             # React Context providers
│   │   ├── chat.context.tsx
│   │   └── theme-provider.tsx
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── redux.ts
│   │   ├── use-mobile.ts
│   │   ├── useMounted.ts
│   │   └── useWebContainer.ts
│   │
│   ├── store/               # Redux store
│   │   ├── slices/
│   │   │   ├── alert.slice.ts
│   │   │   └── auth.slice.ts
│   │   └── index.ts
│   │
│   ├── types/               # TypeScript types
│   │   ├── alert.types.ts
│   │   ├── auth.types.ts
│   │   ├── chat.types.ts
│   │   └── index.ts
│   │
│   └── utils/               # Utility functions
│       ├── config.ts
│       ├── dummy-data.ts
│       ├── parse-xml.tsx
│       └── providers.tsx
│
├── .env.local               # Environment variables
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies

```

---

##  Design System

### Theme Configuration

The app uses a custom theme system with CSS variables defined in `globals.css`:

```css
:root {
  --background: oklch(0.9940 0 0);
  --foreground: oklch(0 0 0);
  --primary: oklch(0.5393 0.2713 286.7462);
  --secondary: oklch(0.9540 0.0063 255.4755);
  /* ... more variables */
}

.dark {
  --background: oklch(0.2223 0.0060 271.1393);
  --foreground: oklch(0.9551 0 0);
  /* ... dark mode variables */
}

```

### UI Components

All UI components are built with Radix UI primitives and follow these principles:

-   **Accessibility**: ARIA compliant, keyboard navigation
-   **Customizable**: Style with Tailwind classes
-   **Composable**: Build complex UIs from simple components
-   **Type-safe**: Full TypeScript support

Example usage:

```tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <p>Dialog content here</p>
  </DialogContent>
</Dialog>

```

## Key Features

### 1. WebContainer Integration

In-browser Node.js runtime for live code execution:

```tsx
import { useWebContainer } from "@/hooks/useWebContainer";

const { webcontainer, error, isLoading } = useWebContainer();

// Mount files
await webcontainer?.mount({
  'index.js': {
    file: { contents: 'console.log("Hello")' }
  }
});

// Run commands
const process = await webcontainer?.spawn('npm', ['install']);

```

### 2. Real-time AI Chat

Server-Sent Events (SSE) for streaming responses:

```tsx
const stream = await fetch('/api/chat/prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages, chatId })
});

const reader = stream.body?.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  // Process streaming data
  const chunk = decoder.decode(value);
  parseChunk(chunk);
}

```

### 3. File Management

Dynamic file tree with operations:

```tsx
// File structure type
interface FileItem {
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileItem[];
}

// Update file content
const updateFile = (path: string, content: string) => {
  // Update file in tree
};

```

### 4. Code Editor

Monaco Editor integration:

```tsx
import Editor from "@monaco-editor/react";

<Editor
  height="100%"
  theme={theme === "dark" ? "vs-dark" : "light"}
  language="typescript"
  value={code}
  onChange={(value) => setCode(value || "")}
  options={{
    minimap: { enabled: false },
    fontSize: 14
  }}
/>

```

## State Management

### Redux Store Structure

```typescript
interface RootState {
  auth: AuthState;
  alert: AlertState;
}

// Auth slice
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Alert slice
interface AlertState {
  alerts: Alert[];
}

```

### Usage Example

```tsx
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginUser } from "@/store/slices/auth.slice";

const { user, isAuthenticated } = useAppSelector((state) => state.auth);
const dispatch = useAppDispatch();

// Dispatch async action
await dispatch(loginUser({ email, password })).unwrap();

```

## Authentication Flow

### OAuth Flow

1.  User clicks "Login with Google/GitHub"
2.  Redirect to OAuth provider
3.  Provider redirects to `/auth/callback?code=...`
4.  Exchange code for tokens
5.  Store tokens in localStorage
6.  Redirect to dashboard

```tsx
// OAuth exchange
const code = searchParams.get("code");
await dispatch(exchangeOAuthCode(code)).unwrap();

```

### Protected Routes

```tsx
// Wrap pages that require authentication
<ProtectedRoute>
  <ChatPage />
</ProtectedRoute>

// Redirect unauthenticated users
<PublicRoute>
  <LoginPage />
</PublicRoute>

```
---

## Build & Deployment

### Production Build

```bash
npm run build

```

### Environment-specific Builds

```bash
# Development
NODE_ENV=development npm run build

# Production
NODE_ENV=production npm run build

```

### Deployment Platforms

-   **Vercel**: Automatic deployment from Git
-   **Netlify**: Build command: `npm run build`
-   **Custom**: Serve `.next` directory



Built with ❤️ using Next.js and TypeScript