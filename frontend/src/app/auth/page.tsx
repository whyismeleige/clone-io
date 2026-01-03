import Auth from "@/components/pages/Auth";

export default function Page() {
  return (
    <div className="bg-background flex min-h-svh flex-col w-screen items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Auth />
      </div>
    </div>
  );
}
