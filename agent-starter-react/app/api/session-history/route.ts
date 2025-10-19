import { NextRequest, NextResponse } from 'next/server';
import { useSessionHistoryStore } from '@/lib/store/session-history-store';
import { SessionHistory, SessionHistoryResponse } from '@/lib/types/session-history';

// GET /api/session-history - Get all sessions
export async function GET(): Promise<NextResponse<SessionHistoryResponse>> {
  try {
    const sessions = useSessionHistoryStore.getState().getAll();
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching session history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session history' },
      { status: 500 }
    );
  }
}

// POST /api/session-history - Create new session history entry
export async function POST(request: NextRequest): Promise<NextResponse<SessionHistoryResponse>> {
  try {
    const body = await request.json();
    const sessionData: Omit<SessionHistory, 'id'> = {
      title: body.title,
      messages: body.messages,
      startedAt: new Date(body.startedAt),
      endedAt: new Date(body.endedAt),
      duration: body.duration,
    };

    const session = useSessionHistoryStore.getState().create(sessionData);
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error) {
    console.error('Error creating session history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session history' },
      { status: 500 }
    );
  }
}
