// app/api/supervisory/contracts/[id]/approve/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const query = `
      UPDATE contracts 
      SET status = 'approved'
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await pool.query(query, [params.id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error approving contract:', error);
    return NextResponse.json(
      { error: "Failed to approve contract" },
      { status: 500 }
    );
  }
}
