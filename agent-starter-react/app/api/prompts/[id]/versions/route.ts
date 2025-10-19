import { NextRequest, NextResponse } from 'next/server';
import { usePromptStore } from '@/lib/store/prompt-store';
import { PromptVersionResponse } from '@/lib/types/prompt';

// GET /api/prompts/[id]/versions - Get version history for a prompt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PromptVersionResponse>> {
  try {
    const { id } = await params;

    const prompt = usePromptStore.getState().getById(id);
    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt not found' }, { status: 404 });
    }

    const versions = usePromptStore.getState().getVersions(id);

    return NextResponse.json({ success: true, data: versions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching prompt versions:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
