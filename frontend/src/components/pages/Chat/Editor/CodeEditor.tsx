import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, File, FileIcon } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { Fragment } from "react";
import { useTheme } from "next-themes";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Tree } from "./FileStructure";

export default function CodeEditor() {
  const { currentFile, files } = useAppSelector((state) => state.chat);
  const filePath = currentFile?.path.split("/").slice(1);
  const { theme } = useTheme();
  
  return (
    <section className="h-full flex flex-col">
      <div className="border-b p-2 ">
        <FilesBreadcrumb path={filePath} />
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

function FilesBreadcrumb({ path }: { path?: string[] }) {
  const { currentFile, files } = useAppSelector((state) => state.chat);
  const dispatch = useAppDispatch();
  
  return (
    <Breadcrumb className="flex items-center ml-2 h-7">
      <BreadcrumbList className="text-md align-middle">
        {path?.map((item, index) => {
          return (
            <Fragment key={index}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <BreadcrumbItem className="cursor-pointer">
                    {path.length - 1 !== index ? (
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
                  {Tree(files, dispatch)}
                </DropdownMenuContent>
              </DropdownMenu>
              {path.length - 1 !== index && <BreadcrumbSeparator />}
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
