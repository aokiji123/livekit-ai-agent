import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type AuthStatusResponse = {
  isAuthenticated: boolean;
};

type AuthResponse = {
  success: boolean;
  message: string;
};

const AUTH_QUERY_KEY = ['auth', 'status'] as const;

async function fetchAuthStatus(): Promise<AuthStatusResponse> {
  const response = await fetch('/api/auth/status');
  if (!response.ok) {
    throw new Error('Failed to fetch auth status');
  }
  return response.json();
}

async function devLogin(): Promise<AuthResponse> {
  const response = await fetch('/api/auth/dev-login', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Login failed');
  }
  return response.json();
}

async function logout(): Promise<AuthResponse> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  return response.json();
}

export function useAuthStatus() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchAuthStatus,
  });
}

export function useDevLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: devLogin,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: AUTH_QUERY_KEY });

      const previousAuth = queryClient.getQueryData<AuthStatusResponse>(AUTH_QUERY_KEY);

      queryClient.setQueryData<AuthStatusResponse>(AUTH_QUERY_KEY, {
        isAuthenticated: true,
      });

      return { previousAuth };
    },
    onError: (error, _, context) => {
      if (context?.previousAuth) {
        queryClient.setQueryData(AUTH_QUERY_KEY, context.previousAuth);
      }
      console.error('useDevLogin error', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: AUTH_QUERY_KEY });

      const previousAuth = queryClient.getQueryData<AuthStatusResponse>(AUTH_QUERY_KEY);

      queryClient.setQueryData<AuthStatusResponse>(AUTH_QUERY_KEY, {
        isAuthenticated: false,
      });

      return { previousAuth };
    },
    onError: (error, _, context) => {
      if (context?.previousAuth) {
        queryClient.setQueryData(AUTH_QUERY_KEY, context.previousAuth);
      }
      console.error('useLogout error', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}
