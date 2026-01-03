"use client";
import { useAppSelector } from "@/hooks/redux";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function PublicRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      router.push("/");
    }
  }, [isAuthenticated, router, accessToken]);

  if (isAuthenticated && accessToken) {
    return null;
  }

  return <>{children}</>;
}
