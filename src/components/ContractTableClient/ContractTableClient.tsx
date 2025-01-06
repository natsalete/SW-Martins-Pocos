// components/ContractsTableClient/ContractsTableClient.tsx

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle2, PenLine } from 'lucide-react';
import { SignaturePad } from '@/components/SignaturePad/SignaturePad';
import { toast } from 'sonner';

interface ContractSignature {
  id: string;
  signed_by: 'supervisor' | 'client';
  signed_at: string;
}

interface ServiceRequestWithContract extends ServiceRequestDB {
  contract_id?: string;
  contract_status?: Contract['status'];
  contract_pdf?: string;
  signatures?: ContractSignature[];
}

interface ContractsTableProps {
  contracts: ServiceRequestWithContract[];
  onViewContract: (contract: ServiceRequestWithContract) => void;
  onApproveContract?: (contract_id: string) => void;
  showApproveButton?: boolean;
}

export const ContractsTable = ({
  contracts: initialContracts,
  onViewContract,
  onApproveContract,
  showApproveButton = false,
}: ContractsTableProps) => {
  const [contracts, setContracts] = useState(initialContracts);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [selectedContractForSignature, setSelectedContractForSignature] = useState<string | null>(null);


  const handleSignatureComplete = async (signature: string) => {
    if (!selectedContractForSignature) return;
    
    try {
      const response = await fetch(`/api/client/contracts/${selectedContractForSignature}/sign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature,
          signedBy: 'cliente'
        })
      });

      if (!response.ok) throw new Error('Failed to sign contract');

      const updatedContract = await response.json();

      setContracts(prevContracts =>
        prevContracts.map(contract =>
          contract.contract_id === selectedContractForSignature
            ? { ...contract, ...updatedContract }
            : contract
        )
      );

      toast.success('Contrato assinado com sucesso!');
      setShowSignaturePad(false);
      setSelectedContractForSignature(null);
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error('Erro ao assinar o contrato');
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    const statusStyles: Record<string, { label: string; color: string }> = {
      pending: { label: "Pendente", color: "bg-yellow-500" },
      generated: { label: "Gerado", color: "bg-blue-500" },
      approved: { label: "Aprovado", color: "bg-green-500" },
      'signed/supervisor': { label: "Assinado (Supervisor)", color: "bg-purple-500" },
      'signed/client': { label: "Assinado (Cliente)", color: "bg-indigo-500" },
      completed: { label: "Concluído", color: "bg-green-700" }
    };

    if (!status) return null;

    return (
      <Badge className={`${statusStyles[status]?.color || "bg-gray-500"}`}>
        {statusStyles[status]?.label || status}
      </Badge>
    );
  };

  const canSignContract = (contract: ServiceRequestWithContract) => {
    return contract.contract_status === 'approved' && 
           !contract.signatures?.some(sig => sig.signed_by === 'cliente');
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº Contrato</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Local</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map(contract => (
            <TableRow key={contract.id}>
              <TableCell>{contract.contract_number}</TableCell>
              <TableCell>{contract.name}</TableCell>
              <TableCell>
                {new Date(contract.preferred_date).toLocaleDateString('pt-BR')} - {contract.preferred_time}
              </TableCell>
              <TableCell>{`${contract.street}, ${contract.number} - ${contract.city}/${contract.state}`}</TableCell>
              <TableCell>{getStatusBadge(contract.contract_status)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewContract(contract)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  
                  
                  {canSignContract(contract) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContractForSignature(contract.contract_id!);
                        setShowSignaturePad(true);
                      }}
                    >
                      <PenLine className="w-4 h-4 mr-2" />
                      Assinar
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showSignaturePad && (
        <SignaturePad
          title="Assinatura do Cliente"
          onSave={handleSignatureComplete}
          onClose={() => {
            setShowSignaturePad(false);
            setSelectedContractForSignature(null);
          }}
        />
      )}
    </>
  );
};

