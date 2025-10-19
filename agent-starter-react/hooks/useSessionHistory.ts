import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SessionHistory } from '@/lib/types/session-history';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error ?? 'Unknown API error');
  }

  return json.data as T;
}

function parseSessionDates<T extends SessionHistory | SessionHistory[]>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((session) => ({
      ...session,
      startedAt: new Date(session.startedAt),
      endedAt: new Date(session.endedAt),
    })) as T;
  }

  return {
    ...data,
    startedAt: new Date(data.startedAt),
    endedAt: new Date(data.endedAt),
  } as T;
}

export const sessionHistoryKeys = {
  all: ['session-history'] as const,
  lists: () => [...sessionHistoryKeys.all, 'list'] as const,
  details: () => [...sessionHistoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionHistoryKeys.details(), id] as const,
};

export function useSessionHistory() {
  return useQuery({
    queryKey: sessionHistoryKeys.lists(),
    queryFn: async (): Promise<SessionHistory[]> => {
      const data = await apiFetch<SessionHistory[]>('/api/session-history');
      return parseSessionDates(data);
    },
  });
}

export function useSessionHistoryById(id: string) {
  return useQuery({
    queryKey: sessionHistoryKeys.detail(id),
    queryFn: async (): Promise<SessionHistory> => {
      const data = await apiFetch<SessionHistory>(`/api/session-history/${id}`);
      return parseSessionDates(data);
    },
    enabled: !!id,
  });
}

export function useCreateSessionHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<SessionHistory, 'id'>): Promise<SessionHistory> => {
      const created = await apiFetch<SessionHistory>('/api/session-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return parseSessionDates(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionHistoryKeys.lists() });
    },
  });
}

export function useDeleteSessionHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiFetch<void>(`/api/session-history/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionHistoryKeys.lists() });
    },
  });
}
