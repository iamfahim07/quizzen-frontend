export interface TopicResponse {
  readonly _id?: string;
  title?: string;
  description?: string;
  img_link?: string;
  img_ref?: string;
}

export interface TopicMutation {
  readonly id?: string;
  readonly _id?: string;
  title: string;
  description: string;
  files?: File[];
}

export interface Quiz {
  readonly _id?: string;
  question: string;
  isMultiple: boolean;
  isSortQuiz: boolean;
  options: Option[];
}

export interface Option {
  readonly _id?: string;
  isCorrect: boolean;
  position: number | null;
  value: string;
}

export interface User {
  readonly _id?: string;
  fullName: string;
  username?: string;
  email?: string;
  role?: string;
  profilePicture?: string;
}

export type ButtonType =
  | "destructive"
  | "link"
  | "default"
  | "primary"
  | "outline"
  | "secondary"
  | "ghost"
  | null
  | undefined;

export type QuestionType = "multiple-choice" | "sortable";

export type Difficulty = "easy" | "medium" | "hard" | "extreme";

// export interface Question {
//   id: string;
//   quizId: string;
//   text: string;
//   options: string[];
//   correctAnswers: number[];
//   type: QuestionType;
// }
