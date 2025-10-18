import { CreatePromptRequest, Prompt, PromptVersion, UpdatePromptRequest } from '../types/prompt';

class PromptStore {
  private prompts: Map<string, Prompt> = new Map();
  private versions: Map<string, PromptVersion[]> = new Map();

  // Generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Create a new prompt
  create(data: CreatePromptRequest): Prompt {
    const id = this.generateId();
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

    this.prompts.set(id, prompt);

    // Create initial version
    const initialVersion: PromptVersion = {
      id: this.generateId(),
      promptId: id,
      version: 1,
      title: data.title,
      body: data.body,
      tags: data.tags || [],
      createdAt: now,
    };

    this.versions.set(id, [initialVersion]);

    return prompt;
  }

  // Get all prompts
  getAll(): Prompt[] {
    return Array.from(this.prompts.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  // Get prompt by ID
  getById(id: string): Prompt | undefined {
    return this.prompts.get(id);
  }

  // Update a prompt (creates new version)
  update(id: string, data: UpdatePromptRequest): Prompt | undefined {
    const existingPrompt = this.prompts.get(id);
    if (!existingPrompt) {
      return undefined;
    }

    const now = new Date();
    const newVersion = existingPrompt.version + 1;

    // Create updated prompt
    const updatedPrompt: Prompt = {
      ...existingPrompt,
      title: data.title ?? existingPrompt.title,
      body: data.body ?? existingPrompt.body,
      tags: data.tags ?? existingPrompt.tags,
      updatedAt: now,
      version: newVersion,
    };

    this.prompts.set(id, updatedPrompt);

    // Create new version entry
    const newVersionEntry: PromptVersion = {
      id: this.generateId(),
      promptId: id,
      version: newVersion,
      title: updatedPrompt.title,
      body: updatedPrompt.body,
      tags: updatedPrompt.tags,
      createdAt: now,
    };

    // Append to versions (append-only)
    const existingVersions = this.versions.get(id) || [];
    this.versions.set(id, [...existingVersions, newVersionEntry]);

    return updatedPrompt;
  }

  // Delete a prompt
  delete(id: string): boolean {
    const exists = this.prompts.has(id);
    if (exists) {
      this.prompts.delete(id);
      this.versions.delete(id);
    }
    return exists;
  }

  // Get version history for a prompt
  getVersions(promptId: string): PromptVersion[] {
    return this.versions.get(promptId) || [];
  }

  // Search prompts by tags
  searchByTags(tags: string[]): Prompt[] {
    return this.getAll().filter((prompt) => tags.some((tag) => prompt.tags.includes(tag)));
  }

  // Search prompts by title or body content
  searchByContent(query: string): Prompt[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAll().filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(lowercaseQuery) ||
        prompt.body.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Export singleton instance
export const promptStore = new PromptStore();
