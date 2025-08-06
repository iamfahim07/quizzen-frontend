import AnalysisPage from "@/pages/analysis-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/analysis/$topic_name/$topic_id"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <AnalysisPage />;
}
