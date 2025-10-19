import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SessionHistory } from '@/lib/types/session-history';

// Query keys
const sessionHistoryKeys = {
  all: ['session-history'] as const,
  lists: () => [...sessionHistoryKeys.all, 'list'] as const,
  details: () => [...sessionHistoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionHistoryKeys.details(), id] as const,
};

// Fetch all session history
export function useSessionHistory() {
  return useQuery({
    queryKey: sessionHistoryKeys.lists(),
    queryFn: async (): Promise<SessionHistory[]> => {
      const response = await fetch('/api/session-history');
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Convert date strings back to Date objects
      return data.data.map((session: SessionHistory) => ({
        ...session,
        startedAt: new Date(session.startedAt),
        endedAt: new Date(session.endedAt),
      }));
    },
  });
}

// Fetch single session history by ID
export function useSessionHistoryById(id: string) {
  return useQuery({
    queryKey: sessionHistoryKeys.detail(id),
    queryFn: async (): Promise<SessionHistory> => {
      const response = await fetch(`/api/session-history/${id}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Convert date strings back to Date objects
      return {
        ...data.data,
        startedAt: new Date(data.data.startedAt),
        endedAt: new Date(data.data.endedAt),
      };
    },
    enabled: !!id,
  });
}

// Create session history mutation
export function useCreateSessionHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<SessionHistory, 'id'>): Promise<SessionHistory> => {
      const response = await fetch('/api/session-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      // Convert date strings back to Date objects
      return {
        ...result.data,
        startedAt: new Date(result.data.startedAt),
        endedAt: new Date(result.data.endedAt),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionHistoryKeys.lists() });
    },
  });
}

// Delete session history mutation
export function useDeleteSessionHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/session-history/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionHistoryKeys.lists() });
    },
  });
}
