"use client";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { useWebContainer } from "@/hooks/useWebContainer";
import { FileItem, Step, StepType } from "@/types";
import { BACKEND_URL } from "@/utils/config";
import { parseXml } from "@/utils/parse-xml";
import { WebContainer } from "@webcontainer/api";
import {
  ExternalLink,
  Fullscreen,
  MonitorSmartphone,
  RefreshCcw,
} from "lucide-react";
import { useEffect, useState } from "react";

interface TemplateAPIResponse {
  prompts: string[];
  uiPrompts: string[];
}

interface PreviewFrameProps {
  webContainer: WebContainer | null;
  error?: Error | null;
}

export default function PreviewFrame({ webContainer, error }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("Initializing...");

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
        webContainer?.on("server-ready", (port, serverUrl) => {
          if (isMounted) {
            console.log(`Server ready on port ${port}: ${serverUrl}`);
            setUrl(serverUrl);
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
    <>
      <div className="flex p-3 gap-10 justify-between border-b">
        <Input type="text" placeholder="/" />
        <ButtonGroup>
          <Button size="icon" className="cursor-pointer" variant="outline">
            <RefreshCcw />
          </Button>
          <Button size="icon" className="cursor-pointer" variant="outline">
            <ExternalLink />
          </Button>
          <Button size="icon" className="cursor-pointer" variant="outline">
            <MonitorSmartphone />
          </Button>
          <Button size="icon" className="cursor-pointer" variant="outline">
            <Fullscreen />
          </Button>
        </ButtonGroup>
      </div>
      <iframe className="w-full h-full border-0" src={url} title="Preview" />
    </>
  );
}
