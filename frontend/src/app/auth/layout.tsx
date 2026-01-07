import PublicRoute from "@/components/routes/PublicRoute";
import { Suspense } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <PublicRoute>{children}</PublicRoute>;
    </Suspense>
  );
}
