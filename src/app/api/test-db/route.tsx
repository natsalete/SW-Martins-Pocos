// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/index';

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW()');
    return NextResponse.json({ 
      status: 'success',
      timestamp: result.rows[0].now,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to connect to database'
    }, { status: 500 });
  }
}