//app/dashboard/contracts/page.tsx

"use client"

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, PenLine, Download, Eye } from "lucide-react";
import { ClientSidebar } from "@/components/ClientSidebar/ClientSidebar";
import { ContractForm } from "@/components/ContractForm/ContractForm";
import { ContractPreview } from "@/components/ContractPreview/ContractPreview";
import { SignaturePad } from "@/components/SignaturePad/SignaturePad";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
interface Contract {
  id: number;
  contract_number: string;
  name: string;
  preferred_date: string;
  status: string;
  signatures?: {
    signed_by: string;
    signature_data: string;
  }[];
}

interface ContractPreviewProps {
  contractData: {
    clientName: string;
    clientDocument: string;
    clientAddress: string;
    serviceValue: string;
    paymentConditions: string;
    guarantee: boolean;
    note: string;
    requirements: string;
    materials: string;
    supervisorSignature: string;
    clientSignature: string;
  };
  currentDate: string;
  contractDate?: string;
  signature: string;
  clientSignature: string;
}

const ContractsDashboard = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const contractRef = useRef<HTMLDivElement>(null);
  const [contractData, setContractData] = useState({
    clientName: "",
    clientDocument: "",
    clientAddress: "",
    serviceValue: "",
    paymentConditions: "",
    guarantee: false,
    note: "",
    requirements: "",
    materials: "",
    supervisorSignature: "",
    clientSignature: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    fetchContracts();
  }, [router]);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/client/contracts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      } else if (response.status === 401) {
        router.push("/sign-in");
      } else {
        throw new Error('Falha ao buscar contratos');
      }
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contratos", 
      });
    } finally {
      setIsLoading(false);
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

  const generatePDF = async () => {
    if (!contractRef.current) return null;
    
    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/png");

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      if (imgHeight > 297) {
        let heightLeft = imgHeight - 297;
        let position = -297;

        while (heightLeft > 0) {
          position = position - 297;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }
      }

      return pdf;
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      return null;
    }
  };

  const handlePreviewPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = await generatePDF();
      if (pdf) window.open(pdf.output("bloburl"), "_blank");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = await generatePDF();
      if (pdf) {
        const fileName = `contrato_${selectedContract?.name.replace(/\s+/g, "_")}_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        pdf.save(fileName);
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleViewContract = async (contract) => {
    try {
      const contractResponse = await fetch(`/api/contracts/${contract.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!contractResponse.ok) {
        throw new Error('Falha ao buscar dados do contrato');
      }
  
      const contractDetails = await contractResponse.json();
      
      // Get signatures from the contract's signatures array
      const supervisorSignature = contract.signatures?.find(sig => sig.signed_by === 'supervisor')?.signature_data || '';
      const clientSignature = contract.signatures?.find(sig => sig.signed_by === 'client')?.signature_data || '';
  
      setContractData({
        clientName: contractDetails.client_name,
        clientDocument: contractDetails.client_document,
        clientAddress: contractDetails.client_address,
        serviceValue: contractDetails.service_value.toString(),
        paymentConditions: contractDetails.payment_conditions,
        guarantee: contractDetails.has_guarantee,
        note: contractDetails.additional_notes || '',
        requirements: contractDetails.requirements || '',
        materials: contractDetails.materials || '',
        supervisorSignature,
        clientSignature // This should now be properly set
      });
      
      setSelectedContract(contract);
      setIsContractModalOpen(true);
    } catch (error) {
      console.error('Erro ao visualizar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contrato",
      });
    }
  };
  
  const handleSignContract = async (signature: string) => {
    if (!selectedContract?.id) return;
  
    try {
      const response = await fetch(`/api/client/contracts/${selectedContract.id}/sign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ signature })
      });
  
      if (!response.ok) throw new Error('Falha ao assinar contrato');
  
      const updatedContract = await response.json();
      
      setContracts(prevContracts => 
        prevContracts.map(contract => 
          contract.id === selectedContract.id 
            ? { 
                ...contract, 
                status: 'signed/client',
                signatures: updatedContract.signatures 
              }
            : contract
        )
      );
  
      setContractData(prev => ({
        ...prev,
        clientSignature: signature
      }));
  
      setIsSignatureModalOpen(false);
      await fetchContracts();
      
      toast({
        title: "Sucesso",
        description: "Contrato assinado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao assinar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao assinar contrato",
      });
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ClientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"} p-6`}>
        <Card className="w-full">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Gerenciamento de Contratos</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  <FileText className="w-4 h-4 mr-2" />
                  Todos os Contratos
                </TabsTrigger>
                <TabsTrigger value="to-sign">
                  <PenLine className="w-4 h-4 mr-2" />
                  Contratos para Assinar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Contrato</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract) => (
                        <TableRow key={contract.id}>
                        <TableCell>{contract.contract_number}</TableCell> 
                        <TableCell>{contract.name}</TableCell>
                        <TableCell>{new Date(contract.preferred_date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewContract(contract)}
                            >
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="to-sign">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Contrato</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts
                        .filter(contract => contract.status === 'signed/supervisor')
                        .map((contract) => (
                        <TableRow key={contract.id}>
                            <TableCell>{contract.contract_number}</TableCell>
                            <TableCell>{contract.name}</TableCell>
                            <TableCell>{new Date(contract.preferred_date).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{getStatusBadge(contract.status)}</TableCell>

                            <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewContract(contract)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setIsSignatureModalOpen(true);
                                }}
                              >
                                <PenLine className="w-4 h-4 mr-2" />
                                Assinar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isContractModalOpen} onOpenChange={setIsContractModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visualizar Contrato</DialogTitle>
          </DialogHeader>

          <ContractPreview
            ref={contractRef}
            contractData={contractData}
            currentDate={new Date().toLocaleDateString("pt-BR")}
            contractDate={selectedContract?.preferred_date}
            signature={contractData.supervisorSignature}
            clientSignature={contractData.clientSignature}
          />

          <div className="flex justify-end gap-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsContractModalOpen(false)}
            >
              Cancelar
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDownloadPDF} 
              disabled={isGeneratingPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? "Gerando PDF..." : "Download PDF"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handlePreviewPDF} 
              disabled={isGeneratingPDF}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? "Gerando Preview..." : "Visualizar PDF"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isSignatureModalOpen && (
        <SignaturePad
          onSave={handleSignContract}
          onClose={() => setIsSignatureModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ContractsDashboard;