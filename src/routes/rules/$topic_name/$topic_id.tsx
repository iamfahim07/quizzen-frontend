import RulesPage from "@/pages/rules-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rules/$topic_name/$topic_id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RulesPage />;
}
