"use client";
import { Spinner } from "@/components/ui/spinner";
import { useChatContext } from "@/context/chat.context";
import { useAppDispatch } from "@/hooks/redux";
import { exchangeOAuthCode, TokenService } from "@/store/slices/auth.slice";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { newChat, setPrompt } = useChatContext();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("Authentication Failed. Please Try again later");
      setTimeout(() => router.replace("/auth"), 2000);
      return;
    }

    const handleOAuthExchange = async () => {
      try {
        await dispatch(exchangeOAuthCode(code)).unwrap();

        const newAccessToken = TokenService.getAccessToken();

        const savedPrompt = localStorage.getItem("chatPrompt");

        if (savedPrompt && savedPrompt.trim() !== "") {
          if (setPrompt) setPrompt(savedPrompt);
          await newChat(newAccessToken, savedPrompt);
        } else {
          setTimeout(() => router.replace("/"), 2000);
        }
      } catch (error) {
        setError(
          typeof error === "string"
            ? error
            : "Authentication failed. Please Try again later"
        );
        setTimeout(() => router.replace("/auth"), 2000);
      }
    };

    handleOAuthExchange();
  }, [searchParams, router, newChat, setPrompt, dispatch]);

  if (error) {
    return (
      <div className="flex justify-center gap-2 pt-20 h-screen w-screen text-4xl font-extrabold tracking-tight text-balance">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-2 pt-20 h-screen w-screen text-4xl font-extrabold tracking-tight text-balance">
      <Spinner className="size-9" />
      Authenticating...
    </div>
  );
}
