import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password } = body;

    const validId = process.env.AUTH_ID || 'gram';
    const validPassword = process.env.AUTH_PASSWORD || '3535';

    if (id === validId && password === validPassword) {
      const cookieStore = await cookies();

      cookieStore.set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
