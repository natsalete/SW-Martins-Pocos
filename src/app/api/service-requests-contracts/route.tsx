// app/api/service-requests-contracts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = `
      SELECT 
        sr.*,
        COALESCE(c.id, NULL) as contract_id,
        COALESCE(c.status, 'pending') as contract_status,
        COALESCE(c.pdf_content, NULL) as contract_pdf
      FROM service_requests sr
      LEFT JOIN contracts c ON c.service_request_id = sr.id
      WHERE sr.status = 'concluido'
    `;
    
    const params: any[] = [];

    if (status && status !== 'todos') {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }

    if (startDate && endDate) {
      params.push(startDate, endDate);
      query += ` AND sr.preferred_date BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    query += ` ORDER BY sr.submitted_at DESC`;

    const { rows } = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { error: "Failed to fetch service requests" },
      { status: 500 }
    );
  }
}