import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { PageLoader } from "@/components/loader";
import { useAuthStore } from "@/hooks/use-auth-store";
import AdminDashboardPage from "@/pages/admin-dashboard-page";

export const Route = createFileRoute("/admin-dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate({ to: "/auth" });
    } else if (user.role !== "admin") {
      navigate({ to: "/" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user || user.role !== "admin") {
    return <PageLoader />;
  }

  return <AdminDashboardPage />;
}
