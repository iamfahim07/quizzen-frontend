import { BarChart3, BookOpen, Plus, Search, Users } from "lucide-react";
import { useState } from "react";

import { useGetQuizzesCount } from "@/api/admin/use-get-quizzes-count";
import { useGetUsers } from "@/api/admin/use-get-users";
import { useGetTopics } from "@/api/use-get-topics";

import { QuizzesList } from "@/components/admin/quizzes-list";
import {
  EmptyStateComponent,
  ErrorComponent,
} from "@/components/fallback-component";
import { SpinnerLoader } from "@/components/loader";
import { TopicsCardSkeletonLoader } from "@/components/skeleton-loaders";
import TopicCard from "@/components/topic-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuizForm from "../components/admin/quiz-form";
import TopicForm from "../components/admin/topic-form";

import type { Quiz, TopicResponse } from "@/types";

export default function AdminDashboardPage() {
  const [selectedTopic, setSelectedTopic] = useState<TopicResponse | null>(
    null
  );
  const [editingTopic, setEditingTopic] = useState<TopicResponse | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);

  const {
    isPending: topicsDataPending,
    error: topicsDataError,
    data: { data: topicsData } = { data: [] },
    refetch: topicsDataRefetch,
  } = useGetTopics();
  const {
    isPending: quizzesCountPending,
    error: quizzesCountError,
    data: { data: quizzesCount } = { data: 0 },
  } = useGetQuizzesCount();
  const {
    isPending: usersPending,
    error: usersError,
    data: { data: users } = { data: [] },
  } = useGetUsers();

  const filteredTopics = topicsData?.filter(
    (topic) =>
      topic.title!.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description!.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="min-h-screen container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="w-fit text-4xl font-bold bg-gradient-to-r from-violet-500 to-blue-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage quiz topics, quizzes, and view analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-violet-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Topics
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {topicsDataPending && (
                  <span className="text-sm font-normal">Counting...</span>
                )}

                {!topicsDataPending && topicsDataError && (
                  <span className="text-sm text-red-600 font-normal">
                    Error
                  </span>
                )}

                {!topicsDataPending && !topicsDataError && topicsData.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Quizzes
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizzesCountPending && (
                  <span className="text-sm font-normal">Counting...</span>
                )}

                {!quizzesCountPending && quizzesCountError && (
                  <span className="text-sm text-red-600 font-normal">
                    Error
                  </span>
                )}

                {!quizzesCountPending && !quizzesCountError && quizzesCount}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usersPending && (
                  <span className="text-sm font-normal">Counting...</span>
                )}

                {!usersPending && usersError && (
                  <span className="text-sm text-red-600 font-normal">
                    Error
                  </span>
                )}

                {!usersPending && !usersError && users.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search topics and quizzes..."
            className="bg-white shadow pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs for Topics and Quizzes */}
        <Tabs defaultValue="topics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topics" className="cursor-pointer">
              Topics
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="cursor-pointer">
              Quizzes
            </TabsTrigger>
          </TabsList>

          <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
            <DialogContent className="max-md:p-4 sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuiz ? "Edit Quiz" : "Add New Quiz"}
                </DialogTitle>
                <DialogDescription>
                  {editingQuiz
                    ? "Update the quiz details below."
                    : "Create a new quiz."}
                </DialogDescription>
              </DialogHeader>
              <QuizForm
                topic={selectedTopic}
                editingQuiz={editingQuiz}
                onCancel={() => {
                  setEditingQuiz(null);
                  setIsQuizDialogOpen(false);
                }}
                setIsQuizDialogOpen={setIsQuizDialogOpen}
              />
            </DialogContent>
          </Dialog>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Quiz Topics</h2>
              <Dialog
                open={isTopicDialogOpen}
                onOpenChange={setIsTopicDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingTopic(null);
                      setIsTopicDialogOpen(true);
                    }}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 cursor-pointer"
                  >
                    <Plus size={16} />
                    Add Topic
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTopic ? "Edit Topic" : "Add New Topic"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTopic
                        ? "Update the topic details below."
                        : "Create a new quiz topic."}
                    </DialogDescription>
                  </DialogHeader>
                  <TopicForm
                    topic={editingTopic}
                    onCancel={() => {
                      setEditingTopic(null);
                      setIsTopicDialogOpen(false);
                    }}
                    setIsTopicDialogOpen={setIsTopicDialogOpen}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {topicsDataPending && <TopicsCardSkeletonLoader />}

            {!topicsDataPending && topicsDataError && (
              <ErrorComponent
                onRetry={topicsDataRefetch}
                isLoading={topicsDataPending}
              />
            )}

            {!topicsDataPending &&
              !topicsDataError &&
              topicsData.length === 0 && <EmptyStateComponent />}

            {!topicsDataPending &&
              !topicsDataError &&
              topicsData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTopics?.map((topic) => (
                    <TopicCard
                      key={topic._id}
                      topic={topic}
                      source="db"
                      admin
                      onQuizAddClick={() => {
                        setSelectedTopic(topic);
                        setEditingQuiz(null);
                        setIsQuizDialogOpen(true);
                      }}
                      onUpdateClick={() => {
                        setEditingTopic(topic);
                        setEditingQuiz(null);
                        setIsTopicDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Quizzes</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedTopic(null);
                      setEditingQuiz(null);
                      setIsQuizDialogOpen(true);
                    }}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 cursor-pointer"
                  >
                    <Plus size={16} />
                    Add Quiz
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>

            {topicsDataPending && <SpinnerLoader />}

            {!topicsDataPending && topicsDataError && (
              <ErrorComponent
                onRetry={topicsDataRefetch}
                isLoading={topicsDataPending}
              />
            )}

            {!topicsDataPending &&
              !topicsDataError &&
              topicsData.length === 0 && <EmptyStateComponent />}

            {!topicsDataPending &&
              !topicsDataError &&
              topicsData.length > 0 && (
                <Accordion
                  type="single"
                  collapsible
                  className="w-full px-2"
                  defaultValue="item-1"
                >
                  {topicsData.map((topic, index) => (
                    <AccordionItem key={topic._id} value={`item-${index + 1}`}>
                      <AccordionTrigger className="text-2xl bg-white shadow border-l-4 border-blue-500 px-4 mb-4 cursor-pointer">
                        {topic.title}
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-4 ml-4 text-balance">
                        <QuizzesList
                          topicId={topic._id!}
                          searchTerm={searchTerm}
                          onUpdateClick={(quizData) => {
                            setSelectedTopic(topic);
                            setEditingQuiz(quizData);
                            setIsQuizDialogOpen(true);
                          }}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
