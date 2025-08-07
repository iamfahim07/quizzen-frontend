import { Link } from "@tanstack/react-router";

import { useGetTopics } from "@/api/use-get-topics";

import {
  EmptyStateComponent,
  ErrorComponent,
} from "@/components/fallback-component";
import PromptInput from "@/components/prompt-input";
import { TopicsCardSkeletonLoader } from "@/components/skeleton-loaders";
import TopicCard from "@/components/topic-card";

import { useAppStore } from "@/hooks/use-app-store";
import { useAuthStore } from "@/hooks/use-auth-store";

export default function HomePage() {
  const { user } = useAuthStore();

  const { allAIQuizData } = useAppStore();

  const {
    isPending,
    error,
    data: { data: topics } = { data: [] },
    refetch,
  } = useGetTopics();

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pb-16 fade-in">
      <section className="max-w-7xl mx-auto py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-violet-500 to-blue-600 bg-clip-text text-transparent mb-2">
            Welcome{user && " back"}, {user?.fullName?.split(" ")[0] || "Guest"}
            !
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Choose a quiz topic to start challenging yourself. Test your
            knowledge and improve your score — or{" "}
            <span className="font-medium bg-gradient-to-r from-violet-500 to-blue-600 bg-clip-text text-transparent">
              ask the AI to create a quiz for you!
            </span>
          </p>
        </div>

        <PromptInput />
      </section>

      <section className="max-w-7xl mx-auto mb-10">
        {allAIQuizData.length > 0 && (
          <h1 className="w-full text-2xl font-semibold text-gray-900 mb-4">
            Recently AI Generated Quizzes
          </h1>
        )}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allAIQuizData?.map((topic) => (
            <Link
              key={topic.conversationId}
              to="/rules/$topic_name/$topic_id"
              params={{
                topic_name: topic.topic!,
                topic_id: topic.conversationId,
              }}
              search={{ source: "ai" }}
            >
              <TopicCard topic={topic} source="ai" />
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto">
        <h1 className="w-full text-2xl font-semibold text-gray-900 mb-4">
          Curated Quizzes
        </h1>

        {error && <ErrorComponent onRetry={refetch} isLoading={isPending} />}

        {isPending && <TopicsCardSkeletonLoader />}

        {!isPending && !error && topics.length === 0 && <EmptyStateComponent />}

        {!isPending && !error && topics.length > 0 && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics?.map((topic) => (
              <Link
                key={topic._id}
                to="/rules/$topic_name/$topic_id"
                params={{ topic_name: topic.title!, topic_id: topic._id! }}
                search={{ source: "db" }}
              >
                <TopicCard topic={topic} source="db" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
