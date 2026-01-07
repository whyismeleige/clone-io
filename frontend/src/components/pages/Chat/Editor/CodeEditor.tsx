import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileIcon } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Fragment } from "react";
import { useTheme } from "next-themes";
import { Tree } from "./FileStructure";
import { useChatContext } from "@/context/chat.context";
import { FileItem } from "@/types";

export default function CodeEditor() {
  const { currentFile } = useChatContext();
  const filePath = currentFile?.path.split("/").slice(1);
  const { theme } = useTheme();
  
  return (
    <section className="h-full flex flex-col">
      <div className="border-b p-2 ">
        <FilesBreadcrumb path={filePath} currentPath={currentFile?.path} />
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          theme={theme === "dark" ? "vs-dark" : "light"}
          language={getLanguagesFromFilename(currentFile?.name || "")}
          value={currentFile?.content || ""}
          options={{
            readOnly: true,
            wordWrap: "on",
          }}
        />
      </div>
    </section>
  );
}

function FilesBreadcrumb({ path,  }: { path?: string[]; currentPath?: string }) {
  const { files, changeCurrentFile } = useChatContext();
  
  // Get children at specific depth level
  const getChildrenAtLevel = (items: FileItem[], targetPath: string[]): FileItem[] => {
    if (targetPath.length === 0) return items;
    
    const [current, ...rest] = targetPath;
    const foundItem = items.find(item => item.name === current);
    
    if (!foundItem || !foundItem.children || rest.length === 0) {
      return foundItem?.children || [];
    }
    
    return getChildrenAtLevel(foundItem.children, rest);
  };
  
  return (
    <Breadcrumb className="flex items-center ml-2 h-7">
      <BreadcrumbList className="text-md align-middle">
        {path?.map((item, index) => {
          // Build path up to current breadcrumb level
          const pathUpToHere = path.slice(0, index);
          const childrenAtLevel = getChildrenAtLevel(files, pathUpToHere);
          const isLastItem = path.length - 1 === index;
          
          return (
            <Fragment key={index}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <BreadcrumbItem className="cursor-pointer">
                    {!isLastItem ? (
                      item
                    ) : (
                      <BreadcrumbPage className="flex items-center">
                        <FileIcon className="h-4 " />
                        {item}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Tree(childrenAtLevel, changeCurrentFile)}
                </DropdownMenuContent>
              </DropdownMenu>
              {!isLastItem && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
const getLanguagesFromFilename = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    html: "html",
    css: "css",
    scss: "scss",
    md: "markdown",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
  };
  return languageMap[extension || ""] || "plaintext";
};
