import type { TopicMutation, TopicResponse } from "@/types";

export interface TopicFormProps {
  topic: TopicMutation | TopicResponse | null;
  onCancel: () => void;
  setIsTopicDialogOpen: (b: boolean) => void;
}
