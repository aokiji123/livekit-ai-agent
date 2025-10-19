import { NextRequest, NextResponse } from 'next/server';
import { useSessionHistoryStore } from '@/lib/store/session-history-store';
import { SessionHistoryResponse } from '@/lib/types/session-history';

// GET /api/session-history/[id] - Get specific session by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SessionHistoryResponse>> {
  try {
    const { id } = await params;
    const session = useSessionHistoryStore.getState().getById(id);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch session' }, { status: 500 });
  }
}

// DELETE /api/session-history/[id] - Delete specific session
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SessionHistoryResponse>> {
  try {
    const { id } = await params;
    const deleted = useSessionHistoryStore.getState().delete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
