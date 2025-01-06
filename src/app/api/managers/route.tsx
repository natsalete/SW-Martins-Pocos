// src/app/api/managers/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/index';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const IV = process.env.IV!;

function encrypt(text: string) {
  try {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), Buffer.from(IV));
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Erro na criptografia');
  }
}

function decrypt(encryptedText: string) {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), Buffer.from(IV));
    let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Erro na descriptografia');
  }
}

export async function POST(request: Request) {
  console.log('POST request received');
  
  if (!ENCRYPTION_KEY || !IV) {
    console.error('Missing encryption keys');
    return NextResponse.json(
      { error: 'Chaves de criptografia não configuradas' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    console.log('Request body:', { ...body, password: '[REDACTED]' });
    
    const { name, email, whatsapp, password } = body;
    
    if (!name || !email || !whatsapp || !password) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const encryptedPassword = encrypt(password);
    console.log('Password encrypted successfully');

    const result = await pool.query(
      `INSERT INTO managers (name, email, whatsapp, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, whatsapp, created_at`,
      [name, email, whatsapp, encryptedPassword]
    );
    
    console.log('Manager created successfully');
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    if (error.code === '23505') {
      let duplicateField = '';
      if (error.detail?.includes('email')) {
        duplicateField = 'Email';
      } else if (error.detail?.includes('whatsapp')) {
        duplicateField = 'WhatsApp';
      }
      return NextResponse.json(
        { error: `${duplicateField} já cadastrado` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!ENCRYPTION_KEY || !IV) {
    return NextResponse.json(
      { error: 'Chaves de criptografia não configuradas' },
      { status: 500 }
    );
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, whatsapp, password, created_at, updated_at FROM managers'
    );

    // Descriptografamos a senha para cada manager
    const managers = result.rows.map(manager => {
      try {
        const decryptedPassword = decrypt(manager.password);
        return {
          ...manager,
          password: decryptedPassword, // Senha descriptografada
        };
      } catch (error) {
        console.error(`Erro ao descriptografar a senha para o manager ${manager.id}:`, error);
        return {
          ...manager,
          password: 'Erro ao descriptografar', // Retorna mensagem de erro se a descriptografia falhar
        };
      }
    });

    return NextResponse.json(managers);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!ENCRYPTION_KEY || !IV) {
    return NextResponse.json(
      { error: 'Chaves de criptografia não configuradas' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { id, name, email, whatsapp, password } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do gestor é obrigatório' },
        { status: 400 }
      );
    }

    let updateQuery = 'UPDATE managers SET ';
    const updateValues = [];
    const queryParams = [];
    let paramCount = 1;

    if (name) {
      updateValues.push(`name = $${paramCount}`);
      queryParams.push(name);
      paramCount++;
    }
    if (email) {
      updateValues.push(`email = $${paramCount}`);
      queryParams.push(email);
      paramCount++;
    }
    if (whatsapp) {
      updateValues.push(`whatsapp = $${paramCount}`);
      queryParams.push(whatsapp);
      paramCount++;
    }
    if (password) {
      const encryptedPassword = encrypt(password);
      updateValues.push(`password = $${paramCount}`);
      queryParams.push(encryptedPassword);
      paramCount++;
    }

    updateQuery += updateValues.join(', ');
    updateQuery += `, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, name, email, whatsapp, created_at, updated_at`;
    queryParams.push(id);

    const result = await pool.query(updateQuery, queryParams);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Gestor não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Update error:', error);
    
    if (error.code === '23505') {
      let duplicateField = '';
      if (error.detail?.includes('email')) {
        duplicateField = 'Email';
      } else if (error.detail?.includes('whatsapp')) {
        duplicateField = 'WhatsApp';
      }
      return NextResponse.json(
        { error: `${duplicateField} já cadastrado` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Add DELETE endpoint
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'ID do gestor é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      'DELETE FROM managers WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Gestor não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Gestor removido com sucesso' });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}