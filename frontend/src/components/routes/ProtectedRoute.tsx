"use client";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchUserProfile } from "@/store/slices/auth.slice";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, accessToken, isLoading, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && accessToken && !user && !isLoading) {
      dispatch(fetchUserProfile()).unwrap();
    }
  }, [accessToken, isLoading, dispatch, user, mounted]);

  useEffect(() => {
    if (mounted && !isLoading && (!isAuthenticated || !accessToken)) {
      router.replace("/auth");
    }
  }, [isAuthenticated, isLoading, accessToken, router, mounted]);

  if (!mounted || isLoading || !user || !isAuthenticated || !accessToken) {
    return null; // Next.js loading.tsx will handle the loading UI
  }

  return <>{children}</>;
}