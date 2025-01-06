// app/api/contracts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const query = `
      SELECT 
        c.*,
        sr.name as client_name,
        sr.preferred_date,
        sr.preferred_time,
        sr.street,
        sr.number,
        sr.city,
        sr.state
      FROM contracts c
      INNER JOIN service_requests sr ON sr.id = c.service_request_id
      WHERE c.id = $1
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
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      { error: "Failed to fetch contract" },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { contractData } = await request.json();

    const updateQuery = `
      UPDATE contracts 
      SET 
        client_name = $1,
        client_document = $2,
        client_address = $3,
        service_value = $4,
        payment_conditions = $5,
        has_guarantee = $6,
        requirements = $7,
        materials = $8,
        additional_notes = $9,
        pdf_content = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const values = [
      contractData.clientName,
      contractData.clientDocument,
      contractData.clientAddress,
      parseFloat(contractData.serviceValue) || 0,
      contractData.paymentConditions,
      contractData.guarantee,
      contractData.requirements,
      contractData.materials,
      contractData.note,
      contractData.pdfContent,
      params.id
    ];

    const { rows } = await client.query(updateQuery, values);

    if (rows.length === 0) {
      throw new Error('Contrato não encontrado');
    }

    await client.query('COMMIT');
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating contract:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update contract" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}