// src/app/api/client/contracts/[id]/sign/route.tsx
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/index';
import { verifyAuth } from '../../auth/route';
import { UserData } from '../../../types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { signature } = await request.json();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const insertSignatureQuery = `
        INSERT INTO contract_signatures (
          contract_id,
          signature_data,
          signed_by
        ) VALUES ($1, $2, 'client')
        RETURNING *
      `;

      await client.query(insertSignatureQuery, [params.id, signature]);

      const updateContractQuery = `
        UPDATE contracts 
        SET 
          status = 'signed/client',
          signed_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const { rows } = await client.query(updateContractQuery, [params.id]);

      const getSignaturesQuery = `
        SELECT id, signed_by, signature_data, signed_at
        FROM contract_signatures 
        WHERE contract_id = $1
        ORDER BY signed_at DESC
      `;
      
      const { rows: signatures } = await client.query(getSignaturesQuery, [params.id]);

      await client.query('COMMIT');

      return NextResponse.json({
        ...rows[0],
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

export async function GET(request: Request) {
    try {
      // Verificar autenticação
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    let userData: UserData;
    try {
      userData = await verifyAuth(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  
      const query = `
        SELECT 
        c.*,
        sr.name,
        sr.whatsapp,
        sr.email,
        sr.street,
        sr.number,
        sr.city,
        sr.state,
        sr.preferred_date,
        sr.preferred_time,
        COALESCE(
            json_agg(
            DISTINCT jsonb_build_object(
                'id', cs.id,
                'signed_by', cs.signed_by,
                'signed_at', cs.signed_at,
                'signature_data', cs.signature_data
            )
            ) FILTER (WHERE cs.id IS NOT NULL),
            '[]'
        ) as signatures
        FROM contracts c
        INNER JOIN service_requests sr ON sr.id = c.service_request_id
        LEFT JOIN contract_signatures cs ON c.id = cs.contract_id
        WHERE sr.whatsapp = $1 OR sr.user_id = $2
        GROUP BY c.id, sr.id
        ORDER BY c.created_at DESC;
      `;
  
      const result = await pool.query(query, [userData.whatsapp.replace(/\D/g, ''), userData.id]);
      return NextResponse.json(result.rows);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
  }