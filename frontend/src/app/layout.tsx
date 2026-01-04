import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/utils/providers";
import { AlertContainer } from "@/components/shared/Alert/AlertContainer";
import AppSidebar from "@/components/pages/Chat/Sidebar";

export const metadata: Metadata = {
  title: "Clone.io",
  description: "Make Websites on the go",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Providers>
          <AppSidebar />
          {children}
          <AlertContainer />
        </Providers>
      </body>
    </html>
  );
}
