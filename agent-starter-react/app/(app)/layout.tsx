'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PromptProvider } from '@/components/prompts/prompt-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PromptProvider>{children}</PromptProvider>
    </QueryClientProvider>
  );
}
