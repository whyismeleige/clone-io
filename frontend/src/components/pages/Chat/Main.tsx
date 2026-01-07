"use client";
import AppHeader from "./Header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Editor from "./Editor";
import ChatSection from "./Chat-Section";
import PreviewFrame from "./Preview";
import { useEffect, useState } from "react";
import { FileItem } from "@/types";
import { useWebContainer } from "@/hooks/useWebContainer";
import { cn } from "@/lib/utils";
import { useChatContext } from "@/context/chat.context";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useMounted } from "@/hooks/useMounted";

type MountFile = {
  file: {
    contents: string;
  };
};

type MountDirectory = {
  directory: Record<string, MountFile | MountDirectory>;
};

type MountStructure = Record<string, MountFile | MountDirectory>;

export default function AppMain() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chatId = params?.id as string;
  const isNewChat = searchParams.get("new") === "true";

  const { tabsState, files, fetchSingleChat, isChatLoading } = useChatContext();
  const { webcontainer, error } = useWebContainer();
  const isMounted = useMounted();

  const [isFilesMounted, setIsFilesMounted] = useState(false);

  useEffect(() => {
    const intializeChat = async () => {
      if (!isMounted) return;

      if (searchParams.has("new")) {
        const updatedParams = new URLSearchParams(searchParams.toString());
        updatedParams.delete("new");

        const queryString = updatedParams.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      }

      if (!isNewChat) {
        // When fetching new chat, reset mount status
        setIsFilesMounted(false);
        await fetchSingleChat(chatId);
      }
    };
    intializeChat();
  }, [
    isMounted,
    chatId,
    fetchSingleChat,
    isNewChat,
    pathname,
    router,
    searchParams,
  ]);

  useEffect(() => {
    if (isChatLoading || files.length === 0 || !webcontainer) return;

    const createMountStructure = (files: FileItem[]): MountStructure => {
      const mountStructure: MountStructure = {};

      const processFile = (file: FileItem): MountFile | MountDirectory => {
        if (file.type === "folder") {
          return {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [child.name, processFile(child)])
                )
              : {},
          };
        } else {
          // file.type === "file"
          return {
            file: {
              contents: file.content || "",
            },
          };
        }
      };

      files.forEach((file) => {
        mountStructure[file.name] = processFile(file);
      });

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    // 2. Wrap mount in an async function to await it
    const mountFiles = async () => {
      try {
        await webcontainer.mount(mountStructure);
        // 3. Only set this to true AFTER mount completes
        setIsFilesMounted(true);
      } catch (err) {
        console.error("Failed to mount files", err);
      }
    };

    mountFiles();
  }, [webcontainer, files, isChatLoading]);

  return (
    <div className="flex w-screen flex-col h-screen">
      <AppHeader />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          minSize={25}
          maxSize={80}
          defaultSize={75}
          className="rounded-lg border m-1.5"
        >
          <div
            className={cn(
              "h-full w-full",
              tabsState === "preview" ? "block" : "hidden"
            )}
          >
            <PreviewFrame webContainer={webcontainer} error={error} />
          </div>
          <div
            className={cn(
              "h-full w-full",
              tabsState !== "preview" ? "block" : "hidden"
            )}
          >
            <Editor />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={25} className="m-1.5">
          <ChatSection />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
