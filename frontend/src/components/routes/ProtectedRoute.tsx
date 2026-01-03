"use client";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchUserProfile } from "@/store/slices/auth.slice";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Spinner } from "../ui/spinner";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, accessToken, isLoading, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (accessToken && !user && !isLoading) {
      dispatch(fetchUserProfile()).unwrap()
    }
  }, [accessToken, isLoading, dispatch, user]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !accessToken)) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, accessToken, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner  />
      </div>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return null;
  }

  return <>{children}</>;
}
