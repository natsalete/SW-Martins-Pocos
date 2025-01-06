// src/app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserData } from '../../types';

export async function POST(request: Request) {
  try {
    const { whatsapp, password } = await request.json();
    
    // First, try to find a manager
    let managerResult = await pool.query(
      'SELECT * FROM managers WHERE whatsapp = $1',
      [whatsapp]
    );
    
    let user = managerResult.rows[0];
    let isManager = true;

    // If no manager found, try to find a regular user
    if (!user) {
      const userResult = await pool.query(
        'SELECT * FROM users WHERE whatsapp = $1',
        [whatsapp]
      );
      user = userResult.rows[0];
      isManager = false;
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Senha inválida' },
        { status: 401 }
      );
    }
    
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        whatsapp: user.whatsapp,
        role: isManager ? 'manager' : 'user'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    return NextResponse.json({ token, role: isManager ? 'manager' : 'user' });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function verifyAuth(token: string): Promise<UserData> {
  try {
    if (!token) {
      throw new Error('Token não fornecido');
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as UserData;

    if (!decoded || !decoded.id || !decoded.whatsapp) {
      throw new Error('Token inválido');
    }

    return decoded;
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    throw new Error('Unauthorized');
  }
}