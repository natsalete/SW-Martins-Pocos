// app/api/requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db/index';

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT * FROM service_requests 
      ORDER BY submitted_at DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service requests' },
      { status: 500 }
    );
  }
}