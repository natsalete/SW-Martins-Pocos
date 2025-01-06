// app/api/supervisory/contracts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT 
        sr.*,
        c.id as contract_id,
        c.status as contract_status,
        c.contract_number,
        c.pdf_content as contract_pdf
      FROM service_requests sr
      INNER JOIN contracts c ON c.service_request_id = sr.id
      ORDER BY c.created_at DESC
    `;

    const { rows } = await pool.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

