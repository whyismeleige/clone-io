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
  Fullscreen,
  MonitorSmartphone,
  RefreshCcw,
  Minimize,
  AlertCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/context/chat.context";

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
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleRefresh = async () => {
    if (previewIframeRef.current) {
      await reloadPreview(previewIframeRef.current);
    }
  };

  const { isChatLoading } = useChatContext();

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
    if (!webContainer || isChatLoading) return;

    let isMounted = true;

    // Set a timeout to detect if server doesn't start
    const timeoutId = setTimeout(() => {
      if (isMounted && !url) {
        setHasTimedOut(true);
      }
    }, 60000); // 60 second timeout

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
            clearTimeout(timeoutId);
          }
        });
      } catch (err) {
        console.error("Failed to start app:", err);
        setStatus(
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`
        );
        clearTimeout(timeoutId);
      }
    }

    startApp();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [webContainer, isChatLoading]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unexpected Error Occurred
          </h3>
          <p className="text-gray-600 mb-4">
            We encountered an error while initializing the preview environment.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800 font-mono break-all">
              {error.message}
            </p>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              variant="default"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
            <p className="text-sm text-gray-500">
              If the problem persists, please email us at{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:underline"
              >
                pjain.work@proton.me
              </a>{" "}
              with the error message above.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!url) {
    if (hasTimedOut) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-50">
          <div className="max-w-md text-center p-6">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Server Failed to Start
            </h3>
            <p className="text-gray-600 mb-4">
              The preview server took too long to initialize and may have encountered an issue.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                Status: {status}
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                variant="default"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh and Try Again
              </Button>
              <p className="text-sm text-gray-500">
                If the problem continues, please contact me at{" "}
                <a
                  href="mailto:support@example.com"
                  className="text-blue-600 hover:underline"
                >
                  pjain.work@proton.me
                </a>{" "}
                and include the status message above.
              </p>
            </div>
          </div>
        </div>
      );
    }

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