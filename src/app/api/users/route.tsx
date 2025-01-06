// src/app/api/users/route.tsx
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/index';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { name, whatsapp, password } = await request.json();
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (name, whatsapp, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, whatsapp, created_at`,
      [name, whatsapp, hashedPassword]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}