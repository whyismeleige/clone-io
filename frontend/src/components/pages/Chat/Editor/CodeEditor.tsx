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
import { useAppDispatch } from "@/hooks/redux";
import { Fragment } from "react";
import { useTheme } from "next-themes";
import { Tree } from "./FileStructure";
import { useChatContext } from "@/context/chat.context";

export default function CodeEditor() {
  const { currentFile } = useChatContext();
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
 const { files } = useChatContext();
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
