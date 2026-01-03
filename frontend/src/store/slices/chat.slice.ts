import { FileItem, Step } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatState {
  currentPrompt: string;
  currentFile: FileItem | null;
  projectTitle: string;
  userPrompts: string[];
  llmMessages: LLMMessage[];
  files: FileItem[];
  steps: Step[];
}

const initialState: ChatState = {
  currentPrompt: "",
  currentFile: null,
  projectTitle: "Sample Project",
  userPrompts: [
    "Could you explain the differences between SQL and NoSQL databases? When should I use each type? I'm working on an e-commerce application and I'm not sure whether to go with PostgreSQL or MongoDB. What factors should I consider when making this decision?",
  ],
  llmMessages: [],
  files: [],
  steps: [],
};

const sortFilesAndFoldersRecursive = (nodes: FileItem[]): FileItem[] => {
  const sorted = nodes.sort((a, b) => {
    if (a.type === "folder" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name);
  });

  return sorted.map((node) => {
    if (node.type === "folder" && node.children) {
      return {
        ...node,
        children: sortFilesAndFoldersRecursive(node.children),
      };
    }
    return node;
  });
};

const getInitialFile = (nodes: FileItem[]): FileItem => {
  return nodes[0].children ? getInitialFile(nodes[0].children) : nodes[0];
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    changeCurrentPrompt: (state, action: PayloadAction<string>) => {
      state.currentPrompt = action.payload;
    },
    changeCurrentFile: (state, action: PayloadAction<FileItem>) => {
      state.currentFile = action.payload;
    },
    changeProjectTitle: (state, action: PayloadAction<string>) => {
      state.projectTitle = action.payload;
    },
    sendPrompt: (state) => {
      state.userPrompts = [...state.userPrompts, state.currentPrompt];
      state.currentPrompt = "";
    },
    saveLLMMessages: (state, action: PayloadAction<LLMMessage[]>) => {
      state.llmMessages = action.payload;
    },
    saveFiles: (state, action: PayloadAction<FileItem[]>) => {
      const sortedFiles = sortFilesAndFoldersRecursive(action.payload);
      state.currentFile = getInitialFile(sortedFiles);
      state.files = sortedFiles;
    },
    saveSteps: (state, action: PayloadAction<Step[]>) => {
      state.steps = action.payload;
    },
  },
});

export const {
  changeCurrentPrompt,
  changeCurrentFile,
  changeProjectTitle,
  sendPrompt,
  saveLLMMessages,
  saveFiles,
  saveSteps,
} = chatSlice.actions;

export default chatSlice.reducer;
