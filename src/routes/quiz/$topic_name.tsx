import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { PageLoader } from "@/components/loader";
import { useAuthStore } from "@/hooks/use-auth-store";
import QuizPage from "@/pages/quiz-page";

export const Route = createFileRoute("/quiz/$topic_name")({
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

  return <QuizPage />;
}
