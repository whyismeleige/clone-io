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
import { useEffect } from "react";
import { FileItem } from "@/types";
import { useWebContainer } from "@/hooks/useWebContainer";
import { cn } from "@/lib/utils";
import { useChatContext } from "@/context/chat.context";

export default function AppMain() {
  const { tabsState, files, newChat } = useChatContext();

  const { webcontainer, error } = useWebContainer();

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ])
                )
              : {},
          };
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }
        return mountStructure[file.name];
      };
      files.forEach((file) => processFile(file, true));
      return mountStructure;
    };
    const mountStructure = createMountStructure(files);
    webcontainer?.mount(mountStructure);
  }, [webcontainer, files]);

  useEffect(() => {
    newChat();
  },[])

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
