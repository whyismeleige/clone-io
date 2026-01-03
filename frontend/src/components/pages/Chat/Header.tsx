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
import JSZip, { file } from "jszip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { changeProjectTitle } from "@/store/slices/chat.slice";
import { toggleTabs } from "@/store/slices/config.slice";
import { parseXml } from "@/utils/parse-xml";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { m } from "framer-motion";
import {
  History,
  ArrowDown,
  ChevronDown,
  Globe,
  Lock,
  LockIcon,
  MoveDown,
  Pen,
  Copy,
  Blend,
  Download,
  Eye,
  Play,
  Code,
  UserCircle,
  CreditCard,
  Bell,
  LogOut,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Dispatch } from "redux";
import { FileItem } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import GithubLoginButton from "@/components/shared/Auth/GithubLogin";

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
  const { projectTitle, files } = useAppSelector((state) => state.chat);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const dispatch = useAppDispatch();

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
      link.download = `${projectTitle}.zip`;
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
              {projectTitle}
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
              <RenameProject title={projectTitle} dispatch={dispatch} />
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
          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger
                onClick={() => dispatch(toggleTabs("preview"))}
                className="cursor-pointer"
                value="preview"
              >
                <Play />
                Preview
              </TabsTrigger>
              <TabsTrigger
                onClick={() => dispatch(toggleTabs("code"))}
                className="cursor-pointer"
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
          {/* <GithubDialog /> */}
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer hidden sm:flex"
          >
            <Globe />
            Deploy
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage
                  src="https://avatars.steamstatic.com/0080c1eebf4fc785c7944995bec1abb8818e2510_full.jpg"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="https://avatars.steamstatic.com/0080c1eebf4fc785c7944995bec1abb8818e2510_full.jpg" />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Piyush Jain</span>
                      <span className="text-muted-foreground truncate text-xs">
                        piyushjain31456@gmail.com
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle />
                    Get Help
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <UserCircle />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Moon />
                      Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>
                        <Sun />
                        Light
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Moon />
                        Dark
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Monitor />
                        System
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
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

const RenameProject = ({
  dispatch,
  title,
}: {
  dispatch: Dispatch;
  title: string;
}) => {
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
            <Button
              className="cursor-pointer"
              onClick={() => dispatch(changeProjectTitle(input))}
            >
              Save Changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
