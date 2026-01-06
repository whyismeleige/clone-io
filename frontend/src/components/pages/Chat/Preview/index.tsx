"use client";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WebContainer, reloadPreview } from "@webcontainer/api";
import {
  ExternalLink,
  Fullscreen,
  MonitorSmartphone,
  RefreshCcw,
  Minimize,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PreviewFrameProps {
  webContainer: WebContainer | null;
  error?: Error | null;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const DEVICE_SIZES = {
  desktop: { width: "100%", height: "100%" },
  tablet: { width: "768px", height: "100%" },
  mobile: { width: "375px", height: "667px" },
};

export default function PreviewFrame({
  webContainer,
  error,
}: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [port, setPort] = useState<number | null>(null);
  const [status, setStatus] = useState("Initializing...");
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleRefresh = async () => {
    if (previewIframeRef.current) {
      await reloadPreview(previewIframeRef.current);
    }
  };

  const handleOpenInNewTab = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleDeviceChange = (newDevice: DeviceType) => {
    setDevice(newDevice);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Failed to enter fullscreen:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error("Failed to exit fullscreen:", err);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!webContainer) return;

    let isMounted = true;

    async function startApp() {
      try {
        // Install dependencies
        setStatus("Installing dependencies...");
        const installProcess = await webContainer?.spawn("npm", ["install"]);

        installProcess?.output.pipeTo(
          new WritableStream({
            write() {},
          })
        );

        const installExitCode = await installProcess?.exit;

        if (installExitCode !== 0) {
          throw new Error(`Install failed with exit code ${installExitCode}`);
        }

        // Start dev server
        setStatus("Starting dev server...");
        const devProcess = await webContainer?.spawn("npm", ["run", "dev"]);

        devProcess?.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(data);
            },
          })
        );

        // Listen for server-ready event
        webContainer?.on("server-ready", (portNum, serverUrl) => {
          if (isMounted) {
            console.log(`Server ready on port ${portNum}: ${serverUrl}`);
            setUrl(serverUrl);
            setPort(portNum);
            setStatus("Ready");
          }
        });
      } catch (err) {
        console.error("Failed to start app:", err);
        setStatus(
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    }

    startApp();

    return () => {
      isMounted = false;
    };
  }, [webContainer]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400">
        <div className="text-center">
          <p className="mb-2">Failed to initialize WebContainer</p>
          <p className="text-sm">{error.message}</p>
          <p className="text-xs mt-2">
            Make sure CORS headers are set correctly
          </p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="mb-2">{status}</p>
          <div className="animate-spin h-8 w-8 border-4 border-gray-600 border-t-gray-400 rounded-full mx-auto mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <div className="flex p-3 gap-10 justify-between border-b">
        <div className="flex items-center gap-2 flex-1">
          <Input type="text" placeholder="/" className="flex-1" readOnly/>
          {port && (
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Port: {port}
            </span>
          )}
        </div>
        <ButtonGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={handleRefresh}
                className="cursor-pointer"
                variant="outline"
              >
                <RefreshCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={handleOpenInNewTab}
                className="cursor-pointer"
                variant="outline"
              >
                <ExternalLink />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open in New Tab</TooltipContent>
          </Tooltip> */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    className="cursor-pointer"
                    variant="outline"
                  >
                    <MonitorSmartphone />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Change Device</TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleDeviceChange("desktop")}
              >
                Desktop
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleDeviceChange("tablet")}
              >
                Tablet
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleDeviceChange("mobile")}
              >
                Mobile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={toggleFullscreen}
                className="cursor-pointer"
                variant="outline"
              >
                {isFullscreen ? <Minimize /> : <Fullscreen />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </TooltipContent>
          </Tooltip>
        </ButtonGroup>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100">
        <div
          style={{
            width: DEVICE_SIZES[device].width,
            height: DEVICE_SIZES[device].height,
            transition: "all 0.3s ease",
          }}
          
        >
          <iframe
            ref={previewIframeRef}
            className="w-full h-full border-0"
            src={url}
            title="Preview"
          />
        </div>
      </div>
    </div>
  );
}
