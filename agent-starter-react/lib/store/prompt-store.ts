import { create } from 'zustand';
import { CreatePromptRequest, Prompt, PromptVersion, UpdatePromptRequest } from '../types/prompt';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

type PromptStore = {
  prompts: Map<string, Prompt>;
  versions: Map<string, PromptVersion[]>;

  create: (data: CreatePromptRequest) => Prompt;
  getAll: () => Prompt[];
  getById: (id: string) => Prompt | undefined;
  update: (id: string, data: UpdatePromptRequest) => Prompt | undefined;
  delete: (id: string) => boolean;
  getVersions: (promptId: string) => PromptVersion[];
  searchByTags: (tags: string[]) => Prompt[];
  searchByContent: (query: string) => Prompt[];
};

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: new Map(),
  versions: new Map(),

  create: (data: CreatePromptRequest): Prompt => {
    const id = generateId();
    const now = new Date();

    const prompt: Prompt = {
      id,
      title: data.title,
      body: data.body,
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    const initialVersion: PromptVersion = {
      id: generateId(),
      promptId: id,
      version: 1,
      title: data.title,
      body: data.body,
      tags: data.tags || [],
      createdAt: now,
    };

    set((state) => {
      const newPrompts = new Map(state.prompts);
      const newVersions = new Map(state.versions);

      newPrompts.set(id, prompt);
      newVersions.set(id, [initialVersion]);

      return { prompts: newPrompts, versions: newVersions };
    });

    return prompt;
  },

  getAll: (): Prompt[] => {
    const { prompts } = get();
    return Array.from(prompts.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  },

  getById: (id: string): Prompt | undefined => {
    const { prompts } = get();
    return prompts.get(id);
  },

  update: (id: string, data: UpdatePromptRequest): Prompt | undefined => {
    const { prompts, versions } = get();
    const existingPrompt = prompts.get(id);

    if (!existingPrompt) {
      return undefined;
    }

    const now = new Date();
    const newVersion = existingPrompt.version + 1;

    const updatedPrompt: Prompt = {
      ...existingPrompt,
      title: data.title ?? existingPrompt.title,
      body: data.body ?? existingPrompt.body,
      tags: data.tags ?? existingPrompt.tags,
      updatedAt: now,
      version: newVersion,
    };

    const newVersionEntry: PromptVersion = {
      id: generateId(),
      promptId: id,
      version: newVersion,
      title: updatedPrompt.title,
      body: updatedPrompt.body,
      tags: updatedPrompt.tags,
      createdAt: now,
    };

    set(() => {
      const newPrompts = new Map(prompts);
      const newVersions = new Map(versions);

      newPrompts.set(id, updatedPrompt);

      const existingVersions = versions.get(id) || [];
      newVersions.set(id, [...existingVersions, newVersionEntry]);

      return { prompts: newPrompts, versions: newVersions };
    });

    return updatedPrompt;
  },

  delete: (id: string): boolean => {
    const { prompts, versions } = get();
    const exists = prompts.has(id);

    if (exists) {
      set(() => {
        const newPrompts = new Map(prompts);
        const newVersions = new Map(versions);

        newPrompts.delete(id);
        newVersions.delete(id);

        return { prompts: newPrompts, versions: newVersions };
      });
    }

    return exists;
  },

  getVersions: (promptId: string): PromptVersion[] => {
    const { versions } = get();
    return versions.get(promptId) || [];
  },

  searchByTags: (tags: string[]): Prompt[] => {
    const allPrompts = get().getAll();
    return allPrompts.filter((prompt) => tags.some((tag) => prompt.tags.includes(tag)));
  },

  searchByContent: (query: string): Prompt[] => {
    const lowercaseQuery = query.toLowerCase();
    const allPrompts = get().getAll();
    return allPrompts.filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(lowercaseQuery) ||
        prompt.body.toLowerCase().includes(lowercaseQuery)
    );
  },
}));
