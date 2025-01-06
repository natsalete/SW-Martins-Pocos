// app/api/contracts/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { status } = await request.json();

    const updateQuery = `
      UPDATE contracts 
      SET 
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const { rows } = await client.query(updateQuery, [status, params.id]);

    if (rows.length === 0) {
      throw new Error('Contract not found');
    }

    await client.query('COMMIT');
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating contract status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update contract status" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

