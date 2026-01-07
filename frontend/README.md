# Clone.io Frontend

Next.js-based frontend application for Clone.io - an AI-powered web development platform.

## Architecture

### Tech Stack

- **Framework**: Next.js 14.0+ (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.4+ with custom design tokens
- **State Management**: Redux Toolkit with Redux Persist
- **UI Components**: Radix UI primitives
- **Code Editor**: Monaco Editor
- **Animations**: Framer Motion (motion/react)
- **Icons**: Lucide React
- **Runtime**: WebContainer API for in-browser Node.js
- **File Management**: JSZip for exports

### Project Structure

```
frontend/
├── public/                    # Static assets
│   ├── clone-io-favicon.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── auth/             # Authentication pages
│   │   │   ├── callback/     # OAuth callback handler
│   │   │   ├── error/        # Auth error page
│   │   │   ├── layout.tsx    # Auth layout with PublicRoute
│   │   │   └── page.tsx      # Login/Signup page
│   │   ├── chat/             # Chat interface pages
│   │   │   ├── [id]/         # Dynamic chat page
│   │   │   ├── layout.tsx    # Chat layout
│   │   │   └── loading.tsx   # Loading state
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   └── globals.css       # Global styles with custom properties
│   │
│   ├── components/           # React components
│   │   ├── pages/           # Page-specific components
│   │   │   ├── Auth/        # Authentication UI
│   │   │   │   └── index.tsx
│   │   │   ├── Chat/        # Chat interface
│   │   │   │   ├── Chat-Section/     # Chat message area
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── Editor/           # Code editor & file browser
│   │   │   │   │   ├── CodeEditor.tsx
│   │   │   │   │   ├── FileStructure.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── Terminal.tsx (disabled)
│   │   │   │   ├── Preview/          # Live preview frame
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Main.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── index.tsx
│   │   │   └── Landing/     # Landing page components
│   │   │       ├── Header.tsx
│   │   │       ├── Hero.tsx
│   │   │       └── index.tsx
│   │   │
│   │   ├── routes/          # Route guards
│   │   │   ├── ProtectedRoute.tsx  # Auth required
│   │   │   └── PublicRoute.tsx     # Redirect if authenticated
│   │   │
│   │   ├── shared/          # Shared components
│   │   │   ├── Alert/       # Alert notifications
│   │   │   │   ├── Alert.tsx
│   │   │   │   └── AlertContainer.tsx
│   │   │   ├── Auth/        # Auth buttons
│   │   │   │   ├── GithubLogin.tsx
│   │   │   │   └── GoogleLogin.tsx (Google OAuth removed)
│   │   │   ├── Dialogs/     # Dialog components
│   │   │   │   ├── DeleteChat.tsx
│   │   │   │   ├── RenameChatTitle.tsx
│   │   │   │   └── SettingsDialog.tsx
│   │   │   ├── Dropdown/    # Dropdown menus
│   │   │   │   └── UserDropdown.tsx
│   │   │   ├── ModelCombobox/  # AI model selector
│   │   │   │   └── index.tsx
│   │   │   └── Navbar/      # Navigation bar (empty)
│   │   │       └── index.tsx
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
│   │       ├── button-group.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── field.tsx
│   │       ├── input.tsx
│   │       ├── input-group.tsx
│   │       ├── item.tsx
│   │       ├── kbd.tsx
│   │       ├── label.tsx
│   │       ├── mode-toggle.tsx
│   │       ├── popover.tsx
│   │       ├── resizable.tsx
│   │       ├── separator.tsx
│   │       ├── sidebar.tsx
│   │       ├── spinner.tsx
│   │       ├── tabs.tsx
│   │       └── tooltip.tsx
│   │
│   ├── context/             # React Context providers
│   │   ├── chat.context.tsx      # Chat state management
│   │   └── theme-provider.tsx    # Theme context
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── redux.ts         # Typed Redux hooks
│   │   ├── use-mobile.ts    # Mobile detection
│   │   ├── useMounted.ts    # SSR-safe mount detection
│   │   └── useWebContainer.ts  # WebContainer singleton
│   │
│   ├── store/               # Redux store
│   │   ├── slices/
│   │   │   ├── alert.slice.ts   # Alert notifications
│   │   │   └── auth.slice.ts    # Authentication
│   │   └── index.ts         # Store configuration
│   │
│   ├── types/               # TypeScript types
│   │   ├── alert.types.ts   # Alert interfaces
│   │   ├── auth.types.ts    # Auth interfaces
│   │   ├── chat.types.ts    # Chat interfaces
│   │   └── index.ts         # Shared types (Step, FileItem)
│   │
│   └── utils/               # Utility functions
│       ├── config.ts        # Environment config
│       ├── dummy-data.ts    # Mock data for development
│       ├── parse-xml.tsx    # XML response parser
│       └── providers.tsx    # App providers wrapper
│
├── .env.local               # Environment variables
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

---

## Design System

### Theme Configuration

The app uses a custom theme system with CSS variables defined in `globals.css`:

**Light Mode:**
```css
:root {
  --background: oklch(0.9940 0 0);
  --foreground: oklch(0 0 0);
  --primary: oklch(0.5393 0.2713 286.7462);
  --secondary: oklch(0.9540 0.0063 255.4755);
  /* ... more variables */
}
```

**Dark Mode:**
```css
.dark {
  --background: oklch(0.2223 0.0060 271.1393);
  --foreground: oklch(0.9551 0 0);
  --primary: oklch(0.6132 0.2294 291.7437);
  /* ... dark mode variables */
}
```

**Custom Properties:**
- Custom fonts: Plus Jakarta Sans, Lora, IBM Plex Mono
- Dynamic shadows with opacity control
- Responsive spacing unit: `--spacing: 0.27rem`
- Border radius: `--radius: 1.4rem`
- Letter tracking: `--tracking-normal: -0.025em`

### UI Components

All UI components are built with Radix UI primitives and follow these principles:

- **Accessibility**: ARIA compliant, keyboard navigation
- **Customizable**: Style with Tailwind classes
- **Composable**: Build complex UIs from simple components
- **Type-safe**: Full TypeScript support

**Example usage:**

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

**Implementation Details:**
- Singleton pattern to prevent multiple instances
- Boot on first hook call, reuse for subsequent calls
- Automatic cleanup on unmount
- Error handling with user-friendly messages

### 2. Real-time AI Streaming

Server-Sent Events (SSE) for streaming responses:

```tsx
const stream = await fetch('/api/chat/prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages, chatId })
});

