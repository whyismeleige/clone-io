"use client";
import { useAppSelector } from "@/hooks/redux";
import { useMounted } from "@/hooks/useMounted";
import { FileItem, Step, StepType } from "@/types";
import {
  Chat,
  ChatContextType,
  ChatHistory,
  ChatMessage,
  PromptMessage,
  TabsState,
} from "@/types/chat.types";
import { BACKEND_URL } from "@/utils/config";
import { parseXml, StreamingXmlParser } from "@/utils/parse-xml";
import { useRouter } from "next/navigation";
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

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

const flattenFileStructure = (
  files: FileItem[],
  result: Array<{ path: string; content: string }> = []
) => {
  for (const file of files) {
    if (file.type === "file" && file.content !== undefined) {
      result.push({
        path: file.path.startsWith("/") ? file.path.slice(1) : file.path,
        content: file.content,
      });
    } else if (file.type === "folder" && file.children) {
      flattenFileStructure(file.children, result);
    }
  }
  return result;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const isMounted = useMounted();
  const router = useRouter();

  const { accessToken } = useAppSelector((state) => state.auth);

  const [prompt, setPrompt] = useState<string>("");

  useEffect(() => {
    if (isMounted) {
      const savedPrompt = localStorage.getItem("chatPrompt") || "";
      setPrompt(savedPrompt);
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted && prompt) {
      localStorage.setItem("chatPrompt", prompt);
    }
  }, [prompt, isMounted]);

  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [tabsState, toggleTabsState] = useState<TabsState>("code");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFile, changeCurrentFile] = useState<FileItem | null>(null);

  // Get the latest assistant message
  const getLatestAssistantMessage = (): ChatMessage | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") {
        return messages[i];
      }
    }
    return null;
  };

  // Get steps from the latest assistant message
  const getLatestSteps = (): Step[] => {
    const latestAssistant = getLatestAssistantMessage();
    return latestAssistant?.role === "assistant" ? latestAssistant.content : [];
  };

  const saveFiles = async (files: FileItem[]) => {
    const sortedFiles = sortFilesAndFoldersRecursive(files);
    changeCurrentFile(getInitialFile(files));
    setFiles(sortedFiles);
  };

  const addStepstoLatestMessage = (newSteps: Step[]) => {
    setMessages((prev) => {
      const lastIndex = prev.length - 1;
      if (lastIndex >= 0 && prev[lastIndex].role === "assistant") {
        const updated = [...prev];
        if (updated[lastIndex].role === "assistant") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: [...(updated[lastIndex] as any).content, ...newSteps],
          };
        }
        return updated;
      }
      return prev;
    });
  };

  const updateStepstoLatestMessage = () => {
    setMessages((prev) => {
      const lastIndex = prev.length - 1;
      if (lastIndex >= 0 && prev[lastIndex].role === "assistant") {
        const updated = [...prev];
        if (updated[lastIndex].role === "assistant") {
          const updatedContent: Step[] = updated[lastIndex].content.map(
            (content) => ({
              ...content,
              status: "completed",
            })
          );
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updatedContent,
          };
        }
        return updated;
      }
      return prev;
    });
  };

  // Upload files to S3
  const uploadToS3 = useCallback(
    async (newAccessToken?: string | null) => {
      const authToken = accessToken || newAccessToken;

      console.log("The files are", files);
      console.log("The current chat are", currentChat);

      if (!currentChat || !authToken || files.length === 0) {
        console.log("Cannot upload: missing chat, token, or files");
        return;
      }

      const flattenedFiles = flattenFileStructure(files);

      console.log("The flattened files are", flattenedFiles);
      // try {
      //   const response = await fetch(
      //     `${BACKEND_URL}/api/chat/upload-project-files?id=${currentChat._id}`,
      //     {
      //       method: "POST",
      //       headers: {
      //         Authorization: `Bearer ${authToken}`,
      //         "Content-Type": `application/json`,
      //       },
      //     }
      //   );
      // } catch (error) {}
    },
    [files, currentChat, accessToken]
  );

  // Fetch Chats List
  const fetchChatsHistory = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/list`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.type !== "success") throw Error(data.message);

      setChatHistory(data.chats);
    } catch (error) {
      console.error("Error in fetching chats list", error);
    }
  }, [accessToken]);

  // Fetch Single Chat by Id
  const fetchSingleChat = async (chatId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/${chatId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
    } catch (error) {
      console.error("Error in fetching chat", error);
    }
  };

  // Start of the New Chat
  const newChat = async (newAccessToken?: string | null) => {
    try {
      if (!newAccessToken && !accessToken) return;
      // Add the User Message
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: prompt,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Get the UI Template
      const response = await fetch(`${BACKEND_URL}/api/chat/template`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken || newAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.type !== "success") throw new Error(data.message);

      const { prompts, uiPrompts, newChat } = data;

      router.replace(`/chat/${newChat._id}?new=true`);

      // Parse the UI Prompt
      const initialSteps: Step[] = parseXml(uiPrompts[0]).map((step: Step) => ({
        ...step,
        status: "pending",
      }));

      // Convert the base prompts into Prompt messages understandable ot Claude or any AI Assistant
      const messages: PromptMessage[] = [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      }));

      // Save the Assistant Message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: initialSteps,
          timestamp: new Date().toISOString(),
        },
      ]);
      setCurrentChat(newChat);
      setPrompt("");

      // Send the prompt for The Customization of the message
      await sendPrompt(newChat._id, messages, newAccessToken);
    } catch (error) {
      console.error("Error in Creating New Chat");
    }
  };

  // Send the prompt to AI Assistant
  const sendPrompt = async (
    chatId: string | undefined,
    messages: PromptMessage[],
    newAccessToken?: string | null
  ) => {
    try {
      if (!accessToken && !newAccessToken) return;
      // New Parser to Parse the Streaming XML Content
      const parser = new StreamingXmlParser();

      // XML Stream
      const stream = await fetch(`${BACKEND_URL}/api/chat/prompt`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken || newAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages, chatId }),
      });

      if (stream.body) {
        const reader = stream.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                switch (data.type) {
                  case "text_block":
                    accumulatedText += data.delta;

                    // Parse the accumulated text for new steps
                    const newSteps = parser.parseChunk(data.delta);

                    // Add new steps to your state
                    if (newSteps.length > 0) {
                      addStepstoLatestMessage(newSteps);
                    }
                    break;

                  case "done":
                    uploadToS3();
                    break;

                  case "error":
                    console.error("Streaming error", data.error);
                    break;
                }
              } catch (error) {
                console.error("Parse error:", error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in sending Prompt", error);
    }
  };

  const handleSendPrompt = async () => {
    try {
      const newMessages: ChatMessage[] = [
        ...messages,
        {
          role: "user",
          content: prompt,
          timestamp: new Date().toISOString(),
        },
      ];
      setMessages(newMessages);
      
      ``
    } catch (error) {
      console.error("Error sending prompt");
    }
  };

  useEffect(() => {
    const steps = getLatestSteps();
    const pendingSteps = steps.filter(({ status }) => status === "pending");

    if (pendingSteps.length === 0) return;

    // Deep clone to avoid mutation issues
    const updatedFiles = JSON.parse(JSON.stringify(files));
    console.log("The updated files are", files);
    pendingSteps.forEach((step) => {
      if (step?.type === StepType.CreateFile) {
        const parsedPath = step.path?.split("/").filter(Boolean) ?? [];
        let currentFileStructure = updatedFiles;

        let currentFolder = "";

        for (let i = 0; i < parsedPath.length; i++) {
          const currentFolderName = parsedPath[i];
          currentFolder = `${currentFolder}/${currentFolderName}`;
          const isLastItem = i === parsedPath.length - 1;

          if (isLastItem) {
            // Final file - update or createchat/id
            const fileIndex = currentFileStructure.findIndex(
              (x: FileItem) => x.path === currentFolder
            );

            if (fileIndex === -1) {
              // Create new file
              currentFileStructure.push({
                name: currentFolderName,
                type: "file",
                path: currentFolder,
                content: step.code,
              });
            } else {
              // Update existing file
              currentFileStructure[fileIndex] = {
                ...currentFileStructure[fileIndex],
                content: step.code,
              };
            }
          } else {
            // Intermediate folder
            let folderIndex = currentFileStructure.findIndex(
              (x: FileItem) => x.path === currentFolder
            );

            if (folderIndex === -1) {
              // Create new folder
              currentFileStructure.push({
                name: currentFolderName,
                type: "folder",
                path: currentFolder,
                children: [],
              });
              folderIndex = currentFileStructure.length - 1;
            }

            // Navigate into the folder
            currentFileStructure = currentFileStructure[folderIndex].children!;
          }
        }
      }
    });

    saveFiles(updatedFiles);
    updateStepstoLatestMessage();
  }, [messages, files, getLatestSteps]);

  const value: ChatContextType = {
    prompt,
    setPrompt,
    handleSendPrompt,
    currentChat,
    tabsState,
    changeCurrentFile,
    currentFile,
    files,
    newChat,
    toggleTabsState,
    messages,
    chatHistory,
    fetchChatsHistory,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
