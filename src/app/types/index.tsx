import { TerrainType } from "@/constants";

export type RequestStatus = 'todos' | 'pendente' | 'confirmado' | 'remarcado' | 'concluido' | 'cancelado';

export interface User {
  id: string;
  name: string;
  whatsapp: string; 
  email?: string; 
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface ServiceRequestDB {
  id: string;
  user_id: string;
  name: string;
  whatsapp: string; 
  email?: string; 
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  terrain_type: TerrainType;
  has_water_network: boolean;
  description?: string; 
  preferred_date: Date;
  preferred_time: string;
  status: RequestStatus;
  submitted_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Errors {
  [key: string]: string;
}

export interface UserData {
  id: string;
  name: string;
  whatsapp: string;
}

export interface Contract {
  id: string;
  serviceRequestId: string;
  clientName: string;
  clientDocument: string;
  clientAddress: string;
  serviceValue: number;
  paymentConditions: string;
  hasGuarantee: boolean;
  requirements?: string;
  materials?: string;
  additionalNotes?: string;
  contractNumber: string;
  status: 'pending' | 'generated' | 'approved' | 'signed/supervisor' | 'signed/client' | 'completed';
  pdfContent?: string;
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
export interface ContractData {
  clientName: string;
  clientDocument: string;
  clientAddress: string;
  serviceValue: string;  
  paymentConditions: string;
  guarantee: boolean;   
  note: string;         
  requirements: string; 
  materials: string;
  supervisorSignature?: string;
  clientSignature?: string;   
}

interface ContractWithPDF extends Contract {
  pdfContent?: string;
}

interface APIContractPayload {
  contract: ContractWithPDF;
  contractData: ContractData;
}