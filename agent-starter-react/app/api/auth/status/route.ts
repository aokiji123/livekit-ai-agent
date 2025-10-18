import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('dev-session');

  return NextResponse.json({
    isAuthenticated: !!session?.value,
  });
}
