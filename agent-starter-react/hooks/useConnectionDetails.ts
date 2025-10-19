import { useMutation } from '@tanstack/react-query';
import type { AppConfig } from '@/app-config';

interface ConnectionDetailsRequest {
  agentName?: string;
  roomConfig?: {
    agents: { agent_name: string }[];
  };
  promptInstructions?: string;
}

interface ConnectionDetailsResponse {
  serverUrl: string;
  participantToken: string;
}

async function fetchConnectionDetails(
  request: ConnectionDetailsRequest,
  appConfig: AppConfig
): Promise<ConnectionDetailsResponse> {
  const url = new URL(
    process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details',
    window.location.origin
  );

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Sandbox-Id': appConfig.sandboxId ?? '',
    },
    body: JSON.stringify({
      room_config: request.roomConfig,
      prompt_instructions: request.promptInstructions,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch connection details');
  }

  return await response.json();
}

export function useConnectionDetails(appConfig: AppConfig, promptInstructions?: string) {
  return useMutation({
    mutationFn: async () => {
      const roomConfig = appConfig.agentName
        ? {
            agents: [{ agent_name: appConfig.agentName }],
          }
        : undefined;

      return fetchConnectionDetails(
        {
          agentName: appConfig.agentName,
          roomConfig,
          promptInstructions,
        },
        appConfig
      );
    },
  });
}
