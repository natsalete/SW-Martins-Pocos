import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Bell, Check } from 'lucide-react';
import { ServiceRequestDB, Contract } from '@/app/types';

interface ServiceRequestWithContract extends ServiceRequestDB {
  contract_id?: string;
  contract_status?: Contract['status'];
  contract_pdf?: string;
}

interface ContractTableProps {
  requests: ServiceRequestWithContract[];
  onOpenContract: (request: ServiceRequestWithContract) => void;
  onNotifySupervisor?: (request: ServiceRequestWithContract) => void;
  onNotifyClient?: (request: ServiceRequestWithContract) => void;
  onCompleteContract?: (request: ServiceRequestWithContract) => void;
  showGenerateButton?: boolean;
  showNotifySupervisorButton?: boolean;
  showNotifyClientButton?: boolean;
  showCompleteButton?: boolean;
  readOnly?: boolean;
}

export const ContractTable = ({ 
  requests, 
  onOpenContract,
  onNotifySupervisor,
  onNotifyClient,
  onCompleteContract,
  showGenerateButton = false,
  showNotifySupervisorButton = false,
  showNotifyClientButton = false,
  showCompleteButton = false,
  readOnly = false
}: ContractTableProps) => {
  const getStatusBadge = (status: Contract['status'] | undefined) => {
    const statusStyles: Record<string, { label: string; color: string }> = {
      pending: { label: "Pendente", color: "bg-yellow-500" },
      generated: { label: "Gerado", color: "bg-blue-500" },
      approved: { label: "Aprovado", color: "bg-green-500" },
      'signed/supervisor': { label: "Assinado Supervisor", color: "bg-purple-500" },
      'signed/client': { label: "Assinado Cliente", color: "bg-indigo-500" },
      completed: { label: "Concluído", color: "bg-green-700" }
    };
    
    if (!status) return null;
    
    return (
      <Badge className={`${statusStyles[status]?.color || "bg-gray-500"}`}>
        {statusStyles[status]?.label || status}
      </Badge>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Local</TableHead>
          <TableHead>Status do Contrato</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map(request => (
          <TableRow key={request.id}>
            <TableCell>{request.name}</TableCell>
            <TableCell>
              {new Date(request.preferred_date).toLocaleDateString('pt-BR')} - {request.preferred_time}
            </TableCell>
            <TableCell>{`${request.street}, ${request.number} - ${request.city}/${request.state}`}</TableCell>
            <TableCell>{getStatusBadge(request.contract_status)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                {showGenerateButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenContract(request)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Gerar Contrato
                  </Button>
                )}
                
                {!showGenerateButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenContract(request)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                )}

                {showNotifySupervisorButton && onNotifySupervisor && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNotifySupervisor(request)}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notificar Supervisor
                  </Button>
                )}

                {showNotifyClientButton && onNotifyClient && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNotifyClient(request)}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notificar Cliente
                  </Button>
                )}

                {showCompleteButton && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCompleteContract(request)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Concluir
                    </Button>
                  )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};