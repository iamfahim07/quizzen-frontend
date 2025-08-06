import QuizPage from "@/pages/quiz-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/quiz/$topic_name/$topic_id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <QuizPage />;
}
