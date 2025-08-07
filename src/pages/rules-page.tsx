import { Link, useParams, useSearch } from "@tanstack/react-router";
import {
  BrainCircuit,
  Calculator,
  CheckCircle,
  Clock,
  Edit,
  Lightbulb,
  Redo,
} from "lucide-react";

import { useGetQuizzes } from "@/api/use-get-quizzes";

import { Button } from "@/components/ui/button";

import { useAppStore } from "@/hooks/use-app-store";

import { SCORE_PER_QUIZ, TIME_LIMIT_PER_QUIZ } from "@/config";

export default function RulesPage() {
  const { topic_name, topic_id } = useParams({ strict: false });
  const { source } = useSearch({ from: "/rules/$topic_name/$topic_id" });

  const { aiQuizDataById } = useAppStore();
  const aiQuizData = aiQuizDataById(topic_id!);

  const isAIQuizData =
    source === "ai" && (aiQuizData?.quizzes?.length ?? 0) > 0;

  const {
    isLoading,
    error,
    data: { data: fetchedQuizzes } = { data: [] },
  } = useGetQuizzes(topic_id!, source);

  // Use AI data if available, otherwise use fetched data
  const quizzes = isAIQuizData ? aiQuizData?.quizzes : fetchedQuizzes;

  return (
    <div className="min-h-screen fade-in">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <BrainCircuit className="max-md:hidden h-10 w-10 text-blue-600 flex-shrink-0 mr-4" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{topic_name}</h2>
              <p className="text-gray-600">
                {isLoading && "Counting..."} {!isLoading && error && "Error..."}{" "}
                {!isLoading && !error && `${quizzes?.length} questions`} •{" "}
                {TIME_LIMIT_PER_QUIZ} Seconds per question
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">
            This quiz will test your understanding of {topic_name}. Read the
            rules below before starting the quiz.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quiz Rules
          </h3>

          <ul className="space-y-4">
            <li className="flex">
              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900">
                  Time Limit
                </h4>
                <p className="text-sm text-gray-600">
                  You have {TIME_LIMIT_PER_QUIZ} Seconds per question to
                  complete the quiz. The timer starts when you begin the quiz.
                </p>
              </div>
            </li>

            <li className="flex">
              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <Calculator className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900">
                  Scoring System
                </h4>
                <p className="text-sm text-gray-600">
                  Each correct answer is worth {SCORE_PER_QUIZ} points. There's
                  no penalty for incorrect answers. A score of 70% or higher is
                  regarded as a good result.
                </p>
              </div>
            </li>

            <li className="flex">
              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <Redo className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900">
                  Navigation
                </h4>
                <p className="text-sm text-gray-600">
                  You can't move back and forth between questions.
                </p>
              </div>
            </li>

            <li className="flex">
              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <Edit className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900">
                  Answering Questions
                </h4>
                <p className="text-sm text-gray-600">
                  Select an answer for each question by either clicking an
                  option or sorting the options in the correct order. You can
                  change your answers as long as you haven’t submitted the quiz
                  and there is still time remaining.
                </p>
              </div>
            </li>

            <li className="flex">
              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900">
                  Completion
                </h4>
                <p className="text-sm text-gray-600">
                  The quiz is complete when you've answered all questions or
                  when the time expires. Your results will be displayed
                  immediately.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-start">
            <Lightbulb className="text-yellow-500 h-5 w-5 flex-shrink-0 mr-3" />
            <p className="text-sm text-gray-700">
              <span className="font-medium">Tip:</span> Read each question
              carefully before selecting an answer. Some questions may have
              multiple options.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            to="/quiz/$topic_name/$topic_id"
            params={{ topic_name: topic_name!, topic_id: topic_id! }}
            search={{ source }}
          >
            <Button className="w-full cursor-pointer" size="lg">
              Start Quiz
            </Button>
          </Link>

          <Link to="/">
            <Button
              className="w-full bg-white cursor-pointer"
              size="lg"
              variant="ghost"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
