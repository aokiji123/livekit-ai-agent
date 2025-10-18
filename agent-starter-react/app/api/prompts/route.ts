import { NextRequest, NextResponse } from 'next/server';
import { promptStore } from '@/lib/store/prompt-store';
import { CreatePromptRequest, PromptResponse } from '@/lib/types/prompt';

// POST /api/prompts - Create a new prompt
export async function POST(request: NextRequest): Promise<NextResponse<PromptResponse>> {
  try {
    const body: CreatePromptRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.body) {
      return NextResponse.json(
        { success: false, error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Validate tags is an array if provided
    if (body.tags && !Array.isArray(body.tags)) {
      return NextResponse.json({ success: false, error: 'Tags must be an array' }, { status: 400 });
    }

    const prompt = promptStore.create(body);

    return NextResponse.json({ success: true, data: prompt }, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/prompts - Get all prompts
export async function GET(request: NextRequest): Promise<NextResponse<PromptResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');

    let prompts;

    if (tags) {
      // Search by tags
      const tagArray = tags.split(',').map((tag) => tag.trim());
      prompts = promptStore.searchByTags(tagArray);
    } else if (search) {
      // Search by content
      prompts = promptStore.searchByContent(search);
    } else {
      // Get all prompts
      prompts = promptStore.getAll();
    }

    return NextResponse.json({ success: true, data: prompts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
