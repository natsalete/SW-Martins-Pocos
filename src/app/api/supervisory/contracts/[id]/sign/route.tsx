//api/supervisory/contracts/sign/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { signature, signedBy } = body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Inserir a assinatura
      const insertSignatureQuery = `
        INSERT INTO contract_signatures (
          contract_id,
          signature_data,
          signed_by
        ) VALUES ($1, $2, $3)
        RETURNING *
      `;

      await client.query(insertSignatureQuery, [
        params.id,
        signature,
        signedBy
      ]);

      // Verificar se ambas as assinaturas existem
      const checkSignaturesQuery = `
        SELECT signed_by 
        FROM contract_signatures 
        WHERE contract_id = $1
      `;
      
      const { rows: signatures } = await client.query(checkSignaturesQuery, [params.id]);
      
      // Determinar o novo status com base nas assinaturas existentes
      let newStatus = 'pending';
      if (signatures.length === 2) {
        newStatus = 'completed';
      } else if (signatures.some(sig => sig.signed_by === 'supervisor')) {
        newStatus = 'signed/supervisor';
      } else if (signatures.some(sig => sig.signed_by === 'client')) {
        newStatus = 'signed/client';
      }

      // Atualizar o contrato
      const updateContractQuery = `
        UPDATE contracts 
        SET 
          status = $1,
          signed_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      
      const { rows } = await client.query(updateContractQuery, [
        newStatus,
        params.id
      ]);

      await client.query('COMMIT');

      // Adicionar as assinaturas ao resultado
      const contract = rows[0];
      contract.signatures = signatures;

      return NextResponse.json(contract);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error signing contract:', error);
    return NextResponse.json(
      { error: "Failed to sign contract" },
      { status: 500 }
    );
  }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const client = await pool.connect();
      try {
        // Certifique-se de selecionar signature_data
        const query = `
          SELECT 
            id,
            contract_id,
            signature_data,
            signed_by,
            signed_at
          FROM contract_signatures 
          WHERE contract_id = $1
          ORDER BY signed_at DESC
        `;
        
        const { rows } = await client.query(query, [params.id]);
        return NextResponse.json(rows);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching signatures:', error);
      return NextResponse.json(
        { error: "Failed to fetch signatures" },
        { status: 500 }
      );
    }
  }

