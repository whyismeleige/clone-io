"use client";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChatContext } from "@/context/chat.context";
import { FileItem } from "@/types";
import {
  ChevronRight,
  Copy,
  Delete,
  File,
  FilePlus,
  Folder,
  FolderCode,
  FolderPlus,
  Pen,
  Route,
  Scissors,
  Search,
  SearchIcon,
  Waypoints,
} from "lucide-react";
import { Fragment, useState, useMemo } from "react";

export interface Files {
  type: "file" | "folder";
  name: string;
  children?: Files[];
}

interface SearchResult {
  file: FileItem;
  matchType: "name" | "content";
  matchedText: string;
  context?: string; // Surrounding text for content matches
}

const contextMenuData = [
  {
    items: [
      {
        name: "New File...",
        icon: FilePlus,
      },
      {
        name: "New Folder...",
        icon: FolderPlus,
      },
    ],
  },
  {
    items: [
      {
        name: "Cut",
        icon: Scissors,
      },
      {
        name: "Copy",
        icon: Copy,
      },
    ],
  },
  {
    items: [
      {
        name: "Copy Path",
        icon: Route,
      },
      {
        name: "Copy Relative Path",
        icon: Waypoints,
      },
    ],
  },
  {
    items: [
      {
        name: "Rename",
        icon: Pen,
      },
      {
        name: "Delete",
        icon: Delete,
      },
    ],
  },
];

// Highlight matching text in a string
const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <span>{text}</span>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 font-semibold">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

// Search through files recursively
const searchFiles = (
  files: FileItem[],
  query: string,
  results: SearchResult[] = []
): SearchResult[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  for (const file of files) {
    if (file.type === "file") {
      // Check file name
      if (file.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          file,
          matchType: "name",
          matchedText: file.name,
        });
      }

      // Check file content
      if (file.content && file.content.toLowerCase().includes(lowerQuery)) {
        // Extract context around the match
        const contentLower = file.content.toLowerCase();
        const matchIndex = contentLower.indexOf(lowerQuery);
        const contextStart = Math.max(0, matchIndex - 50);
        const contextEnd = Math.min(file.content.length, matchIndex + query.length + 50);
        const context = file.content.substring(contextStart, contextEnd);

        results.push({
          file,
          matchType: "content",
          matchedText: query,
          context: (contextStart > 0 ? "..." : "") + context + (contextEnd < file.content.length ? "..." : ""),
        });
      }
    } else if (file.type === "folder" && file.children) {
      // Recursively search in folders
      searchFiles(file.children, query, results);
    }
  }

  return results;
};

// Search Results Component
const SearchResults = ({
  results,
  query,
  changeCurrentFile,
}: {
  results: SearchResult[];
  query: string;
  changeCurrentFile: (file: FileItem) => void;
}) => {
  if (!query.trim()) {
    return (
      <div className="text-muted-foreground text-sm p-4 text-center">
        Enter a search term to find files
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-muted-foreground text-sm p-4 text-center">
        No results found for "{query}"
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground px-3 py-2">
        {results.length} {results.length === 1 ? "result" : "results"} found
      </div>
      {results.map((result, index) => (
        <div
          key={`${result.file.path}-${index}`}
          className="hover:bg-accent cursor-pointer p-2 rounded-md mx-1 transition-colors"
          onClick={() => changeCurrentFile(result.file)}
        >
          <div className="flex items-center gap-2 mb-1">
            <File size={14} className="text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              <HighlightText text={result.file.name} query={query} />
            </span>
          </div>
          <div className="text-xs text-muted-foreground pl-6 truncate">
            {result.file.path}
          </div>
          {result.matchType === "content" && result.context && (
            <div className="text-xs text-muted-foreground pl-6 mt-1 line-clamp-2">
              <HighlightText text={result.context} query={query} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function FileStructure() {
  const { files, changeCurrentFile } = useChatContext();
  const [searchQuery, setSearchQuery] = useState("");

  // Memoize search results to avoid re-computing on every render
  const searchResults = useMemo(
    () => searchFiles(files, searchQuery),
    [files, searchQuery]
  );

  return (
    <section className="border-r overflow-visible">
      <Tabs defaultValue="files" className="gap-0">
        <div className="border-b p-2 ">
          <TabsList className="h-7">
            <TabsTrigger value="files">
              <FolderCode />
              Files
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search />
              Search
            </TabsTrigger>
          </TabsList>
        </div>
        <ContextMenu>
          <ContextMenuTrigger>
            <TabsContent value="files" className="mt-0">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarMenu>{Tree(files, changeCurrentFile)}</SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </TabsContent>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-40">
            {contextMenuData.map((data, index) => (
              <Fragment key={index}>
                {data.items.map((item, idx) => (
                  <ContextMenuItem className="cursor-pointer" key={idx}>
                    <item.icon />
                    {item.name}
                  </ContextMenuItem>
                ))}
                {index !== contextMenuData.length - 1 && (
                  <ContextMenuSeparator />
                )}
              </Fragment>
            ))}
          </ContextMenuContent>
        </ContextMenu>
        <TabsContent className="p-2 mt-0" value="search">
          <div className="space-y-3">
            <div className="relative flex-1">
              <Input
                className="peer h-8 w-full max-w-xs ps-8 pe-2"
                placeholder="Search for Files..."
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
                <SearchIcon size={16} />
              </div>
            </div>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <SearchResults
                results={searchResults}
                query={searchQuery}
                changeCurrentFile={changeCurrentFile}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

export const Tree = (
  files: FileItem[],
  changeCurrentFile: (file: FileItem) => void,
  name?: string
) => {
  return files.map((item, index) => {
    return item.type === "file" ? (
      <SidebarMenuButton
        onClick={() => changeCurrentFile(item)}
        className="cursor-pointer"
        key={index}
      >
        <File />
        {item.name}
      </SidebarMenuButton>
    ) : (
      <SidebarMenuItem key={index}>
        <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
          <CollapsibleTrigger className="cursor-pointer" asChild>
            <SidebarMenuButton>
              <ChevronRight className="transition-transform" />
              <Folder />
              {item.name}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          {item.children?.length ? (
            <CollapsibleContent>
              <SidebarMenuSub>
                {Tree(item.children, changeCurrentFile, name)}
              </SidebarMenuSub>
            </CollapsibleContent>
          ) : null}
        </Collapsible>
      </SidebarMenuItem>
    );
  });
};