const reader = stream.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      // Process streaming data
    }
  }
}
```

**StreamingXmlParser:**
- Incremental XML parsing
- Extract steps as they stream in
- Support for file creation and shell commands
- Buffer management for incomplete tags

### 3. File Management

Dynamic file tree with operations:

```tsx
interface FileItem {
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileItem[];
}

// Hierarchical structure
const files: FileItem[] = [
  {
    name: "src",
    type: "folder",
    path: "/src",
    children: [
      {
        name: "App.tsx",
        type: "file",
        path: "/src/App.tsx",
        content: "import React..."
      }
    ]
  }
];
```

**File Operations:**
- Read-only browsing
- File search by name and content
- Context highlighting for search results
- Collapsible folder structure
- Path breadcrumbs with navigation

### 4. Code Editor

Monaco Editor integration with read-only mode:

```tsx
import Editor from "@monaco-editor/react";

<Editor
  height="100%"
  theme={theme === "dark" ? "vs-dark" : "light"}
  language="typescript"
  value={code}
  options={{
    readOnly: true,
    wordWrap: "on",
    minimap: { enabled: false }
  }}
/>
```

**Language Detection:**
- Automatic language detection from file extension
- Support for 15+ programming languages
- Syntax highlighting
- Code folding

### 5. Live Preview

In-browser preview with device simulation:

```tsx
interface DeviceType = "desktop" | "tablet" | "mobile";

const DEVICE_SIZES = {
  desktop: { width: "100%", height: "100%" },
  tablet: { width: "768px", height: "100%" },
  mobile: { width: "375px", height: "667px" }
};

<iframe
  src={webContainerUrl}
  style={{
    width: DEVICE_SIZES[device].width,
    height: DEVICE_SIZES[device].height
  }}
/>
```

**Features:**
- Fullscreen mode
- Device simulation (desktop/tablet/mobile)
- Refresh button
- Port display
- Loading states with timeout detection

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

**Persistence:**
- Redux Persist for auth state
- LocalStorage for tokens
- Session management with refresh tokens

### Chat Context

Manages chat/project state:

```typescript
interface ChatContextType {
  prompt: string;
  setPrompt: (value: string) => void;
  handleSendPrompt: () => void;
  currentChat: Chat | null;
  currentFile: FileItem | null;
  files: FileItem[];
  messages: ChatMessage[];
  chatHistory: ChatHistory[];
  isStreaming: boolean;
  isChatLoading: boolean;
  // ... more methods
}
```

**Key Responsibilities:**
- Chat creation and management
- Message streaming
- File structure management
- Conversation history
- S3 file uploads

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

### Local Authentication

1. User enters email and password
2. Frontend validates input
3. POST to `/api/auth/login` or `/api/auth/register`
4. Backend validates credentials
5. JWT tokens returned
6. Tokens stored in localStorage
7. User redirected to dashboard

### OAuth Flow (GitHub)

1. User clicks "Login with GitHub"
2. Redirect to `/api/auth/github`
3. Backend redirects to GitHub OAuth
4. User authorizes on GitHub
5. GitHub redirects to `/api/auth/github/callback`
6. Backend creates/links user account
7. Temporary code stored in Redis
8. Frontend redirected to `/auth/callback?code=...`
9. Frontend exchanges code for tokens
10. Tokens stored, user logged in

**OAuth Exchange:**
```tsx
const code = searchParams.get("code");
await dispatch(exchangeOAuthCode(code)).unwrap();

