// src/app/api/service-requests/route.tsx
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/index';
import { verifyAuth } from '../auth/route';
import { UserData } from '../../types';


// Define os tipos permitidos de terreno conforme ENUM do banco
type TerrainType = 'plano' | 'inclinado' | 'rochoso';

// Helper function to format WhatsApp number
function formatWhatsAppNumber(whatsapp: string): string {
  return whatsapp.replace(/\D/g, '');
}

// Helper para validar o tipo de terreno
function validateTerrainType(terrainType: string): TerrainType {
  const validTypes = ['plano', 'inclinado', 'rochoso'];
  if (!validTypes.includes(terrainType)) {
    throw new Error('Tipo de terreno inválido');
  }
  return terrainType as TerrainType;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Dados recebidos:', data);

     // Tenta obter o token e user_id se existir
     const token = request.headers.get('authorization')?.split(' ')[1];
     let userId = null;

     if (token) {
      const userData = await verifyAuth(token);
      userId = userData?.id;
    }

    // Valida e formata os dados
    const formattedData = {
      user_id: userId, // Pode ser null
      name: data.name.trim(),
      whatsapp: formatWhatsAppNumber(data.whatsapp),
      email: data.email?.trim() || null,
      cep: data.cep.replace(/\D/g, ''),
      street: data.street.trim(),
      number: data.number.toString(),
      neighborhood: data.neighborhood.trim(),
      city: data.city.trim(),
      state: data.state.trim().toUpperCase(),
      terrain_type: validateTerrainType(data.terrainType),
      has_water_network: Boolean(data.hasWaterNetwork),
      description: data.description?.trim() || null,
      preferred_date: new Date(data.preferredDate).toISOString().split('T')[0],
      preferred_time: data.preferredTime,
      status: 'pendente'
    };

    console.log('Dados formatados:', formattedData);

    // Validações adicionais
    if (formattedData.state.length !== 2) {
      throw new Error('Estado deve ter 2 caracteres');
    }

    if (formattedData.whatsapp.length < 10) {
      throw new Error('Número de WhatsApp inválido');
    }

    const query = `
      INSERT INTO service_requests 
      (user_id, name, whatsapp, email, cep, street, number, neighborhood, 
       city, state, terrain_type, has_water_network, description, 
       preferred_date, preferred_time, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::terrain_type, $12, $13, $14::date, $15::time, $16::request_status)
      RETURNING *
    `;

    const values = [
      formattedData.user_id,
      formattedData.name,
      formattedData.whatsapp,
      formattedData.email,
      formattedData.cep,
      formattedData.street,
      formattedData.number,
      formattedData.neighborhood,
      formattedData.city,
      formattedData.state,
      formattedData.terrain_type,
      formattedData.has_water_network,
      formattedData.description,
      formattedData.preferred_date,
      formattedData.preferred_time,
      formattedData.status
    ];

    console.log('Executando query com valores:', values);

    const result = await pool.query(query, values);
    console.log('Resultado da query:', result.rows[0]);

    return NextResponse.json({
      message: 'Solicitação enviada com sucesso',
      request: result.rows[0]
    });

  } catch (error) {
    console.error('Erro detalhado:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: error.message || 'Erro de formato nos dados enviados. Por favor, verifique os campos.' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
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
    
    if (!userData.whatsapp) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formattedWhatsApp = formatWhatsAppNumber(userData.whatsapp);
    
    const query = `
      SELECT * FROM service_requests 
      WHERE whatsapp = $1 
      OR (user_id = $2 AND user_id IS NOT NULL)
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [
      formattedWhatsApp,
      userData.id || null
    ]);
    
    const formattedResults = result.rows.map(row => ({
      ...row,
      preferred_date: new Date(row.preferred_date).toISOString().split('T')[0],
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
      submitted_at: row.submitted_at ? new Date(row.submitted_at).toISOString() : null
    }));
    
    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Database error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

