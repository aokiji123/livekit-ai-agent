import { NextRequest, NextResponse } from 'next/server';
import { promptStore } from '@/lib/store/prompt-store';
import { PromptVersionResponse } from '@/lib/types/prompt';

// GET /api/prompts/[id]/versions - Get version history for a prompt
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<PromptVersionResponse>> {
  try {
    const { id } = params;

    // Check if prompt exists
    const prompt = promptStore.getById(id);
    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt not found' }, { status: 404 });
    }

    const versions = promptStore.getVersions(id);

    return NextResponse.json({ success: true, data: versions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching prompt versions:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
