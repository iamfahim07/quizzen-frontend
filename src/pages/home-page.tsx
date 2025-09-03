import { useNavigate } from "@tanstack/react-router";

import { useGetTopics } from "@/api/use-get-topics";

import {
  EmptyStateComponent,
  ErrorComponent,
} from "@/components/fallback-component";
import PromptInput from "@/components/prompt-input";
import { TopicsCardSkeletonLoader } from "@/components/skeleton-loaders";
import TopicCard from "@/components/topic-card";

import { MultiplayerStartButton } from "@/features/multiplayer/components/multiplayer-start-button";

import { useAiQuizStore } from "@/hooks/use-ai-quiz-store";
import { useAuthStore } from "@/hooks/use-auth-store";

export default function HomePage() {
  const { user } = useAuthStore();

  const navigate = useNavigate();

  const { allAIQuizData } = useAiQuizStore();

  const {
    isPending,
    error,
    data: { data: topics } = { data: [] },
    refetch,
  } = useGetTopics();

  const handleClick = (topicName: string, topicId: string, source: string) => {
    navigate({
      to: "/rules/$topic_name/$topic_id",
      params: {
        topic_name: topicName,
        topic_id: topicId,
      },
      search: { source },
    });
  };

  return (
    <main className="fade-in animate-in duration-500">
      <div className="px-4 sm:px-6 lg:px-8 pb-8 lg:pb-16">
        <section className="max-w-7xl mx-auto py-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold font-[Caveat] bg-gradient-to-r from-violet-500 to-blue-600 bg-clip-text text-transparent mb-2">
              Welcome{user && " back"},{" "}
              <span className="text-violet-500 bg-[url(./assets/images/yellow_highlight_bold_02.svg)] bg-position-[center_60%] bg-no-repeat bg-contain whitespace-nowrap">
                {user?.fullName?.split(" ")[0] || "Guest"}!
              </span>
            </h2>
            <div className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-600">
              Choose a quiz topic to challenge yourself and test your
              knowledge—boost your score, or{" "}
              <p className="text-4xl font-medium font-[Caveat] bg-gradient-to-r from-violet-500 to-blue-600 bg-clip-text text-transparent">
                <span className="text-violet-500 bg-[url(./assets/images/red_highlight_01.svg)] bg-position-[center_bottom] bg-no-repeat bg-contain whitespace-nowrap">
                  ask the AI
                </span>{" "}
                to create a quiz just for you!
              </p>
            </div>
          </div>

          <PromptInput />
        </section>

        <section className="max-w-7xl mx-auto mb-10">
          <MultiplayerStartButton />
        </section>

        <section className="max-w-7xl mx-auto mb-10">
          {allAIQuizData.length > 0 && (
            <h1 className="w-full text-2xl font-semibold text-gray-900 mb-4">
              AI-Generated Quizzes
            </h1>
          )}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allAIQuizData?.map((topic) => (
              <TopicCard
                key={topic.conversationId}
                topic={topic}
                source="ai"
                onTopicCardClick={() =>
                  handleClick(topic.topic!, topic.conversationId, "ai")
                }
              />
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto">
          <h1 className="w-full text-2xl font-semibold text-gray-900 mb-4">
            Popular Quizzes
          </h1>

          {error && <ErrorComponent onRetry={refetch} isLoading={isPending} />}

          {isPending && <TopicsCardSkeletonLoader />}

          {!isPending && !error && topics.length === 0 && (
            <EmptyStateComponent />
          )}

          {!isPending && !error && topics.length > 0 && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics?.map((topic) => (
                <TopicCard
                  key={topic._id}
                  topic={topic}
                  source="db"
                  onTopicCardClick={() =>
                    handleClick(topic.title!, topic._id!, "db")
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
