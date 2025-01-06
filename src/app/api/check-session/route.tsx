// app/api/auth/check-session/route.tsx
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({
        isAuthenticated: false,
        status: 'success'
      });
    }

    // Verify the token and get user data
    const userData = await verifyAuth(token);

    return NextResponse.json({
      isAuthenticated: true,
      status: 'success',
      user: userData
    });
    
  } catch (error) {
    return NextResponse.json({
      isAuthenticated: false,
      status: 'error',
      message: 'Failed to check authentication status'
    }, { status: 500 });
  }
}