// Check for pending prompt
const savedPrompt = localStorage.getItem("chatPrompt");
if (savedPrompt) {
  await newChat(newAccessToken, savedPrompt);
}
```

### Token Management

```typescript
export const TokenService = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setAccessToken: (token: string) => localStorage.setItem("accessToken", token),
  setRefreshToken: (token: string) => localStorage.setItem("refreshToken", token),
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
  isTokenExpired: (token: string) => {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  }
};
```

### Protected Routes

```tsx
// Wrap pages that require authentication
<ProtectedRoute>
  <ChatPage />
</ProtectedRoute>

// Redirect authenticated users
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

**ProtectedRoute Logic:**
1. Check for accessToken in localStorage
2. Fetch user profile if not in Redux
3. Redirect to `/auth` if not authenticated
4. Show loading state during validation

## Component Patterns

### 1. Server Components (Default)

Used for static pages and layouts:

```tsx
// app/page.tsx
export default function Page() {
  return <Hero />;
}
```

### 2. Client Components

Used for interactivity:

```tsx
"use client";

export default function Chat() {
  const [message, setMessage] = useState("");
  // ... interactive logic
}
```

### 3. Compound Components

Used for flexible composition:

```tsx
<InputGroup>
  <InputGroupTextarea placeholder="Enter prompt" />
  <InputGroupAddon>
    <ModelCombobox />
    <InputGroupButton>Send</InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

### 4. Render Props

Used for reusable logic:

```tsx
<Collapsible>
  {(isOpen) => (
    <>
      <CollapsibleTrigger>
        {isOpen ? <Minus /> : <Plus />}
      </CollapsibleTrigger>
      <CollapsibleContent>{/* ... */}</CollapsibleContent>
    </>
  )}
</Collapsible>
```

## Performance Optimizations

### 1. Code Splitting

- Automatic route-based splitting with Next.js
- Dynamic imports for heavy components
- Lazy loading for Monaco Editor

### 2. Memoization

```tsx
// Memoize search results
const searchResults = useMemo(
  () => searchFiles(files, searchQuery),
  [files, searchQuery]
);

// Memoize callbacks
const handleClick = useCallback(() => {
  // ... logic
}, [dependencies]);
```

### 3. Image Optimization

- Next.js Image component for automatic optimization
- Lazy loading for off-screen images
- Responsive images with srcset

### 4. Bundle Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
};
```

## Error Handling

### Global Error Boundary

```tsx
// app/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### API Error Handling

```tsx
try {
  await dispatch(loginUser({ email, password })).unwrap();
} catch (error) {
  dispatch(showError(error.message));
}
```

### WebContainer Errors

- Timeout detection (60 seconds)
- User-friendly error messages
- Refresh button for recovery
- Email support link

## Testing Strategy

### Unit Tests (Recommended)

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

```tsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Integration Tests

- Test auth flows
- Test chat creation
- Test file operations
- Test preview functionality

### E2E Tests (Recommended)

```bash
npm install --save-dev @playwright/test
```

```tsx
import { test, expect } from '@playwright/test';

test('user can create a project', async ({ page }) => {
  await page.goto('/');
  await page.fill('[name="prompt"]', 'Create a todo app');
  await page.click('button:has-text("Send")');
  await expect(page.locator('iframe')).toBeVisible();
});
```

## Build & Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

### Environment-specific Builds

```bash
# Development
NODE_ENV=development npm run build

# Production
NODE_ENV=production npm run build
```

### Deployment Platforms

**Vercel (Recommended):**
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Automatic deployment on push

**Netlify:**
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Set environment variables
4. Deploy

**Custom Server:**
```bash
# Build the app
npm run build

# Start with PM2
pm2 start npm --name "clone-io-frontend" -- start

# Or use Node.js
node .next/standalone/server.js
```

## Troubleshooting

### Common Issues

**1. WebContainer not loading:**
- Check browser compatibility (Chromium-based browsers only)
- Clear browser cache
- Disable browser extensions
- Check console for errors

**2. Authentication not working:**
- Verify environment variables
- Check backend is running
- Clear localStorage and try again
- Verify OAuth redirect URLs

**3. Preview not showing:**
- Wait for "Server ready" message
- Check for port conflicts
- Verify npm install completed
- Check console for errors

**4. File uploads failing:**
- Check S3 credentials
- Verify bucket permissions
- Check file size limits
- Verify CORS configuration

### Debug Mode

Enable debug logging:

```typescript
// Add to .env.local
NEXT_PUBLIC_DEBUG=true

// Use in components
if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
  console.log('Debug info:', data);
}
```

## Contributing

See the main repository README for contribution guidelines.

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ using Next.js and TypeScript