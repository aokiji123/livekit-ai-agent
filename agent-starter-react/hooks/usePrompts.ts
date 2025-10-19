import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreatePromptRequest,
  Prompt,
  PromptVersion,
  UpdatePromptRequest,
} from '../lib/types/prompt';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.success === false) {
    throw new Error(json.error || 'Request failed');
  }

  return json.data as T;
}

export const promptKeys = {
  all: ['prompts'] as const,
  lists: () => [...promptKeys.all, 'list'] as const,
  list: (filters: Record<string, string | string[] | undefined>) =>
    [...promptKeys.lists(), filters] as const,
  details: () => [...promptKeys.all, 'detail'] as const,
  detail: (id: string) => [...promptKeys.details(), id] as const,
  versions: (id: string) => [...promptKeys.detail(id), 'versions'] as const,
};

export function usePrompts(search?: string, tags?: string[]) {
  const filters = { search, tags };
  const queryString = new URLSearchParams();

  if (search) queryString.set('search', search);
  if (tags?.length) queryString.set('tags', tags.join(','));

  const url = `/api/prompts${queryString.toString() ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: promptKeys.list(filters),
    queryFn: () => apiFetch<Prompt[]>(url),
  });
}

export function usePrompt(id: string) {
  return useQuery({
    queryKey: promptKeys.detail(id),
    queryFn: () => apiFetch<Prompt>(`/api/prompts/${id}`),
    enabled: !!id,
  });
}

export function usePromptVersions(id: string) {
  return useQuery({
    queryKey: promptKeys.versions(id),
    queryFn: () => apiFetch<PromptVersion[]>(`/api/prompts/${id}/versions`),
    enabled: !!id,
  });
}

export function useCreatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromptRequest) =>
      apiFetch<Prompt>('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promptKeys.lists() });
    },
  });
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromptRequest }) =>
      apiFetch<Prompt>(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedPrompt) => {
      queryClient.invalidateQueries({ queryKey: promptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promptKeys.detail(updatedPrompt.id) });
      queryClient.invalidateQueries({ queryKey: promptKeys.versions(updatedPrompt.id) });
    },
  });
}

export function useDeletePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/prompts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promptKeys.lists() });
    },
  });
}
