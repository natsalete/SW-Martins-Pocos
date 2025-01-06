// app/api/requests/[id]/reschedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db/index';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { preferred_date, preferred_time, status } = await request.json();
    
    const result = await pool.query(
      `UPDATE service_requests 
       SET preferred_date = $1,
           preferred_time = $2,
           status = $3,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4
       RETURNING *`,
      [preferred_date, preferred_time, status, params.id]
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
      { error: 'Failed to reschedule request' },
      { status: 500 }
    );
  }
}
