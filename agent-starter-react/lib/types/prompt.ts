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
