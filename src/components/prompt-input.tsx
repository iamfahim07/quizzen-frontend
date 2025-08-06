import { useNavigate } from "@tanstack/react-router";
import { ArrowUp, Paperclip } from "lucide-react";
import { useMemo, useState } from "react";

import { useGenerateAiQuizzes } from "@/api/use-generate-ai-quizzes";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { useAIQuizModal } from "@/hooks/use-ai-quiz-modal";
import { useAppStore } from "@/hooks/use-app-store";
import { useProgressStore } from "@/hooks/use-progress-store";

interface PromptInputProps {
  conversationIdProp?: string | null;
  placeholder?: string;
  modifyExisting?: boolean;
}

export default function PromptInput({
  conversationIdProp = null,
  placeholder = "Ex: Please create 20 quizzes in hard mode based on the attached image and PDF.",
  modifyExisting = false,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  //   const [selectedMode, setSelectedMode] = useState("ask");

  const conversationId = useMemo(
    () =>
      conversationIdProp !== null ? conversationIdProp : crypto.randomUUID(),
    [conversationIdProp]
  );

  const navigate = useNavigate();

  const { open } = useAIQuizModal();
  const { setChatHistoryById, setAIQuizDataById } = useAppStore();

  const { mutate: generateAiQuizzes } = useGenerateAiQuizzes();

  const { startProgress } = useProgressStore();

  const handleSubmit = async () => {
    if (prompt.trim() || files.length > 0) {
      navigate({
        to: "/",
        search: { aiQuizDataId: conversationId },
      });

      setChatHistoryById(conversationId, {
        role: "user",
        text: prompt,
        attachments: files.length > 0 ? files.map((file) => file.name) : null,
      });

      setAIQuizDataById({
        conversationId: conversationId,
        isPending: true,
        isSuccess: false,
        isError: false,
      });

      startProgress();

      generateAiQuizzes({
        prompt,
        conversationId,
        modifyExisting,
        files,
      });

      setPrompt("");
      setFiles([]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 10 || files.length + selectedFiles.length > 10) {
      return alert("You can only select up to 10 files.");
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      open();
    }
  };

  return (
    <div className="w-full mx-auto">
      <Card className="bg-white backdrop-blur-lg shadow-xl border border-white/50 rounded-lg overflow-hidden py-0 gap-0">
        <div className="px-0 pt-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="border-0 focus-visible:ring-0 md:text-base px-5 bg-transparent text-gray-600 placeholder:text-gray-400 max-h-28 resize-none"
          />
        </div>

        {/* File attachments */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
              >
                <span className="truncate max-w-32">{file.name}</span>
                <button
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-gray-500 hover:text-red-500 ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 px-4 pb-2 bg-white">
          <div className="relative hover:cursor-pointer group/file_icon">
            {/* File upload */}
            <input
              type="file"
              name="quiz_files"
              id="quiz_files"
              multiple
              accept="image/*,.pdf,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 group-hover/file_icon:!cursor-pointer"
            />
            <label
              htmlFor="quiz_files"
              className="group-hover/file_icon:!cursor-pointer"
            >
              <Button
                type="button"
                variant="ghost"
                className="w-8 h-8 text-gray-500 group-hover/file_icon:text-gray-700 group-hover/file_icon:bg-gray-100 group-hover/file_icon:!cursor-pointer"
              >
                <Paperclip className="!size-5 group-hover/file_icon:!cursor-pointer" />
              </Button>
            </label>
          </div>

          {/* Submit button */}
          <Button
            onClick={() => {
              handleSubmit();
              open();
            }}
            disabled={!prompt.trim() && files.length === 0}
            className="h-8 w-8 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 rounded-full p-0"
            size="icon"
          >
            <ArrowUp className="text-white !size-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
