import { Pool } from "pg";
import { Contract, ContractData, ServiceRequestDB, RequestStatus } from "../../app/types";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

//Teste de conexão durante inicialização
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client:', err.stack);
    return;
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      console.error('Error executing query:', err.stack);
      return;
    }
    console.log('Successfully connected to PostgreSQL database');
  });
});

export { pool }; 
export class RequestServiceDB {
  async getAllRequests(): Promise<ServiceRequestDB[]> {
    const query = `
      SELECT * FROM service_requests 
      ORDER BY submitted_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async updateRequestStatus(id: string, status: RequestStatus): Promise<ServiceRequestDB> {
    const query = `
      UPDATE service_requests 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, id]);
    return rows[0];
  }

  async rescheduleRequest(
    id: string, 
    preferredDate: string, 
    preferredTime: string
  ): Promise<ServiceRequestDB> {
    const query = `
      UPDATE service_requests 
      SET preferred_date = $1, 
          preferred_time = $2,
          status = 'remarcado',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const { rows } = await pool.query(query, [preferredDate, preferredTime, id]);
    return rows[0];
  }

  async getFilteredRequests(
    status?: RequestStatus,
    startDate?: string,
    endDate?: string
  ): Promise<ServiceRequestDB[]> {
    let query = `SELECT * FROM service_requests WHERE 1=1`;
    const params: any[] = [];

    if (status && status !== 'todos') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (startDate && endDate) {
      params.push(startDate, endDate);
      query += ` AND preferred_date BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    query += ` ORDER BY submitted_at DESC`;
    const { rows } = await pool.query(query, params);
    return rows;
  }
}

const db = {
  query: async (text: string, params?: any[]) => {
    if (typeof window === 'undefined') {
      const client = await pool!.connect();
      try {
        return await client.query(text, params);
      } finally {
        client.release();
      }
    }
    throw new Error('Database queries can only be executed on the server');
  },
  connect: async () => {
    if (typeof window === 'undefined') {
      return await pool!.connect();
    }
    throw new Error('Database connections can only be established on the server');
  }
};

export { db };

