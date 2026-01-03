import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BACKEND_URL } from "@/utils/config";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { useState } from "react";

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = () => {
    setLoading(true);
    // Redirect to backend OAuth endpoint
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  return (
    <Button
      variant="outline"
      className="cursor-pointer w-full"
      onClick={loginWithGoogle}
      disabled={loading}
    >
      {loading ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          Connecting...
        </>
      ) : (
        <>
          <SiGoogle className="mr-2 h-4 w-4" />
          Continue with Google
        </>
      )}
    </Button>
  );
}