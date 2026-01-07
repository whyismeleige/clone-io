"use client";
import DeleteChatDialog from "@/components/shared/Dialogs/DeleteChat";
import RenameProjectDialog from "@/components/shared/Dialogs/RenameChatTitle";
import UserDropdown from "@/components/shared/Dropdown/UserDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatContext } from "@/context/chat.context";
import { useAppSelector } from "@/hooks/redux";
import { useMounted } from "@/hooks/useMounted";
import { User } from "@/types/auth.types";
import { ChatHistory } from "@/types/chat.types";
import { SiGithub } from "@icons-pack/react-simple-icons";
import {
  EllipsisVertical,
  Minus,
  Plus,
  PlusCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// const dummyChatHistory: ChatHistory[] = Array(100)
//   .fill(null)
//   .map(() => ({
//     _id: "UUID-" + Math.floor(Math.random() * 100).toString(),
//     projectName: "Project-" + Math.floor(Math.random() * 100).toString(),
//     isStarred: Math.floor(Math.random() * 100) <= 50,
//     timestamp: new Date().toISOString(),
//   }));

export default function AppSidebar() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { fetchChatsHistory, chatHistory } = useChatContext();
  const isMounted = useMounted();

  useEffect(() => {
    if (isMounted && isAuthenticated) {
      fetchChatsHistory();
    }
  }, [isMounted, isAuthenticated, fetchChatsHistory]);

  const sortedChats = chatHistory.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const starredChats = sortedChats.filter((chat) => chat.isStarred);
  const nonStarredChats = sortedChats.filter((chat) => !chat.isStarred);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2">
              <Link href="/" className="flex gap-2 items-center">
                
                <span className="text-base font-semibold">Clone.io</span>
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent side="bottom">Sidebar</TooltipContent>
              </Tooltip>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar">
        <NavCreate />
        {isMounted && isAuthenticated ? (
          <div className="overflow-y-auto custom-scrollbar">
            {starredChats.length > 0 && <NavStarred chats={starredChats} />}
            {nonStarredChats.length > 0 && (
              <NavRecent chats={nonStarredChats} />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Please log in or sign up to use Clone IO
            </p>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-center m-2 gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              <Link
                href="https://github.com/whyismeleige/clone-io"
                className="flex gap-2 items-center justify-center px-4 py-2"
              >
                <SiGithub />
                Clone.io GitHub
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Github Repository</TooltipContent>
        </Tooltip>
        {isMounted && isAuthenticated && (
          <NavUser user={isMounted ? user : null} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

const NavCreate = () => {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <Link href="/">
            <SidebarMenuButton
              tooltip="New Project"
              className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <PlusCircle />
              <span>New Project</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

const ChatItemWithDropdown = ({ chat }: { chat: ChatHistory }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { changeChatDetails } = useChatContext();

  return (
    <div className="group/item flex items-center w-full gap-1">
      <Link href={`/chat/${chat._id}`} className="flex-1 min-w-0">
        <SidebarMenuSubItem className="p-2 text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent rounded-lg cursor-pointer">
          <span className="truncate">{chat.projectName}</span>
        </SidebarMenuSubItem>
      </Link>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() =>
              changeChatDetails({ toggleStarStatus: true }, chat._id)
            }
          >
            <Star fill={chat.isStarred ? "yellow" : ""} />
            {chat.isStarred ? "Unstar" : "Star"}
          </DropdownMenuItem>
          <RenameProjectDialog
            projectName={chat.projectName}
            chatId={chat._id}
          />
          <DropdownMenuSeparator />
          <DeleteChatDialog chatId={chat._id} projectName={chat.projectName} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const NavStarred = ({ chats }: { chats: ChatHistory[] }) => {
  return (
    <SidebarGroup className="py-0">
      <SidebarGroupContent>
        <SidebarMenu>
          <Collapsible defaultOpen={true} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="cursor-pointer">
                  Starred{" "}
                  <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                  <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {chats.map((chat) => (
                    <ChatItemWithDropdown key={chat._id} chat={chat} />
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

const NavRecent = ({ chats }: { chats: ChatHistory[] }) => {
  return (
    <SidebarGroup className="py-0">
      <SidebarGroupContent>
        <SidebarMenu>
          <Collapsible defaultOpen={true} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="cursor-pointer">
                  Recent{" "}
                  <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                  <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {chats.map((chat) => (
                    <ChatItemWithDropdown key={chat._id} chat={chat} />
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

const NavUser = ({ user }: { user: User | null }) => {
  const { isMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <UserDropdown
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
