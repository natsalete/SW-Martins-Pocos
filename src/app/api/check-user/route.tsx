// src/app/api/check-user/route.tsx
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/index';

export async function POST(request: Request) {
  try {
    const { whatsapp } = await request.json();
    
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE whatsapp = $1)',
      [whatsapp]
    );
    
    return NextResponse.json({ exists: result.rows[0].exists });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}