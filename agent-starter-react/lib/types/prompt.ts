// Zod schemas for form validation
import { z } from 'zod';

export type Prompt = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type PromptVersion = {
  id: string;
  promptId: string;
  version: number;
  title: string;
  body: string;
  tags: string[];
  createdAt: Date;
};

export type CreatePromptRequest = {
  title: string;
  body: string;
  tags: string[];
};

export type UpdatePromptRequest = {
  title?: string;
  body?: string;
  tags?: string[];
};

export type PromptResponse = {
  success: boolean;
  data?: Prompt | Prompt[];
  error?: string;
};

export type PromptVersionResponse = {
  success: boolean;
  data?: PromptVersion[];
  error?: string;
};

export const promptFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  body: z.string().min(1, 'Body is required').max(5000, 'Body must be less than 5000 characters'),
  tags: z.array(z.string().min(1, 'Tag cannot be empty')).max(10, 'Maximum 10 tags allowed'),
});

export type PromptFormData = z.infer<typeof promptFormSchema>;
