import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/jfif",
];

const createTopicFormSchema = (isEditing: boolean = false) =>
  z.object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(40, "Title must be less than 40 characters"),
    description: z
      .string()
      .trim()
      .min(2, "Description must be at least 2 characters")
      .max(200, "Description must be less than 200 characters"),
    files: isEditing
      ? z
          .array(z.instanceof(File))
          .optional()
          .refine(
            (files) => !files || files.length === 0 || files.length === 1,
            { message: "Please select exactly one file or none." }
          )
          .refine(
            (files) =>
              !files || files.length === 0 || files[0]?.size <= MAX_FILE_SIZE,
            `Max image size is 3MB.`
          )
          .refine(
            (files) =>
              !files ||
              files.length === 0 ||
              ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
            "Only .jpg, .jpeg, .png .webp and .jfif formats are supported."
          )
      : z
          .array(z.instanceof(File))
          .min(1, "Please select an image.")
          .refine((files) => files.length === 1, {
            message: "Please select exactly one file.",
          })
          .refine(
            (files) => files?.[0]?.size <= MAX_FILE_SIZE,
            `Max image size is 3MB.`
          )
          .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            "Only .jpg, .jpeg, .png .webp and .jfif formats are supported."
          ),
  });

export default function TopicForm({
  topic,
  onCancel,
  setIsTopicDialogOpen,
}: TopicFormProps) {
  const isEditing = !!topic;
  const topicFormSchema = createTopicFormSchema(isEditing);
  type TopicFormData = z.infer<typeof topicFormSchema>;

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<TopicFormData>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      title: topic?.title || "",
      description: topic?.description || "",
      files: [],
    },
  });
  const files: File[] = watch("files") || [];

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

    setValue("files", selectedFiles, { shouldValidate: true });
  };

  const onSubmit = (data: TopicFormData) => {
    if (topic) {
      updateTopic({
        id: topic._id,
        title: data.title,
        description: data.description,
        files: data.files,
      });
    } else {
      createTopic({
        title: data.title,
        description: data.description,
        files: data.files,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          {...register("title")}
          type="text"
          id="title"
          placeholder="Enter topic title"
          disabled={isPending}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          {...register("description")}
          id="description"
          placeholder="Enter topic description"
          rows={3}
          disabled={isPending}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* File upload */}
      <div>
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
              name="files"
              id="topic_image"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden -z-50"
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
        {errors.files && (
          <p className="mt-1 text-sm text-red-600">{errors.files.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-violet-600 hover:bg-violet-500 cursor-pointer"
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
