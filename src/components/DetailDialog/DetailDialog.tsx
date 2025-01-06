import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, MapPin, Calendar, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ServiceRequestDB } from '@/app/types';
import { STATUS_STYLES } from '@/constants';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: ServiceRequestDB | null;
}

interface DetailSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

interface DetailFieldProps {
  label: string;
  value: React.ReactNode; 
}

const DetailSection: React.FC<DetailSectionProps> = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-lg p-4 border border-gray-200">
    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
      <Icon className="h-5 w-5 text-blue-500" />
      {title}
    </h3>
    <div className="grid md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const DetailField: React.FC<DetailFieldProps> = ({ label, value }) => (
  <div className="space-y-1">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900">{value || '-'}</dd>
  </div>
);


export const RequestDetailDialog: React.FC<DetailDialogProps> = ({ isOpen, onOpenChange, request }) => {
  if (!request) return null;

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getStatusBadge = (status: string) => {
    const validStatus = STATUS_STYLES[status as keyof typeof STATUS_STYLES] || "bg-gray-100 text-gray-800";
    return (
      <Badge className={`${validStatus} px-2 py-1 rounded-full`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-blue-600">
            Detalhes da Solicitação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <DetailSection title="Informações de Contato" icon={User}>
            <DetailField label="Nome" value={request.name} />
            <DetailField label="WhatsApp" value={request.whatsapp} />
            <DetailField label="Email" value={request.email} />
          </DetailSection>

          <DetailSection title="Endereço" icon={MapPin}>
            <DetailField label="CEP" value={request.cep} />
            <DetailField label="Logradouro" value={`${request.street}, ${request.number}`} />
            <DetailField label="Bairro" value={request.neighborhood} />
            <DetailField label="Cidade/UF" value={`${request.city}/${request.state}`} />
          </DetailSection>

          <DetailSection title="Agendamento" icon={Calendar}>
            <DetailField 
              label="Data Preferencial" 
              value={
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDate(request.preferred_date)}
                </div>
              }
            />

            <DetailField 
              label="Horário Preferencial" 
              value={
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(request.preferred_time)}
                </div>
              }
            />
            <DetailField 
              label="Status" 
              value={getStatusBadge(request.status)} 
            />
          </DetailSection>

          <DetailSection title="Detalhes Técnicos" icon={MapPin}>
            <DetailField label="Tipo de Terreno" value={request.terrain_type} />
            <DetailField label="Possui Rede de Água" value={request.has_water_network ? "Sim" : "Não"} />
            <DetailField label="Descrição" value={request.description} />
          </DetailSection>
        </div>
      </DialogContent>
    </Dialog>
  );
};