import { CirclePlus, Edit, Trash2 } from "lucide-react";

import { useDeleteTopic } from "@/api/admin/use-delete-topic";
import { useGetQuizzes } from "@/api/use-get-quizzes";

import { SpinnerLoader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useAiQuizStore } from "@/hooks/use-ai-quiz-store";
import { useConfirm } from "@/hooks/use-confirm";

import { cn } from "@/lib/utils";

import type { Quiz, TopicResponse } from "@/types";

const topicCoverImages = {
  fallBackImage:
    "https://images.unsplash.com/photo-1688651139745-606898a43b52?q=80&w=1974&auto=format&fit=crop",
};

interface TopicCardProps {
  topic: TopicResponse & {
    conversationId?: string;
    topic?: string;
    quizzes?: Quiz[];
  };
  source: "db" | "ai";
  onTopicCardClick?: () => void;
  admin?: boolean;
  onQuizAddClick?: () => void;
  onUpdateClick?: () => void;
}

export default function TopicCard({
  topic,
  source,
  admin,
  onTopicCardClick,
  onQuizAddClick,
  onUpdateClick,
}: TopicCardProps) {
  const { isLoading, data: { data: fetchedQuizzes } = { data: [] } } =
    useGetQuizzes(topic._id!, source);

  const isAiGenerated = source === "ai";

  const title = topic.title || topic.topic || "";

  const [DeleteTopicDialog, confirmDeleteTopic] = useConfirm(
    `Delete ${title} Topic?`,
    "This action cannot be undone.",
    "destructive"
  );
  const { removeAIQuizDataById } = useAiQuizStore();

  const mutation = useDeleteTopic(title);

  const handleDeleteTopic = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const ok = await confirmDeleteTopic();
    if (!ok) return;

    const idToDelete = isAiGenerated ? topic?.conversationId : topic._id;

    if (!idToDelete) return;

    if (isAiGenerated) {
      removeAIQuizDataById(idToDelete);
    } else if (admin) {
      mutation.mutate({ topicId: idToDelete });
    }
  };

  const quizLength =
    (source === "db" ? fetchedQuizzes?.length : topic?.quizzes?.length) || 0;

  if (mutation.isPending) return <SpinnerLoader className="h-48" />;

  return (
    <>
      <DeleteTopicDialog />

      <Card
        className="group flex flex-col justify-between cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden bg-white rounded-[8px] border-0 shadow-lg p-0 h-full gap-0"
        onClick={onTopicCardClick}
      >
        <CardContent className="p-4 m-0 space-y-3">
          <div className="rounded-md overflow-hidden">
            <img
              src={topic.img_link || topicCoverImages.fallBackImage}
              alt={topic.img_ref || "topic image"}
              className={cn(
                "w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105",
                source === "ai" && "object-[50%_75%]"
              )}
            />
          </div>

          <div className="text-[#111827] text-xl font-bold">
            <h3>{topic.title || topic.topic}</h3>
          </div>

          <div className="text-[#4B5563] text-sm leading-relaxed">
            <p>{topic.description}</p>
          </div>
        </CardContent>

        <CardContent className="px-4 pb-4 flex justify-between items-center">
          <Badge variant="secondary" className="bg-[#26C08C] text-white">
            {isLoading
              ? "Loading..."
              : `${quizLength} ${quizLength <= 1 ? "quiz" : "quizzes"}`}
          </Badge>

          <div className="space-x-0.5">
            {admin && (
              <Button
                size="lg"
                variant="ghost"
                className="cursor-pointer"
                onClick={onQuizAddClick}
              >
                <CirclePlus className="size-5" />
              </Button>
            )}

            {admin && (
              <Button
                size="lg"
                variant="ghost"
                className="cursor-pointer"
                onClick={onUpdateClick}
              >
                <Edit className="size-5" />
              </Button>
            )}

            {(admin || isAiGenerated) && (
              <Button
                size="lg"
                variant="ghost"
                className="text-red-600 hover:text-red-700 cursor-pointer"
                onClick={(e) => handleDeleteTopic(e)}
              >
                <Trash2 className="size-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
