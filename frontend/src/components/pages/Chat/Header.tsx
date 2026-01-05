import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import JSZip from "jszip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/hooks/redux";
import {
  History,
  ChevronDown,
  Globe,
  LockIcon,
  Pen,
  Copy,
  Blend,
  Download,
  Play,
  Code,
  UserCircle,
  Bell,
  LogOut,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useState } from "react";
import { FileItem } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { useChatContext } from "@/context/chat.context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserDropdown from "@/components/shared/Dropdown/UserDropdown";

const zipFoldersRecursive = (files?: FileItem[], folder?: JSZip | null) => {
  files?.forEach((item) => {
    if (item.type === "file") {
      folder?.file(item.name, item.content ?? "");
    } else {
      const childFolder = folder?.folder(item.name);
      zipFoldersRecursive(item.children, childFolder);
    }
  });
};

export default function AppHeader() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const { user } = useAppSelector((state) => state.auth);
  const { files, toggleTabsState, currentChat } = useChatContext();

  const downloadZipFiles = async () => {
    try {
      setLoading(true);
      setStatus("Downloading...");
      const zip = new JSZip();

      files.forEach((item) => {
        if (item.type === "file") {
          zip.file(item.name, item.content ?? "");
        } else {
          const folder = zip.folder(item.name);
          zipFoldersRecursive(item.children, folder);
        }
      });

      const content = await zip.generateAsync({ type: "blob" });

      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sample.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating zip:", error);
    } finally {
      setStatus("");
      setLoading(false);
    }
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="cursor-pointer -ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={loading && status === "Downloading..."}
              variant="outline"
              className="cursor-pointer"
            >
              {currentChat?.projectName}
              <LockIcon />
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40">
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <History />
                Version History
              </DropdownMenuItem>
              <RenameProject title="Sample Project Title" />
              <DropdownMenuItem className="cursor-pointer">
                <Copy />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Blend />
                Blend
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="w-1/2 mx-auto flex justify-center">
          <Tabs defaultValue="code">
            <TabsList className="bg-transparent">
              <TabsTrigger
                onClick={() => toggleTabsState("preview")}
                className="cursor-pointer p-3"
                value="preview"
              >
                <Play />
                Preview
              </TabsTrigger>
              <TabsTrigger
                onClick={() => toggleTabsState("code")}
                className="cursor-pointer p-3"
                value="code"
              >
                <Code />
                Code
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={loading && status === "Downloading..."}
                variant="outline"
                onClick={downloadZipFiles}
                size="sm"
                className="cursor-pointer hidden sm:flex"
              >
                {loading && status === "Downloading..." ? (
                  <Spinner />
                ) : (
                  <Download />
                )}
                {loading && status === "Downloading..." ? status : "Export"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download your Project</TooltipContent>
          </Tooltip>
          {/* <GithubDialog /> */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer hidden sm:flex"
              >
                <Globe />
                Deploy
              </Button>
            </TooltipTrigger>
            <TooltipContent>Deploy your Website</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <UserDropdown className="w-60"/>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// const GithubDialog = () => {
//   return (
//     <Dialog>
//       <DialogTrigger  asChild>
//         <Button
//           variant="outline"
//           size="sm"
//           className="cursor-pointer hidden sm:flex"
//         >
//           <SiGithub />
//           GitHub
//         </Button>
//       </DialogTrigger>
//       <DialogContent>
//         {authModes.includes("github") ? (
//           <>
//             <DialogHeader></DialogHeader>
//           </>
//         ) : (
//           <>
//             <DialogHeader>
//               <DialogTitle>Let's Connect to GitHub</DialogTitle>
//               <DialogDescription>
//                 Sign in with your GitHub account to deploy your code instantly. <br/>
//                 We'll keep your work synced and ready to share.
//               </DialogDescription>
//             </DialogHeader>
//             <GithubLoginButton redirect="/chat/id" />
//           </>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

const RenameProject = ({ title }: { title: string }) => {
  const [input, setInput] = useState(title);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="cursor-pointer"
        >
          <Pen />
          Rename
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project Title</DialogTitle>
          <DialogDescription>
            Make changes to your Project Title here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            name="title"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className="cursor-pointer">Save Changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
