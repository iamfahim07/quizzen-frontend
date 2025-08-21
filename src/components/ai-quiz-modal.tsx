import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeft, HistoryIcon } from "lucide-react";
import { useMedia } from "react-use";

import PromptInput from "@/components/prompt-input";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAIQuizModal } from "@/hooks/use-ai-quiz-modal";
import { useAiChatStore, useAiQuizStore } from "@/hooks/use-ai-quiz-store";
import { useProgressStore } from "@/hooks/use-progress-store";

import { cn } from "@/lib/utils";

export const AIQuizModal = () => {
  const { aiQuizDataId } = useSearch({ strict: false });

  const { isOpen, close } = useAIQuizModal();

  const { chatHistoryById, removeChatHistoryById } = useAiChatStore();
  const { aiQuizDataById, removeAIQuizDataById } = useAiQuizStore();

  const chatHistory = chatHistoryById(aiQuizDataId!);

  const { progress } = useProgressStore();

  const aiQuizData = aiQuizDataById(aiQuizDataId!);

  const navigate = useNavigate();

  const isDesktop = useMedia("(min-width: 1024px)", true);

  if (isDesktop) {
    return (
      <ResponsiveModal open={isOpen}>
        <div className="w-full h-full flex justify-center items-center bg-gray-50 overflow-hidden">
          <div className="w-[35%] h-full py-2 px-3 flex flex-col justify-between">
            <div className="flex gap-2 items-center">
              <h1 className="text-base truncate font-medium text-gray-800">
                Chat History
              </h1>

              <HistoryIcon className="size-4 mt-1" />
            </div>

            <div className="h-full flex flex-col gap-2 py-1.5 overflow-y-auto">
              {chatHistory?.map((chat, index) => {
                if (chat.role === "user") {
                  return (
                    <div key={index} className="flex flex-col gap-0.5">
                      <div className="flex gap-3 px-4 pb-2 overflow-x-auto">
                        {chat.attachments &&
                          chat.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="group relative shrink-0 bg-gray-100 rounded-lg overflow-visible"
                            >
                              <div className="w-24 h-24 py-1 px-2 rounded-lg">
                                <div className="w-full h-17 text-xs break-words text-wrap truncate">
                                  {attachment}
                                </div>

                                <div className="bg-gray-700 text-white text-xs font-medium px-1.5 py-0.5 rounded text-center uppercase min-w-0">
                                  {attachment.split(".").pop()}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      <div className="w-fit max-w-[90%] p-2 ml-auto bg-gray-200 rounded-lg">
                        <p className="w-full">{chat.text}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={index}>
                    <p>{chat.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-4">
              <PromptInput
                conversationIdProp={aiQuizData?.conversationId}
                modifyExisting={true}
              />
            </div>
          </div>

          <div className="w-[65%] h-full px-6 py-6 bg-white">
            <div className="h-[90%] flex flex-col gap-3 overflow-y-auto">
              {aiQuizData?.isPending && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <Progress value={progress} className="w-[80%]" />
                  <h1 className="text-xl font-medium">
                    Processing your request
                  </h1>
                  <p className="text-center text-muted-foreground">
                    Please wait while we analyze your prompt and prepare the
                    response...
                  </p>
                </div>
              )}

              {!aiQuizData?.isPending && aiQuizData?.isSuccess && (
                <h1 className="text-2xl font-medium text-gray-800 mb-4">
                  {aiQuizData.topic ?? "No topic found"}
                </h1>
              )}

              {!aiQuizData?.isPending &&
                aiQuizData?.isSuccess &&
                (aiQuizData?.quizzes?.length ?? 0) > 0 &&
                aiQuizData?.quizzes?.map((quiz, index) => (
                  <div
                    key={quiz._id}
                    className={cn(
                      `p-4 rounded-lg border-l-4`,
                      "bg-green-50 border-green-500"
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm text-gray-900">
                        Quiz {index + 1}
                      </h4>
                    </div>
                    <p className="font-medium text-gray-700 mb-2">
                      <span className="font-semibold">Question: </span>
                      {quiz.question}
                    </p>
                  </div>
                ))}
            </div>

            <div className="w-full h-[10%] flex flex-col-reverse sm:flex-row justify-center items-center gap-2">
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-1/2 cursor-pointer"
                onClick={() => {
                  navigate({ to: "/" });
                  removeChatHistoryById(aiQuizDataId!);
                  removeAIQuizDataById(aiQuizDataId!);
                  close();
                }}
              >
                Cancel
              </Button>

              <Button
                className="w-full sm:w-1/2 cursor-pointer"
                onClick={() => {
                  navigate({
                    to: "/rules/$topic_name/$topic_id",
                    params: {
                      topic_name: aiQuizData?.topic ?? "",
                      topic_id: aiQuizData?.conversationId ?? "",
                    },
                    search: { source: "ai" },
                  });
                  close();
                }}
                disabled={aiQuizData?.isPending}
              >
                Go Ahed
              </Button>
            </div>
          </div>
        </div>
      </ResponsiveModal>
    );
  }

  return (
    <ResponsiveModal open={isOpen} isDrawerDismissible={false}>
      <div className="w-full h-[95vh] flex flex-col bg-gray-50 overflow-hidden">
        <span
          className="absolute left-8 p-1 rounded-xl hover:bg-muted cursor-pointer"
          onClick={() => {
            navigate({ to: "/" });
            removeChatHistoryById(aiQuizDataId!);
            removeAIQuizDataById(aiQuizDataId!);
            close();
          }}
        >
          <ChevronLeft className="size-5" />
        </span>

        <Tabs defaultValue="chat" className="h-full">
          <TabsList className="w-[60%] mx-auto grid grid-cols-2">
            <TabsTrigger value="chat" className="cursor-pointer">
              Chat
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="cursor-pointer">
              Quizzes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="h-full overflow-hidden">
            <div className="w-full h-full py-2 px-3 md:px-6 flex flex-col justify-between">
              <div className="h-full flex flex-col gap-2 py-1.5 overflow-y-auto">
                {chatHistory?.map((chat, index) => {
                  if (chat.role === "user") {
                    return (
                      <div key={index} className="flex flex-col gap-0.5">
                        <div className="flex gap-3 px-4 pb-2 overflow-x-auto">
                          {chat.attachments &&
                            chat.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className="group relative shrink-0 bg-gray-100 rounded-lg overflow-visible"
                              >
                                <div className="w-24 h-24 py-1 px-2 rounded-lg">
                                  <div className="w-full h-17 text-xs break-words text-wrap truncate">
                                    {attachment}
                                  </div>

                                  <div className="bg-gray-700 text-white text-xs font-medium px-1.5 py-0.5 rounded text-center uppercase min-w-0">
                                    {attachment.split(".").pop()}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>

                        <div className="w-fit max-w-[90%] p-2 ml-auto bg-gray-200 rounded-lg">
                          <p className="w-full">{chat.text}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={index}>
                      <p>{chat.text}</p>
                    </div>
                  );
                })}

                {aiQuizData?.isPending && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 mt-4">
                    <Progress value={progress} className="w-[80%]" />
                    <h1 className="text-xl font-medium">
                      Processing your request
                    </h1>
                    <p className="text-center text-muted-foreground">
                      Please wait while we analyze your prompt and prepare the
                      response...
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <PromptInput
                  conversationIdProp={aiQuizData?.conversationId}
                  modifyExisting={true}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="h-full overflow-hidden">
            <div className="w-full h-full py-2 px-3 md:px-6 flex flex-col justify-between">
              <div className="h-full flex flex-col gap-2 py-1.5 overflow-y-auto">
                {aiQuizData?.isPending && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 mt-4">
                    <Progress value={progress} className="w-[80%]" />
                    <h1 className="text-xl font-medium">
                      Processing your request
                    </h1>
                    <p className="text-center text-muted-foreground">
                      Please wait while we analyze your prompt and prepare the
                      response...
                    </p>
                  </div>
                )}

                {!aiQuizData?.isPending && aiQuizData?.isSuccess && (
                  <h1 className="text-2xl font-medium text-gray-800 mb-1">
                    {aiQuizData.topic ?? "No topic found"}
                  </h1>
                )}

                {!aiQuizData?.isPending &&
                  aiQuizData?.isSuccess &&
                  (aiQuizData?.quizzes?.length ?? 0) > 0 &&
                  aiQuizData.quizzes?.map((quiz, index) => (
                    <div
                      key={quiz._id}
                      className={cn(
                        `p-4 rounded-lg border-l-4`,
                        "bg-green-50 border-green-500"
                      )}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm text-gray-900">
                          Quiz {index + 1}
                        </h4>
                      </div>
                      <p className="font-medium text-gray-700 mb-2">
                        <span className="font-semibold">Question: </span>
                        {quiz.question}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="flex justify-center items-center gap-2 overflow-hidden">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-1/2 cursor-pointer"
                  onClick={() => {
                    navigate({ to: "/" });
                    removeChatHistoryById(aiQuizDataId!);
                    removeAIQuizDataById(aiQuizDataId!);
                    close();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  className="w-1/2 cursor-pointer"
                  onClick={() => {
                    navigate({
                      to: "/rules/$topic_name/$topic_id",
                      params: {
                        topic_name: aiQuizData?.topic ?? "",
                        topic_id: aiQuizData?.conversationId ?? "",
                      },
                      search: { source: "ai" },
                    });
                    close();
                  }}
                  disabled={aiQuizData?.isPending}
                >
                  Go Ahed
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveModal>
  );
};
