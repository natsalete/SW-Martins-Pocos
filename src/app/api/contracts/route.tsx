// app/api/contracts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { contract, contractData } = await request.json();
    
    // Validate required fields
    if (!contract.serviceRequestId || !contractData.clientName) {
      throw new Error('Dados do contrato incompletos');
    }

    // Generate contract number
    const contractNumberResult = await client.query(
      "SELECT nextval('contract_number_seq')"
    );
    const sequenceNumber = contractNumberResult.rows[0].nextval;
    const contractNumber = `CTR-${new Date().getFullYear()}${String(sequenceNumber).padStart(4, '0')}`;

    // Insert contract
    const insertQuery = `
      INSERT INTO contracts (
        service_request_id,
        client_name,
        client_document,
        client_address,
        service_value,
        payment_conditions,
        has_guarantee,
        requirements,
        materials,
        additional_notes,
        contract_number,
        status,
        pdf_content,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      contract.serviceRequestId,
      contractData.clientName,
      contractData.clientDocument,
      contractData.clientAddress,
      parseFloat(contractData.serviceValue) || 0,
      contractData.paymentConditions,
      contractData.guarantee,
      contractData.requirements,
      contractData.materials,
      contractData.note,
      contractNumber,
      'generated',
      contractData.pdfContent
    ];

    const { rows: [savedContract] } = await client.query(insertQuery, values);

    await client.query('COMMIT');
    
    return NextResponse.json({
      message: "Contrato salvo com sucesso",
      contract: savedContract,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erro ao salvar contrato:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao salvar contrato" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}