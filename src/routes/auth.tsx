import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { PageLoader } from "@/components/loader";
import { useAuthStore } from "@/hooks/use-auth-store";
import AuthPage from "@/pages/auth-page";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (user && !isLoading) {
      navigate({ to: "/" });
    }
  }, [user, navigate, isLoading]);

  if (user || isLoading) return <PageLoader />;

  return <AuthPage />;
}
