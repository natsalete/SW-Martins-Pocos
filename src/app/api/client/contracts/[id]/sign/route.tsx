// api/client/contracts/sign/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { signature } = body;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert the signature
      const insertSignatureQuery = `
        INSERT INTO contract_signatures (
          contract_id,
          signature_data,
          signed_by
        ) VALUES ($1, $2, 'client')
        RETURNING *
      `;

      const { rows: [newSignature] } = await client.query(insertSignatureQuery, [
        params.id,
        signature
      ]);

      // Update contract status
      const updateContractQuery = `
        UPDATE contracts 
        SET 
          status = 'signed/client',
          signed_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const { rows: [updatedContract] } = await client.query(updateContractQuery, [
        params.id
      ]);

      // Get all signatures for this contract
      const getSignaturesQuery = `
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
      
      const { rows: signatures } = await client.query(getSignaturesQuery, [params.id]);

      await client.query('COMMIT');

      return NextResponse.json({
        ...updatedContract,
        signatures
      });
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
