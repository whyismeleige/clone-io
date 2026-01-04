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
import { Fragment } from "react";

export interface Files {
  type: "file" | "folder";
  name: string;
  children?: Files[];
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

export default function FileStructure() {
const { files, changeCurrentFile } = useChatContext();  
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
            <TabsContent value="files">
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
        <TabsContent className="p-2" value="search">
          <div className="relative flex-1">
            <Input
              className="peer h-8 w-full max-w-xs ps-8 pe-2"
              placeholder="Search for Files..."
              type="search"
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
              <SearchIcon size={16} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

export const Tree = (files: FileItem[], changeCurrentFile: (file: FileItem) => void, name?: string) => {
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
            <SidebarMenuButton >
              <ChevronRight className="transition-transform" />
              <Folder />
              {item.name}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          {item.children?.length ? (
            <CollapsibleContent>
              <SidebarMenuSub>{Tree(item.children,changeCurrentFile, name)}</SidebarMenuSub>
            </CollapsibleContent>
          ) : null}
        </Collapsible>
      </SidebarMenuItem>
    );
  });
};
