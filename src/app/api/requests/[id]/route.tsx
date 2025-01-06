// app/api/requests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db/index';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    
    const result = await pool.query(
      `UPDATE service_requests 
       SET status = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2
       RETURNING *`,
      [status, params.id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

