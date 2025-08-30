import { z } from "zod";

export const FieldPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  pdfPageNo: z.number(),
});

export const SelectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const FormFieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Field name is required"),
  type: z.enum([
    "input",
    "textarea",
    "select",
    "date",
    "number",
    "email",
    "file",
    "checkbox",
    "radio",
  ]),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  options: z.array(SelectOptionSchema).optional(),
  position: FieldPositionSchema.optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
});

export const FormSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  pdfUrl: z.string().url(),
  fields: z.array(z.any()),
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});