export const schema = `
  -- Extensão para gerar UUIDs
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Tipo ENUM para status de solicitação
  CREATE TYPE request_status AS ENUM (
      'pendente',
      'confirmado',
      'remarcado',
      'concluido',
      'cancelado'
  );

  -- Tipo ENUM para tipo de terreno
  CREATE TYPE terrain_type AS ENUM (
      'plano',
      'inclinado',
      'rochoso'
  );

  -- Tabela de usuários/clientes
  CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      whatsapp VARCHAR(20) NOT NULL UNIQUE,
      email VARCHAR(255),
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de solicitações de serviço
  CREATE TABLE service_requests (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id),
      name VARCHAR(255) NOT NULL,
      whatsapp VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      cep VARCHAR(9) NOT NULL,
      street VARCHAR(255) NOT NULL,
      number VARCHAR(20) NOT NULL,
      neighborhood VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      state CHAR(2) NOT NULL,
      terrain_type terrain_type NOT NULL,
      has_water_network BOOLEAN NOT NULL,
      description TEXT,
      preferred_date DATE NOT NULL,
      preferred_time TIME NOT NULL,
      status request_status NOT NULL DEFAULT 'pendente',
      submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de contratos
  CREATE TABLE contracts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      service_request_id UUID NOT NULL REFERENCES service_requests(id),
      client_name VARCHAR(255) NOT NULL,
      client_document VARCHAR(20) NOT NULL,
      client_address TEXT NOT NULL,
      service_value DECIMAL(10,2) NOT NULL,
      payment_conditions TEXT NOT NULL,
      has_guarantee BOOLEAN DEFAULT false,
      requirements TEXT,
      materials TEXT,
      additional_notes TEXT,
      contract_number VARCHAR(20) NOT NULL UNIQUE,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      pdf_content TEXT,
      signed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de gerentes
  CREATE TABLE managers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      whatsapp VARCHAR(20) NOT NULL UNIQUE,
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Função para atualizar o updated_at automaticamente
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
  END;
  $$ LANGUAGE 'plpgsql';

  -- Triggers para atualizar updated_at
  CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_service_requests_updated_at
      BEFORE UPDATE ON service_requests
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_contracts_updated_at
      BEFORE UPDATE ON contracts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_managers_updated_at
      BEFORE UPDATE ON managers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

  -- Índices para melhorar a performance
  CREATE INDEX idx_users_whatsapp ON users(whatsapp);
  CREATE INDEX idx_service_requests_whatsapp ON service_requests(whatsapp);
  CREATE INDEX idx_service_requests_status ON service_requests(status);
  CREATE INDEX idx_service_requests_user_id ON service_requests(user_id);
  CREATE INDEX idx_service_requests_submitted_at ON service_requests(submitted_at);
  CREATE INDEX idx_contracts_service_request_id ON contracts(service_request_id);
  CREATE INDEX idx_contracts_status ON contracts(status);
  CREATE INDEX idx_managers_whatsapp ON managers(whatsapp);

  -- Sequence para geração de número de contrato
  CREATE SEQUENCE contract_number_seq START 1;

  -- Função para auto-gerar número de contrato
  CREATE OR REPLACE FUNCTION generate_contract_number()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.contract_number := 'CTR-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                            LPAD(CAST(nextval('contract_number_seq') AS TEXT), 4, '0');
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Trigger para gerar número de contrato antes de inserir
  CREATE TRIGGER set_contract_number
      BEFORE INSERT ON contracts
      FOR EACH ROW
      EXECUTE FUNCTION generate_contract_number();
  -- Alterar a tabela de contratos para suportar os novos status
  ALTER TABLE contracts 
  DROP CONSTRAINT IF EXISTS check_status;

  ALTER TABLE contracts 
  ADD CONSTRAINT check_status 
  CHECK (status IN ('pending', 'generated', 'approved', 'signed/supervisor', 'signed/client', 'completed'));

  -- Criar tabela para assinaturas
  CREATE TABLE IF NOT EXISTS contract_signatures (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      contract_id UUID NOT NULL REFERENCES contracts(id),
      signature_data TEXT NOT NULL,
      signed_by VARCHAR(20) NOT NULL CHECK (signed_by IN ('supervisor', 'client')),
      signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      -- Garantir que só existe uma assinatura por tipo por contrato
      UNIQUE(contract_id, signed_by)
  );

  -- Criar índices para melhorar performance
  CREATE INDEX IF NOT EXISTS idx_contract_signatures_contract_id 
  ON contract_signatures(contract_id);

  -- Criar trigger para atualizar updated_at
  CREATE TRIGGER update_contract_signatures_updated_at
      BEFORE UPDATE ON contract_signatures
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

  -- Modifique a view para incluir signature_data
  CREATE OR REPLACE VIEW contract_details AS
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
              CASE 
                  WHEN cs.id IS NOT NULL THEN 
                      json_build_object(
                          'id', cs.id,
                          'signed_by', cs.signed_by,
                          'signed_at', cs.signed_at,
                          'signature_data', cs.signature_data  -- Adicionar este campo
                      )
                  ELSE NULL
              END
          ) FILTER (WHERE cs.id IS NOT NULL),
          '[]'
      ) as signatures
  FROM contracts c
  LEFT JOIN service_requests sr ON c.service_request_id = sr.id
  LEFT JOIN contract_signatures cs ON c.id = cs.contract_id
  GROUP BY c.id, sr.id;
`;
