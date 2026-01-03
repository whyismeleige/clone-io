import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BACKEND_URL } from "@/utils/config";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { useState } from "react";

export default function GithubLoginButton() {
  const [loading, setLoading] = useState(false);
  const loginWithGithub = () => {
    setLoading(true);
    window.location.href = `${BACKEND_URL}/api/auth/github`;
  };
  return (
    <Button
      variant="outline"
      className="cursor-pointer"
      onClick={loginWithGithub}
    >
      {loading ? <Spinner /> : <SiGithub />}
      {loading ? "Connecting" : "Continue with GitHub"}
    </Button>
  );
}
