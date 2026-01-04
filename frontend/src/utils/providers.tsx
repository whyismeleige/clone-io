"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatProvider } from "@/context/chat.context";
import { ThemeProvider } from "@/context/theme-provider";
import { store } from "@/store";
import { ReactNode } from "react";
import { Provider } from "react-redux";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ChatProvider>
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
            defaultOpen={false}
          >
            {children}
          </SidebarProvider>
        </ChatProvider>
      </ThemeProvider>
    </Provider>
  );
}
