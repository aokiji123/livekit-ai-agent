import { NextRequest, NextResponse } from 'next/server';
import { promptStore } from '@/lib/store/prompt-store';
import { PromptResponse, UpdatePromptRequest } from '@/lib/types/prompt';

// GET /api/prompts/[id] - Get a specific prompt
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<PromptResponse>> {
  try {
    const { id } = params;

    const prompt = promptStore.getById(id);

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
  { params }: { params: { id: string } }
): Promise<NextResponse<PromptResponse>> {
  try {
    const { id } = params;
    const body: UpdatePromptRequest = await request.json();

    // Validate that at least one field is provided
    if (!body.title && !body.body && !body.tags) {
      return NextResponse.json(
        { success: false, error: 'At least one field (title, body, or tags) must be provided' },
        { status: 400 }
      );
    }

    // Validate tags is an array if provided
    if (body.tags && !Array.isArray(body.tags)) {
      return NextResponse.json({ success: false, error: 'Tags must be an array' }, { status: 400 });
    }

    const updatedPrompt = promptStore.update(id, body);

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
  { params }: { params: { id: string } }
): Promise<NextResponse<PromptResponse>> {
  try {
    const { id } = params;

    const deleted = promptStore.delete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
