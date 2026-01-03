"use client";
import { SidebarInset } from "@/components/ui/sidebar";
import AppHeader from "./Header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Editor from "./Editor";
import ChatSection from "./Chat-Section";
import PreviewFrame from "./Preview";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useEffect } from "react";
import { FileItem, Step, StepType } from "@/types";
import { useWebContainer } from "@/hooks/useWebContainer";
import { parseXml } from "@/utils/parse-xml";
import { BACKEND_URL } from "@/utils/config";
import { saveFiles, saveSteps } from "@/store/slices/chat.slice";
import { cn } from "@/lib/utils";
import { dummyData } from "@/utils/dummy-data";

export default function AppMain() {
  const { tabsState } = useAppSelector((state) => state.config);
  const { userPrompts, files, steps } = useAppSelector((state) => state.chat);

  const { webcontainer, error } = useWebContainer();
  const dispatch = useAppDispatch();

  const initialPrompt = userPrompts[0];
  useEffect(() => {
    const pendingSteps = steps.filter(({ status }) => status === "pending");

    if (pendingSteps.length === 0) return;

    // Deep clone to avoid mutation issues
    let updatedFiles = JSON.parse(JSON.stringify(files));

    pendingSteps.forEach((step) => {
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/").filter(Boolean) ?? [];
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

    dispatch(saveFiles(updatedFiles));
    dispatch(
      saveSteps(
        steps.map((step: Step) => ({
          ...step,
          status: "completed",
        }))
      )
    );
  }, [steps, files, dispatch]);

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
    console.log("The Mount Structure for Web Containers", mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    // const response = await fetch(`${BACKEND_URL}/api/chat/template`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ prompt: initialPrompt }),
    // });
    // const data = await response.json();
    // console.log("This is the template data", data);
    // const { prompts, uiPrompts } = data;

    // Save the parsed steps
    const initialSteps: Step[] = parseXml(dummyData.uiPrompts[0]).map(
      (step: Step) => ({
        ...step,
        status: "pending",
      })
    );

    dispatch(saveSteps(initialSteps));

    // const stepsResponse = await fetch(`${BACKEND_URL}/api/chat/prompt`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     messages: [...dummyData.prompts, initialPrompt].map((content) => ({
    //       role: "user",
    //       content,
    //     })),
    //   }),
    // });

    // const stepsData = await stepsResponse.json();

    // console.log("This is stepsData", stepsData);

    const newSteps = parseXml(dummyData.response).map((x) => ({
      ...x,
      status: "pending" as "pending",
    }));

    dispatch(saveSteps([...initialSteps, ...newSteps]));
  }

  useEffect(() => {
    init();
  }, []);
  return (
    <SidebarInset className="flex flex-col h-screen">
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
    </SidebarInset>
  );
}
