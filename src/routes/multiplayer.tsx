import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { PageLoader } from "@/components/loader";
import CreateChallengePage from "@/features/multiplayer/pages/create-challenge-page";
import { useAuthStore } from "@/hooks/use-auth-store";

export const Route = createFileRoute("/multiplayer")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!user && !isLoading) {
      navigate({ to: "/auth" });
    }
  }, [user, navigate, isLoading]);

  if (!user || isLoading) return <PageLoader />;

  return <CreateChallengePage />;
}
