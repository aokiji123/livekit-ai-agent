import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

type AuthStatusResponse = { isAuthenticated: boolean };
type AuthResponse = { success: boolean; message: string };

const AUTH_QUERY_KEY = ['auth', 'status'] as const;

const fetchAuthStatus = async (): Promise<AuthStatusResponse> => {
  const res = await fetch('/api/auth/status');
  if (res.status === 401) return { isAuthenticated: false };
  if (!res.ok) throw new Error('Failed to fetch auth status');
  return res.json();
};

const devLogin = () => apiFetch<AuthResponse>('/api/auth/dev-login', { method: 'POST' });
const logout = () => apiFetch<AuthResponse>('/api/auth/logout', { method: 'POST' });

export function useAuthStatus() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchAuthStatus,
    staleTime: 60_000, // cache for 1 minute
  });
}

function useAuthMutation(mutationFn: () => Promise<AuthResponse>, optimisticValue: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: AUTH_QUERY_KEY });
      const previousAuth = queryClient.getQueryData<AuthStatusResponse>(AUTH_QUERY_KEY);
      queryClient.setQueryData<AuthStatusResponse>(AUTH_QUERY_KEY, {
        isAuthenticated: optimisticValue,
      });
      return { previousAuth };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousAuth) queryClient.setQueryData(AUTH_QUERY_KEY, context.previousAuth);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}

export const useDevLogin = () => useAuthMutation(devLogin, true);
export const useLogout = () => useAuthMutation(logout, false);
