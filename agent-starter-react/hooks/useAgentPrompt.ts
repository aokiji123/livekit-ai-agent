import { usePromptContext } from '../components/prompts/prompt-context';

export function useAgentPrompt() {
  const { selectedPrompt } = usePromptContext();

  const getAgentInstructions = () => {
    if (!selectedPrompt) {
      return undefined;
    }

    return selectedPrompt.body;
  };

  return {
    selectedPrompt,
    agentInstructions: getAgentInstructions(),
    hasPrompt: !!selectedPrompt,
  };
}
