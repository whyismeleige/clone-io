import PublicRoute from "@/components/routes/PublicRoute";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PublicRoute>{children}</PublicRoute>;
}
