import { z } from "zod";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/jfif",
];

export const createTopicFormSchema = (isEditing: boolean = false) =>
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
