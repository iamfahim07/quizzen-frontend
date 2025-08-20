import { useNavigate } from "@tanstack/react-router";
import { ArrowUp, Paperclip, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useGenerateAiQuizzes } from "@/api/use-generate-ai-quizzes";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useAIQuizModal } from "@/hooks/use-ai-quiz-modal";
import { useAiChatStore, useAiQuizStore } from "@/hooks/use-ai-quiz-store";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useProgressStore } from "@/hooks/use-progress-store";

import { cn } from "@/lib/utils";

import type { Difficulty } from "@/types";

interface PromptInputProps {
  conversationIdProp?: string | null;
  placeholder?: string;
  modifyExisting?: boolean;
}

// type Difficulty = "easy" | "medium" | "hard";

interface FileWithPreview {
  id: string;
  file: File;
  url: string;
}

interface DialogContentState {
  isOpen: boolean;
  src: string | null;
  alt: string;
}

export default function PromptInput({
  conversationIdProp = null,
  placeholder = "Ex: Please create 20 quizzes in hard mode based on the attached image and PDF.",
  modifyExisting = false,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [dialogContentState, setDialogContentState] =
    useState<DialogContentState>({
      isOpen: false,
      src: null,
      alt: "",
    });

  const { user, isLoading: authIsLoading } = useAuthStore();
  const { AuthModal, openAuthModal } = useAuthModal();

  const isDisabled = (!prompt.trim() && files.length === 0) || authIsLoading;

  const inputRef = useRef<HTMLInputElement>(null);

  const conversationId = useMemo(
    () =>
      conversationIdProp !== null ? conversationIdProp : crypto.randomUUID(),
    [conversationIdProp]
  );

  const navigate = useNavigate();

  const { open } = useAIQuizModal();

  const { setChatHistoryById } = useAiChatStore();
  const { setAIQuizDataById } = useAiQuizStore();

  const { mutate: generateAiQuizzes } = useGenerateAiQuizzes();

  const { startProgress } = useProgressStore();

  const handleSubmit = async () => {
    if (isDisabled) return;

    if (!user) {
      return openAuthModal();
    }

    navigate({
      to: "/",
      search: { aiQuizDataId: conversationId },
    });

    setChatHistoryById(conversationId, {
      role: "user",
      text: prompt,
      attachments:
        files.length > 0 ? files.map((fileObj) => fileObj.file.name) : null,
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
      difficulty,
      conversationId,
      modifyExisting,
      files: files.map((f) => f.file),
    });

    files.forEach((f) => {
      if (f.url) URL.revokeObjectURL(f.url);
    });

    setPrompt("");
    setFiles([]);

    open();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 10 || files.length + selectedFiles.length > 10) {
      return alert("You can only select up to 10 files.");
    }

    const created: FileWithPreview[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }));

    setFiles((prev) => [...prev, ...created]);

    if (event.target) event.target.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found && found.url) {
        URL.revokeObjectURL(found.url);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const filesRef = useRef<FileWithPreview[]>([]);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => {
        if (f.url) URL.revokeObjectURL(f.url);
      });
    };
  }, []);

  return (
    <>
      <AuthModal />

      <Dialog
        open={dialogContentState.isOpen}
        onOpenChange={() =>
          setDialogContentState({
            isOpen: false,
            src: null,
            alt: "",
          })
        }
      >
        <DialogContent
          className={cn(
            "w-full sm:max-w-4/5 p-0 bg-transparent border-none shadow-none overflow-hidden"
          )}
        >
          <div className="w-full flex flex-col justify-center items-center">
            <img
              src={dialogContentState.src!}
              alt={dialogContentState.alt}
              className="w-full max-h-[90vh] object-cover rounded-lg"
            />

            <p className="text-white text-center">{dialogContentState.alt}</p>
          </div>
        </DialogContent>
      </Dialog>

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
            <div className="flex gap-3 px-4 py-4 overflow-x-auto">
              {files.map((fileObj) => {
                const imageUrl = fileObj.url;
                const fileId = fileObj.id;
                const fileType = fileObj.file.type;
                const fileName = fileObj.file.name;

                return (
                  <div
                    key={fileId}
                    className="group relative shrink-0 bg-gray-100 rounded-lg overflow-visible"
                  >
                    {/* Image preview */}
                    {fileType.startsWith("image/") && (
                      <>
                        <img
                          src={imageUrl}
                          alt={fileName}
                          className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                          // onLoad={() => {
                          //   URL.revokeObjectURL(imageUrl);
                          // }}
                          onClick={() =>
                            setDialogContentState({
                              isOpen: true,
                              src: imageUrl,
                              alt: fileName,
                            })
                          }
                        />
                        <div className="absolute top-0 left-0 w-full h-full inset-shadow-[0_0_0_2px_rgba(255,255,255,0.4)] group-hover:inset-shadow-[0_0_0_2px_rgba(255,255,255,0.6)] pointer-events-none rounded-[10px]" />
                      </>
                    )}

                    {!fileType.startsWith("image/") && (
                      <div className="w-24 h-24 py-1 px-2 rounded-lg">
                        <div className="w-full h-17 text-xs break-words text-wrap truncate">
                          {fileName}
                        </div>

                        <div className="bg-gray-700 text-white text-xs font-medium px-1.5 py-0.5 rounded text-center uppercase min-w-0">
                          {fileName.split(".").pop()}
                        </div>
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => removeFile(fileId)}
                      className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 bg-white/80 hover:bg-white/40 text-gray-600 hover:text-red-700 border-[0.5px] border-gray-400 hover:border-red-400 transition-all rounded-full w-4 h-4 flex items-center justify-center cursor-pointer backdrop-blur-[1px] z-10"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 px-4 pb-2 bg-white">
            <Select
              value={difficulty}
              onValueChange={(value: Difficulty) => setDifficulty(value)}
            >
              <SelectTrigger className="w-auto border border-transparent hover:border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-0 text-sm font-medium text-gray-700 px-3 py-2 h-auto shadow-none cursor-pointer">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy" className="cursor-pointer">
                  Easy
                </SelectItem>
                <SelectItem value="medium" className="cursor-pointer">
                  Medium
                </SelectItem>
                <SelectItem value="hard" className="cursor-pointer">
                  Hard
                </SelectItem>
                <SelectItem value="extreme" className="cursor-pointer">
                  Extreme
                </SelectItem>
              </SelectContent>
            </Select>

            {/* File upload */}
            <div className="flex items-center justify-center gap-3">
              <div>
                <input
                  ref={inputRef}
                  type="file"
                  name="quiz_files"
                  id="quiz_files"
                  multiple
                  accept="image/*,.pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden -z-50"
                />
                <label htmlFor="quiz_files">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                    onClick={() => inputRef.current?.click()}
                  >
                    <Paperclip className="!size-5" />
                  </Button>
                </label>
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={isDisabled}
                className={cn(
                  "h-8 w-8 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 rounded-full p-0 cursor-pointer"
                )}
                size="icon"
              >
                <ArrowUp className="text-white !size-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
