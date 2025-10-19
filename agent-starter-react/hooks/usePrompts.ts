import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreatePromptRequest,
  Prompt,
  PromptVersion,
  UpdatePromptRequest,
} from '../lib/types/prompt';

// Query keys
const promptKeys = {
  all: ['prompts'] as const,
  lists: () => [...promptKeys.all, 'list'] as const,
  list: (filters: string) => [...promptKeys.lists(), { filters }] as const,
  details: () => [...promptKeys.all, 'detail'] as const,
  detail: (id: string) => [...promptKeys.details(), id] as const,
  versions: (id: string) => [...promptKeys.detail(id), 'versions'] as const,
};

// Fetch all prompts with optional search/filter
export function usePrompts(search?: string, tags?: string[]) {
  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);
  if (tags?.length) queryParams.set('tags', tags.join(','));

  return useQuery({
    queryKey: promptKeys.list(queryParams.toString()),
    queryFn: async (): Promise<Prompt[]> => {
      const url = `/api/prompts${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
  });
}

// Fetch single prompt
export function usePrompt(id: string) {
  return useQuery({
    queryKey: promptKeys.detail(id),
    queryFn: async (): Promise<Prompt> => {
      const response = await fetch(`/api/prompts/${id}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    enabled: !!id,
  });
}

// Fetch prompt versions
export function usePromptVersions(id: string) {
  return useQuery({
    queryKey: promptKeys.versions(id),
    queryFn: async (): Promise<PromptVersion[]> => {
      const response = await fetch(`/api/prompts/${id}/versions`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    enabled: !!id,
  });
}

// Create prompt mutation
export function useCreatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePromptRequest): Promise<Prompt> => {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promptKeys.lists() });
    },
  });
}

// Update prompt mutation
export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePromptRequest;
    }): Promise<Prompt> => {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: promptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promptKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: promptKeys.versions(data.id) });
    },
  });
}

// Delete prompt mutation
export function useDeletePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promptKeys.lists() });
    },
  });
}
