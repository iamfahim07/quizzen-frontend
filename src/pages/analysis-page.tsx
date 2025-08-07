import { Link, useParams, useSearch } from "@tanstack/react-router";
import { BrainCircuit, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";

import { useAppStore } from "@/hooks/use-app-store";

import { cn, secondsToMinutes } from "@/lib/utils";

import { SCORE_PER_QUIZ, TIME_LIMIT_PER_QUIZ } from "@/config";

export default function AnalysisPage() {
  const { topic_name, topic_id } = useParams({ strict: false });
  const { source } = useSearch({ from: "/analysis/$topic_name/$topic_id" });

  const { getUserAnalysisResultById } = useAppStore();
  const { userStats, submittedQuizData } = getUserAnalysisResultById(
    topic_id ?? ""
  );

  const correctAnswerCount = submittedQuizData.filter(
    (singleQuiz) => singleQuiz.isCorrect
  ).length;

  const [showAllQuiz, setShowAllQuiz] = useState(false);

  const itemsToShow = showAllQuiz
    ? submittedQuizData
    : submittedQuizData.slice(0, 2);

  const chartData = [
    { name: "Correct", value: correctAnswerCount, fill: "#10B981" },
    {
      name: "Incorrect",
      value: submittedQuizData.length - correctAnswerCount,
      fill: "#EF4444",
    },
  ];

  return (
    <div className="min-h-screen pb-16 fade-in">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-6">
            <BrainCircuit className="h-8 w-8 text-primary mr-4" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{topic_name}</h2>
              <p className="text-gray-600">
                {submittedQuizData.length} questions •{" "}
                {secondsToMinutes(
                  submittedQuizData.length * TIME_LIMIT_PER_QUIZ
                )}{" "}
                minutes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Your Score</p>
              <p className="text-3xl font-bold text-green-600">
                {userStats.score}
              </p>
              <p className="text-sm text-gray-600">
                out of {submittedQuizData.length * SCORE_PER_QUIZ} points
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-blue-600">
                {Math.round(
                  (correctAnswerCount / submittedQuizData.length) * 100
                )}
                %
              </p>
              <p className="text-sm text-gray-600">
                {correctAnswerCount}/{submittedQuizData.length} correct answers
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Time Taken</p>
              <p className="text-3xl font-bold text-purple-600">
                {secondsToMinutes(userStats.timeTaken)}
              </p>
              <p className="text-sm text-gray-600">
                of{" "}
                {secondsToMinutes(
                  submittedQuizData.length * TIME_LIMIT_PER_QUIZ
                )}{" "}
                minutes
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Breakdown
            </h3>
            <div className="w-full h-[250px]">
              <ResponsiveContainer>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Question Analysis
            </h3>
            <div className="space-y-4">
              {itemsToShow.map((singleQuizData, index) => (
                <div
                  key={singleQuizData._id}
                  className={cn(
                    `p-4 rounded-lg border-l-4`,
                    singleQuizData.isCorrect
                      ? "bg-green-50 border-green-500"
                      : "bg-red-50 border-red-500"
                  )}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">
                      Quiz {index + 1}
                    </h4>
                    <span
                      className={cn(
                        `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`,
                        singleQuizData.isCorrect
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {singleQuizData.isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Question: </span>{" "}
                    {singleQuizData.question}
                  </p>
                  <p className="text-xs font-semibold text-gray-600">
                    {singleQuizData.isSortQuiz ? "Your sorting" : "Your answer"}
                    :{" "}
                    <span
                      className={cn(
                        `font-medium`,
                        singleQuizData.isCorrect
                          ? "text-green-700"
                          : "text-red-700"
                      )}
                    >
                      {singleQuizData.selectedOptions.length > 0
                        ? singleQuizData.selectedOptions
                            .map((option) => option.value)
                            .join(", ")
                        : "You didn't select any options."}
                    </span>
                  </p>

                  <p className="text-xs font-semibold text-gray-600">
                    {singleQuizData.isSortQuiz
                      ? "Correct sorting"
                      : "Correct answer"}
                    :{" "}
                    <span className="font-medium text-green-700">
                      {singleQuizData.isSortQuiz
                        ? singleQuizData.options
                            .sort(
                              (a, b) => (a?.position ?? 0) - (b?.position ?? 0)
                            )
                            .map((option) => option.value)
                            .join(", ")
                        : singleQuizData.options
                            .filter((option) => option.isCorrect)
                            .map((option) => option.value)
                            .join(", ")}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            <Button
              variant="link"
              className="mt-4 text-primary text-sm p-0 h-auto flex items-center"
              onClick={() => setShowAllQuiz((p) => !p)}
            >
              {showAllQuiz ? (
                <>
                  View less questions <ChevronLeft className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  View all questions <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 space-x-4">
          <Link to="/" className="w-full flex-1">
            <Button
              variant="secondary"
              size="lg"
              className="w-full bg-white flex-1 cursor-pointer"
            >
              Try new quiz
            </Button>
          </Link>

          <Link
            to="/quiz/$topic_name/$topic_id"
            params={{ topic_name: topic_name!, topic_id: topic_id! }}
            search={{ source }}
            className="w-full flex-1"
          >
            <Button size="lg" className="w-full flex-1 cursor-pointer">
              Retry
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
