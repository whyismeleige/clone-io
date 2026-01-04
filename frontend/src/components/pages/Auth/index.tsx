"use client";
import GithubLoginButton from "@/components/shared/Auth/GithubLogin";
import GoogleLoginButton from "@/components/shared/Auth/GoogleLogin";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginUser, registerUser } from "@/store/slices/auth.slice";
import { Eye, EyeOff, GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type Mode = "login" | "signup";

export default function Auth() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);

  const query = searchParams.get("mode");

  const [mode, toggleMode] = useState<Mode>((query as Mode) || "login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, toggleShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data =
      mode === "signup"
        ? dispatch(registerUser({ email, password, name }))
        : dispatch(loginUser({ email, password }));

    setLoading(false);
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Clone.io</span>
            </Link>
            <h1 className="text-xl font-bold">Welcome to Clone.io</h1>
            <FieldDescription>
              {mode === "login" ? "Don't" : "Already"} have an account?{" "}
              <span
                className="underline cursor-pointer"
                onClick={() =>
                  toggleMode(mode === "login" ? "signup" : "login")
                }
              >
                {mode === "signup" ? "Log In" : "Sign Up"}
              </span>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              required
            />
          </Field>
          {mode === "signup" && (
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                type="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Your User Name"
                required
              />
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Your Password"
                required
                className="pr-10"
              />
              {showPass ? (
                <Eye
                  size={20}
                  onClick={() => toggleShowPass(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                />
              ) : (
                <EyeOff
                  size={20}
                  onClick={() => toggleShowPass(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                />
              )}
            </div>
          </Field>
          <Field>
            <Button className="cursor-pointer" type="submit">
              {loading ? (
                <>
                  <Spinner />
                  Processing
                </>
              ) : mode === "login" ? (
                "Log In"
              ) : (
                "Sign Up"
              )}
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <GithubLoginButton />
            <GoogleLoginButton />
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
