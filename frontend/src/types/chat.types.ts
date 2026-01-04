import { FileItem } from ".";

export type TabsState = "preview" | "code";

export type MessageRole = "user" | "assistant";

export type StepStatus =  "pending" | "in-progress" | "completed";

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
  status: StepStatus
  code?: string;
  path?: string;
}

export interface PromptMessage {
  role: MessageRole;
  content: string;
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

export interface ChatContextType {
  prompt: string;
  setPrompt: (value: string) => void;
  projectTitle: string;
  tabsState: TabsState;
  currentFile: FileItem | null;
  files: FileItem[];
  newChat: () => Promise<void>;
  changeCurrentFile: (file: FileItem) => void;
  toggleTabsState: (toggle: TabsState) => void;
  messages: ChatMessage[]
}
