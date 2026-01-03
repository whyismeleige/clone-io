import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";

// Singleton instance stored outside React
let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function getWebContainer() {
      try {
        // If already booted, return the existing instance
        if (webcontainerInstance) {
          if (isMounted) {
            setWebcontainer(webcontainerInstance);
            setIsLoading(false);
          }
          return;
        }

        // If boot is in progress, wait for it
        if (bootPromise) {
          const instance = await bootPromise;
          if (isMounted) {
            setWebcontainer(instance);
            setIsLoading(false);
          }
          return;
        }

        // Boot for the first time
        bootPromise = WebContainer.boot();
        webcontainerInstance = await bootPromise;
        
        if (isMounted) {
          setWebcontainer(webcontainerInstance);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to boot WebContainer'));
          setIsLoading(false);
          console.error('WebContainer boot failed:', err);
        }
      } finally {
        bootPromise = null;
      }
    }

    getWebContainer();

    return () => {
      isMounted = false;
    };
  }, []);

  return { webcontainer, error, isLoading };
}

export function teardownWebContainer() {
  if (webcontainerInstance) {
    webcontainerInstance.teardown();
    webcontainerInstance = null;
    bootPromise = null;
  }
}