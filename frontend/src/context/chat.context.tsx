"use client";
import { useAppSelector } from "@/hooks/redux";
import { useMounted } from "@/hooks/useMounted";
import { FileItem, Step, StepType } from "@/types";
import {
  Chat,
  ChatContextType,
  ChatConversation,
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

const convertConversationsToChatMessages = (
  conversations: ChatConversation[]
): ChatMessage[] => {
  const messages: ChatMessage[] = conversations.map((conversation) => {
    return conversation.role === "assistant"
      ? {
          role: "assistant",
          content: parseXml(conversation.content).map((step) => ({
            ...step,
            status: "completed",
          })),
          timestamp: conversation.timestamp,
        }
      : {
          role: "user",
          content: conversation.content,
          timestamp: conversation.timestamp,
        };
  });
  return messages;
};

const getInitialFile = (nodes: FileItem[]): FileItem => {
  return nodes[0].children ? getInitialFile(nodes[0].children) : nodes[0];
};

// const flattenFileStructure = (
//   files: FileItem[],
//   result: Array<{ path: string; content: string }> = []
// ) => {
//   for (const file of files) {
//     if (file.type === "file" && file.content !== undefined) {
//       result.push({
//         path: file.path.startsWith("/") ? file.path.slice(1) : file.path,
//         content: file.content,
//       });
//     } else if (file.type === "folder" && file.children) {
//       flattenFileStructure(file.children, result);
//     }
//   }
//   return result;
// };

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

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [tabsState, toggleTabsState] = useState<TabsState>("preview");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFile, changeCurrentFile] = useState<FileItem | null>(null);
  const [allStepsProcessed, setAllStepsProcessed] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const filesRef = useRef<FileItem[]>(files);
  const currentChatRef = useRef<Chat | null>(currentChat);
  const accessTokenRef = useRef<string | null>(accessToken);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const getLatestStepsFromMessages = useCallback((): Step[] => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") {
        return messages[i].content as Step[];
      }
    }
    return [];
  }, [messages]);

  const saveFiles = useCallback((files: FileItem[]) => {
    const sortedFiles = sortFilesAndFoldersRecursive(files);
    changeCurrentFile(getInitialFile(files));
    setFiles(sortedFiles);
  }, []);

  const addStepstoLatestMessage = (newSteps: Step[]) => {
    setMessages((prev) => {
      const lastIndex = prev.length - 1;
      if (lastIndex >= 0 && prev[lastIndex].role === "assistant") {
        const updated = [...prev];
        if (updated[lastIndex].role === "assistant") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: [...updated[lastIndex].content, ...newSteps],
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
  // const uploadToS3 = useCallback(
  //   async (newAccessToken?: string | null) => {
  //     const authToken = accessTokenRef.current || newAccessToken;
  //     const currentFilesData = filesRef.current;
  //     const currentChatData = currentChatRef.current;

  //     if (!currentChatData || !authToken || currentFilesData.length === 0) {
  //       return;
  //     }

  //     const flattenedFiles = flattenFileStructure(currentFilesData);

  //     try {
  //       const response = await fetch(
  //         `${BACKEND_URL}/api/chat/upload-project-files?id=${currentChatData._id}`,
  //         {
  //           method: "POST",
  //           headers: {
  //             Authorization: `Bearer ${authToken}`,
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({ files: flattenedFiles }),
  //         }
  //       );
  //       const data = await response.json();
  //     } catch (error) {
  //       console.error("Upload error:", error);
  //     }
  //   },
  //   [] // No dependencies needed since we use refs
  // );

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
  const fetchSingleChat = useCallback(
    async (chatId: string) => {
      try {
        setIsChatLoading(true);
        const response = await fetch(
          `${BACKEND_URL}/api/chat/history?id=${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();

        if (data.type !== "success") throw new Error(data.message);

        setCurrentChat(data.chat);
        setConversations(data.chat.conversations);
        setMessages(
          convertConversationsToChatMessages(data.chat.conversations)
        );
        saveFiles(data.files);
      } catch (error) {
        console.error("Error in fetching chat", error);
        router.replace("/");
      } finally {
        setIsChatLoading(false);
      }
    },
    [accessToken, router, saveFiles]
  );

  // Start of the New Chat
  const newChat = async (
    newAccessToken?: string | null,
    newPrompt?: string
  ) => {
    try {
      const savedPrompt = prompt || newPrompt || "";

      if ((!newAccessToken && !accessToken) || !savedPrompt) return;
      setIsStreaming(true);
      // Add the User Message
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: savedPrompt,
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
        body: JSON.stringify({ prompt: savedPrompt }),
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
      const messages: PromptMessage[] = [...prompts, savedPrompt].map(
        (content) => ({
          role: "user",
          content,
        })
      );

      // Save the Assistant Message
      setConversations([
        {
          role: "user",
          content: savedPrompt,
          timestamp: new Date().toISOString(),
        },
        {
          role: "assistant",
          content: uiPrompts[0],
          timestamp: new Date().toISOString(),
        },
      ]);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: initialSteps,
          timestamp: new Date().toISOString(),
        },
      ]);
      setChatHistory((prev) => [
        ...prev,
        {
          _id: newChat._id,
          isStarred: newChat.isStarred,
          projectName: newChat.projectName,
          timestamp: newChat.createdAt,
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
  // Update the sendPrompt function to also update conversations
  const sendPrompt = async (
    chatId: string | undefined,
    messages: PromptMessage[],
    newAccessToken?: string | null
  ) => {
    try {
      if (!accessToken && !newAccessToken) return;
      const parser = new StreamingXmlParser();
      setIsStreaming(true);

      let fullAssistantResponse = ""; // Track the complete response

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
                    fullAssistantResponse += data.delta; // Accumulate full response

                    const newSteps = parser.parseChunk(data.delta);

                    if (newSteps.length > 0) {
                      addStepstoLatestMessage(newSteps);
                    }
                    break;

                  case "done":
                    setIsStreaming(false);
                    // Update conversations when streaming is done
                    setConversations((prev) => [
                      ...prev,
                      {
                        role: "assistant",
                        content: fullAssistantResponse,
                        timestamp: new Date().toISOString(),
                      },
                    ]);
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

  // Update handleSendPrompt to also update conversations for user message
  const handleSendPrompt = async () => {
    try {
      if (!currentChat) return;

      const userMessage = {
        role: "user" as const,
        content: prompt,
        timestamp: new Date().toISOString(),
      };

      // Update messages
      setMessages((prev) => [...prev, userMessage]);

      // Update conversations with user message
      setConversations((prev) => [...prev, userMessage]);

      // Build prompt messages from updated conversations
      const promptMessages: PromptMessage[] = [
        ...conversations.map((conversation) => ({
          role: conversation.role,
          content: conversation.content,
        })),
        {
          role: "user",
          content: prompt,
        },
      ];

      setPrompt("");

      // Add empty assistant message to messages state
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: [],
          timestamp: new Date().toISOString(),
        },
      ]);

      await sendPrompt(currentChat._id, promptMessages);
    } catch (error) {
      console.error("Error sending prompt");
    }
  };

  const changeChatDetails = async (
    data: {
      toggleStarStatus?: boolean;
      visibilityStatus?: "private" | "public";
      projectName?: string;
    },
    chatId: string
  ) => {
    if (!chatId) return;
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/chat/modify?id=${chatId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `application/json`,
          },
          body: JSON.stringify({ data }),
        }
      );

      const responseData = await response.json();

      if (responseData.type !== "success")
        throw new Error(responseData.message);

      setChatHistory((prevChats) =>
        prevChats.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                isStarred: data.toggleStarStatus
                  ? !chat.isStarred
                  : chat.isStarred,
                projectName: data.projectName
                  ? data.projectName
                  : chat.projectName,
              }
            : chat
        )
      );

      if (chatId === currentChat?._id) {
        setCurrentChat((prev) => {
          if (prev) {
            const curr = { ...prev };
            if (data.toggleStarStatus) curr.isStarred = !curr.isStarred;
            if (data.visibilityStatus)
              curr.visibilityStatus = data.visibilityStatus;
            if (data.projectName) curr.projectName = data.projectName;
            return curr;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error in modifying chat", error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/chat/delete?id=${chatId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.type !== "success") throw new Error(data.message);

      setChatHistory((prevChats) =>
        prevChats.filter((chat) => chat._id !== chatId)
      );
      if (currentChat?._id === chatId) {
        setCurrentChat(null);
        router.replace("/");
      }
    } catch (error) {
      console.error("Error in deleting Chat", error);
    }
  };

  useEffect(() => {
    const steps = getLatestStepsFromMessages();
    const pendingSteps = steps.filter(({ status }) => status === "pending");

    if (pendingSteps.length === 0) return;

    // Deep clone to avoid mutation issues
    const updatedFiles = JSON.parse(JSON.stringify(files));

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
            const fileIndex = currentFileStructure.findIndex(
              (x: FileItem) => x.path === currentFolder
            );

            if (fileIndex === -1) {
              currentFileStructure.push({
                name: currentFolderName,
                type: "file",
                path: currentFolder,
                content: step.code,
              });
            } else {
              currentFileStructure[fileIndex] = {
                ...currentFileStructure[fileIndex],
                content: step.code,
              };
            }
          } else {
            let folderIndex = currentFileStructure.findIndex(
              (x: FileItem) => x.path === currentFolder
            );

            if (folderIndex === -1) {
              currentFileStructure.push({
                name: currentFolderName,
                type: "folder",
                path: currentFolder,
                children: [],
              });
              folderIndex = currentFileStructure.length - 1;
            }

            currentFileStructure = currentFileStructure[folderIndex].children!;
          }
        }
      }
    });

    saveFiles(updatedFiles);
    updateStepstoLatestMessage();
  }, [messages, saveFiles, getLatestStepsFromMessages, files]);

  useEffect(() => {
    if (isStreaming) return;

    const allSteps = getLatestStepsFromMessages();
    const allCompleted =
      allSteps.length > 0 &&
      allSteps.every((step) => step.status === "completed");

    if (allCompleted && !allStepsProcessed) {
      setAllStepsProcessed(true);
    }
  }, [isStreaming, messages, getLatestStepsFromMessages, allStepsProcessed]);

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
    changeChatDetails,
    deleteChat,
    fetchSingleChat,
    isStreaming,
    isChatLoading,
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
