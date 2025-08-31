import type { Quiz } from "@/types";

export interface QuizzesListProps {
  topicId: string;
  searchTerm: string;
  onUpdateClick: (quiz: Quiz) => void;
}
