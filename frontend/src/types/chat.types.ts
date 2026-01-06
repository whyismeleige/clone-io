import { FileItem } from ".";
import { User } from "./auth.types";

export type TabsState = "preview" | "code";

export type MessageRole = "user" | "assistant";

export type StepStatus = "pending" | "in-progress" | "completed";

export enum StepType {
  CreateFile,
  CreateFolder,
  EditFile,
  DeleteFile,
  RunScript,
}

export interface Step {
  id: number;
  title: string;
  description: string;
  type: StepType;
  status: StepStatus;
  code?: string;
  path?: string;
}

export interface PromptMessage {
  role: MessageRole;
  content: string;
}

export interface ChatConversation {
  role: MessageRole;
  content: string;
  timestamp: string;
}

export type ChatMessage =
  | {
      role: "user";
      content: string;
      timestamp: string;
    }
  | {
      role: "assistant";
      content: Step[];
      timestamp: string;
    };

export interface ChatHistory {
  _id: string;
  projectName: string;
  isStarred: boolean;
  timestamp: string;
}

export interface Chat {
  _id: string;
  projectName: string;
  projectS3Url?: string | null;
  model: string;
  conversations: ChatConversation[];
  githubRepo?: string | null;
  deploymentLink?: string | null;
  visibilityStatus: "public" | "private";
  isStarred: boolean;
  isDeployed: boolean;
  deployedAt?: string | null;
  createdBy?: User | null | string;
  lastActivity: string;
  status: "active" | "archived" | "deleted";
  createdAt: string;
  updatedAt: string;
}

export interface ChatContextType {
  prompt: string;
  setPrompt: (value: string) => void;
  handleSendPrompt: () => void;
  currentChat: Chat | null;
  tabsState: TabsState;
  currentFile: FileItem | null;
  files: FileItem[];
  newChat: (newAccessToken?: string | null, savedPrompt?: string) => Promise<void>;
  changeCurrentFile: (file: FileItem) => void;
  toggleTabsState: (toggle: TabsState) => void;
  messages: ChatMessage[];
  chatHistory: ChatHistory[];
  fetchChatsHistory: () => Promise<void>;
  changeChatDetails: (
    data: {
      toggleStarStatus?: boolean;
      visibilityStatus?: "private" | "public";
      projectName?: string;
    },
    chatId: string
  ) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  fetchSingleChat: (chatId: string) => Promise<void>;
  isStreaming: boolean;
  
}
