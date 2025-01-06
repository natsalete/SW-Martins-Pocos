// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { pool } from '@/lib/db/index';
import { UserData } from '@/app/types/index';

export async function verifyAuth(token: string): Promise<UserData> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as UserData;

    const result = await pool.query(
      'SELECT id, name, whatsapp FROM users WHERE id = $1',
      [decoded.id]
    );

    const user = result.rows[0];

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      whatsapp: user.whatsapp
    };
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
}