"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Settings,
  Sun,
  UserCircle,
  X,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppSelector } from "@/hooks/redux";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserDropdown from "@/components/shared/Dropdown/UserDropdown";

export const HeroHeader = () => {
  const { open } = useSidebar();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    // Check if banner was previously closed
    const bannerClosed = localStorage.getItem('apiNoticeClosed');
    if (bannerClosed === 'true') {
      setShowBanner(false);
    }
  }, []);

  const handleCloseBanner = () => {
    setShowBanner(false);
    localStorage.setItem('apiNoticeClosed', 'true');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      {/* Notice Banner */}
      {showBanner && (
        <div className="fixed top-0 z-30 w-full bg-primary/90 backdrop-blur-sm border-b border-primary">
          <div className="mx-auto max-w-6xl px-4 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center justify-center gap-2 text-sm text-primary-foreground flex-1">
                <Info className="size-4 flex-shrink-0" />
                <p className="text-center">
                  <span className="font-semibold">Announcement :</span> My API tokens have been depleted for now. 
                  Users cannot create new chats for now, but you can view previous public projects.
                </p>
              </div>
              <button
                onClick={handleCloseBanner}
                aria-label="Close notice"
                className="flex-shrink-0 cursor-pointer rounded-md p-1 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        data-state={menuState && "active"}
        className={cn(
          "fixed z-20 w-full px-2 transition-all duration-300",
          showBanner ? "pt-12" : "pt-0"
        )}
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between gap-2 items-center lg:w-auto">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/"
                  aria-label="home"
                  className="flex items-center text-xl"
                >
                  Clone.io
                </Link>
                {!open && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarTrigger className="cursor-pointer ml-auto" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Sidebar</TooltipContent>
                  </Tooltip>
                )}
              </div>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ModeToggle />
                  </TooltipTrigger>
                  <TooltipContent>Toggle Theme</TooltipContent>
                </Tooltip>
                {!isMounted ? (
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                ) : isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <UserDropdown className="w-60" />
                  </DropdownMenu>
                ) : (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="outline" size="sm">
                          <Link href="/auth?mode=login">
                            <span>Login</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Login</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild size="sm">
                          <Link href="/auth?mode=signup">
                            <span>Sign Up</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Sign Up</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};