import { NextRequest, NextResponse } from 'next/server';
import { usePromptStore } from '@/lib/store/prompt-store';
import { PromptResponse, UpdatePromptRequest } from '@/lib/types/prompt';

// GET /api/prompts/[id] - Get a specific prompt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PromptResponse>> {
  try {
    const { id } = await params;

    const prompt = usePromptStore.getState().getById(id);

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: prompt }, { status: 200 });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/prompts/[id] - Update a specific prompt
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PromptResponse>> {
  try {
    const { id } = await params;
    const body: UpdatePromptRequest = await request.json();

    if (!body.title && !body.body && !body.tags) {
      return NextResponse.json(
        { success: false, error: 'At least one field (title, body, or tags) must be provided' },
        { status: 400 }
      );
    }

    if (body.tags && !Array.isArray(body.tags)) {
      return NextResponse.json({ success: false, error: 'Tags must be an array' }, { status: 400 });
    }

    const updatedPrompt = usePromptStore.getState().update(id, body);

    if (!updatedPrompt) {
      return NextResponse.json({ success: false, error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedPrompt }, { status: 200 });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/prompts/[id] - Delete a specific prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PromptResponse>> {
  try {
    const { id } = await params;

    const deleted = usePromptStore.getState().delete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
