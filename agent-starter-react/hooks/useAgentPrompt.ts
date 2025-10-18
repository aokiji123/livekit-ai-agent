import { usePromptContext } from '../components/prompts/prompt-context';

export function useAgentPrompt() {
  const { selectedPrompt } = usePromptContext();

  const getAgentInstructions = () => {
    // Return undefined if no prompt selected - will use agent's default behavior
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
