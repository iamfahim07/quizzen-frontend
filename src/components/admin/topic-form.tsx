import { useRef, useState } from "react";

import { useCreateTopic } from "@/api/admin/use-create-topic";
import { useUpdateTopic } from "@/api/admin/use-update-topic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { SpinnerLoader } from "@/components/loader";

import type { TopicMutation, TopicResponse } from "@/types";

interface TopicFormProps {
  topic: TopicMutation | TopicResponse | null;
  onCancel: () => void;
  setIsTopicDialogOpen: (b: boolean) => void;
}

export default function TopicForm({
  topic,
  onCancel,
  setIsTopicDialogOpen,
}: TopicFormProps) {
  const [title, setTitle] = useState(topic?.title || "");
  const [description, setDescription] = useState(topic?.description || "");
  const [files, setFiles] = useState<File[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const { isPending: isCreatePending, mutate: createTopic } = useCreateTopic(
    () => setIsTopicDialogOpen(false)
  );
  const { isPending: isUpdatePending, mutate: updateTopic } = useUpdateTopic(
    () => setIsTopicDialogOpen(false)
  );

  const isPending = isCreatePending || isUpdatePending;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    setFiles(selectedFiles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    if (topic) {
      updateTopic({
        id: topic._id,
        title: title.trim(),
        description: description.trim(),
        files,
      });
    } else {
      createTopic({
        title: title.trim(),
        description: description.trim(),
        files,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter topic title"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter topic description"
          rows={3}
          required
          disabled={isPending}
        />
      </div>

      {/* File upload */}
      <div className="w-full relative flex justify-center items-center border border-gray-200 rounded-md">
        <div className="w-[calc(100%_-_100px)] flex items-center -z-50">
          {files.length > 0 &&
            files.map((file, index) => (
              <div
                key={index}
                className="absolute w-[calc(100%_-_100px)] py-1 px-3 truncate"
              >
                {file.name}
              </div>
            ))}
        </div>

        <div className="w-[100px]">
          <input
            ref={inputRef}
            type="file"
            name="topic_image"
            id="topic_image"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full absolute left-0 opacity-0 -z-50 pointer-events-none"
            required={!topic}
            disabled={isPending}
          />
          <label htmlFor="topic_image">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-white bg-[#13AF88] hover:text-white hover:bg-teal-500 cursor-pointer"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
            >
              Img (3mb)
            </Button>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-violet-600 hover:bg-violet-500"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center justify-center">
              <SpinnerLoader className="mr-2 text-white" /> Processing...
            </span>
          ) : topic ? (
            "Update Topic"
          ) : (
            "Create Topic"
          )}
        </Button>
      </div>
    </form>
  );
}
