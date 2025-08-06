import { CirclePlus, Edit, Trash2 } from "lucide-react";

import { useDeleteTopic } from "@/api/admin/use-delete-topic";
import { useGetQuizzes } from "@/api/use-get-quizzes";

import { SpinnerLoader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useConfirm } from "@/hooks/use-confirm";

import { cn } from "@/lib/utils";

import type { Quiz, TopicResponse } from "@/types";

const topicCoverImages = {
  fallBackImage:
    "https://images.unsplash.com/photo-1688651139745-606898a43b52?q=80&w=1974&auto=format&fit=crop",
};

interface TopicCardProps {
  topic: TopicResponse & { topic?: string; quizzes?: Quiz[] };
  source: string;
  admin?: boolean;
  onQuizAddClick?: () => void;
  onUpdateClick?: () => void;
}

export default function TopicCard({
  topic,
  source,
  admin,
  onQuizAddClick,
  onUpdateClick,
}: TopicCardProps) {
  const { isLoading, data: { data: fetchedQuizzes } = { data: [] } } =
    useGetQuizzes(topic._id!, source);

  const title = topic.title || topic.topic || "";

  const [DeleteTopicDialog, confirmDeleteTopic] = useConfirm(
    `Delete ${title} Topic?`,
    "This action cannot be undone.",
    "destructive"
  );

  const mutation = useDeleteTopic(title);

  const handleDeleteTopic = async () => {
    const ok = await confirmDeleteTopic();
    if (!ok) return;

    if (!topic._id) return;
    mutation.mutate({ topicId: topic._id });
  };

  const quizLength =
    (source === "db" ? fetchedQuizzes?.length : topic?.quizzes?.length) || 0;

  if (mutation.isPending) return <SpinnerLoader className="h-48" />;

  return (
    <>
      <DeleteTopicDialog />

      <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden bg-white rounded-2xl border-0 shadow-lg p-0 h-full gap-0">
        <CardContent className="p-0 m-0">
          <div className="relative h-48 overflow-hidden">
            <img
              src={topic.img_link || topicCoverImages.fallBackImage}
              alt={topic.img_ref || "topic image"}
              className={cn(
                "w-full h-full object-cover transition-transform duration-300 group-hover:scale-110",
                source === "ai" && "object-[50%_75%]"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white text-shadow-xs text-shadow-black text-xl font-bold mb-1">
                {topic.title || topic.topic}
              </h3>

              <Badge variant="secondary" className="mt-1">
                {isLoading
                  ? "Loading..."
                  : `${quizLength} ${quizLength <= 1 ? "quiz" : "quizzes"}`}
              </Badge>

              {topic.description && (
                <div>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {admin && (
          <CardContent className="p-1">
            <div className="flex space-x-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="cursor-pointer"
                onClick={onQuizAddClick}
              >
                <CirclePlus size={14} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="cursor-pointer"
                onClick={onUpdateClick}
              >
                <Edit size={14} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 cursor-pointer"
                onClick={handleDeleteTopic}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </>
  );
}
