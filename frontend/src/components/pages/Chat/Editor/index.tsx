"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import FileStructure from "./FileStructure";
import CodeEditor from "./CodeEditor";
// import Terminal from "./Terminal";

export default function Editor() {
  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel className="border-b">
        <ResizablePanelGroup direction="horizontal">
          {/* File Structure Panel */}
          <ResizablePanel defaultSize={20} maxSize={80}>
            <FileStructure />
          </ResizablePanel>
          <ResizableHandle />
          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={80} maxSize={90}>
            <CodeEditor />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle />
      {/* <ResizablePanel defaultSize={30} maxSize={75}>
        <Terminal />
      </ResizablePanel> */}
    </ResizablePanelGroup>
  );
}
