"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Send, Download, Eye, Bell, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContractForm } from "@/components/ContractForm/ContractForm";
import { ContractPreview } from "@/components/ContractPreview/ContractPreview";
import { ContractTable } from "@/components/ContractTable/ContractTable";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { ServiceRequestDB, Contract, ContractData } from "@/app/types";
import { 
  notifySupervisorContractGenerated, 
  notifySupervisorContractApproved,
  notifyClientContractSign 
} from "@/services/notifications";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Signature {
  signed_by: string;
  signature_data: string;
  signed_at: string;
}
interface ServiceRequestWithContract extends ServiceRequestDB {
  contract_id?: string;
  contract_status?: Contract['status'];
  contract_pdf?: string;
  contract?: Contract;
}

const ContractsDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [requests, setRequests] = useState<ServiceRequestWithContract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestWithContract | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const [contractData, setContractData] = useState<ContractData>({
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
    clientSignature: ""
  });

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [statusFilter, dateFilter]);

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        startDate: dateFilter.start,
        endDate: dateFilter.end,
      });

      const response = await fetch(`/api/service-requests-contracts?${params}`);
      if (!response.ok) throw new Error('Falha ao buscar solicitações');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
    }
  };

  const handleOpenContractModal = (request: ServiceRequestWithContract) => {
    setSelectedRequest(request);
    setSignature('');
    setContractData({
      clientName: request.name,
      clientDocument: "",
      clientAddress: `${request.street}, ${request.number} - ${request.neighborhood}, ${request.city}/${request.state} - ${request.cep}`,
      serviceValue: "",
      paymentConditions: "",
      guarantee: false,
      note: "",
      requirements: "",
      materials: "",
    });
    setIsEditing(true);
    setIsContractModalOpen(true);
  };

  const handleAproveContract = async (request: ServiceRequestWithContract) => {
    try {
      const contractResponse = await fetch(`/api/contracts/${request.contract_id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      if (!contractResponse.ok) throw new Error('Falha ao buscar contrato');
      await fetchRequests();
    } catch (error) {
      console.error('Erro ao visualizar contrato:', error);
    }
  };
  
  const handleViewContract = async (request: ServiceRequestWithContract) => {
    if (!request.contract_id) {
      // Se não tem contract_id, trata como um novo contrato
      handleOpenContractModal(request);
      return;
    }
  
    try {
      // Reset signature states at the beginning
      setSignature('');
      
      // Fetch contract data
      const contractResponse = await fetch(`/api/contracts/${request.contract_id}`);
      if (!contractResponse.ok) throw new Error('Falha ao buscar contrato');
      const contract = await contractResponse.json();
      
      // Fetch signatures from the correct endpoint
      try {
        const signatureResponse = await fetch(`/api/supervisory/contracts/${request.contract_id}/sign`);
        if (signatureResponse.ok) {
          const signatures = await signatureResponse.json();
          
          // Initialize signature variables
          let supervisorSignature = '';
          let clientSignature = '';
  
          if (Array.isArray(signatures)) {
            // Find supervisor and client signatures
            const supervisorSig = signatures.find(sig => sig.signed_by === 'supervisor');
            const clientSig = signatures.find(sig => sig.signed_by === 'client');
  
            if (supervisorSig) {
              supervisorSignature = supervisorSig.signature_data;
            }
            if (clientSig) {
              clientSignature = clientSig.signature_data;
            }
  
            console.log('Signatures found:', {
              supervisor: !!supervisorSignature,
              client: !!clientSignature,
              signaturesData: signatures
            });
          }
  
          // Update contract data with both signatures
          setContractData({
            clientName: contract.client_name,
            clientDocument: contract.client_document,
            clientAddress: contract.client_address,
            serviceValue: contract.service_value.toString(),
            paymentConditions: contract.payment_conditions,
            guarantee: contract.has_guarantee,
            note: contract.additional_notes || '',
            requirements: contract.requirements || '',
            materials: contract.materials || '',
            supervisorSignature: supervisorSignature,
            clientSignature: clientSignature
          });
  
          // Set supervisor signature for backward compatibility
          setSignature(supervisorSignature);
        }
      } catch (signError) {
        console.error('Erro ao buscar assinaturas:', signError);
        // Continue execution even if signature fetch fails
      }
      
      setSelectedRequest(request);
      setIsEditing(request.contract_status === 'generated');
      setIsContractModalOpen(true);
    } catch (error) {
      console.error('Erro ao visualizar contrato:', error);
    }
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

  const handleGenerateContract = async () => {
    if (!selectedRequest || !contractData) return;

    setIsGeneratingPDF(true);
    try {
      const pdf = await generatePDF();
      
      if (pdf) {
        const pdfBase64 = pdf.output("datauristring");
        
        const response = await fetch("/api/contracts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contract: {
              serviceRequestId: selectedRequest.id,
              status: "generated",
            },
            contractData: {
              ...contractData,
              serviceValue: parseFloat(contractData.serviceValue) || 0,
              guarantee: contractData.guarantee === true,
              pdfContent: pdfBase64,
            },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Falha ao salvar contrato");
        }

        await fetchRequests();
        setIsContractModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao gerar contrato:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleUpdateContract = async () => {
    if (!selectedRequest?.contract_id || !contractData) return;

    setIsGeneratingPDF(true);
    try {
      const pdf = await generatePDF();
      
      if (pdf) {
        const pdfBase64 = pdf.output("datauristring");
        
        const response = await fetch(`/api/contracts/${selectedRequest.contract_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractData: {
              ...contractData,
              serviceValue: parseFloat(contractData.serviceValue) || 0,
              guarantee: contractData.guarantee === true,
              pdfContent: pdfBase64,
            },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Falha ao atualizar contrato");
        }

        await fetchRequests();
        setIsContractModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao atualizar contrato:", error);
    } finally {
      setIsGeneratingPDF(false);
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
        const fileName = `contrato_${contractData.clientName.replace(/\s+/g, "_")}_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        pdf.save(fileName);
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };


interface APIContract {
  id: string;
  service_request_id: string;
  client_name: string;
  client_document: string;
  client_address: string;
  service_value: number;
  payment_conditions: string;
  has_guarantee: boolean;
  requirements?: string;
  materials?: string;
  additional_notes?: string;
  pdf_content?: string;
  preferred_date: string;
  preferred_time: string;
  street: string;
  number: string;
  city: string;
  state: string;
}

const handleNotifySupervisorGenerated = async (request: ServiceRequestWithContract) => {
  try {
    if (!request.contract_id) {
      console.error('ID do contrato não encontrado');
      return;
    }

    const response = await fetch(`/api/contracts/${request.contract_id}`);
    if (!response.ok) throw new Error('Falha ao buscar contrato');
    const contractData: APIContract = await response.json();

    // Mapear os dados da API para o formato esperado pelo Contract
    const contract: Contract = {
      id: contractData.id,
      serviceRequestId: contractData.service_request_id,
      clientName: contractData.client_name,
      clientDocument: contractData.client_document,
      clientAddress: contractData.client_address,    
      serviceValue: contractData.service_value,
      paymentConditions: contractData.payment_conditions,
      hasGuarantee: contractData.has_guarantee,
      requirements: contractData.requirements,
      materials: contractData.materials,
      additionalNotes: contractData.additional_notes,
      contractNumber: contractData.id, // Usando ID como número do contrato se não tiver um específico
      status: request.contract_status || 'generated',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Criar o objeto ServiceRequestDB com os dados disponíveis
    const serviceRequest: ServiceRequestDB = {
      ...request,
      preferred_date: new Date(contractData.preferred_date),
      preferred_time: contractData.preferred_time
    };

    notifySupervisorContractGenerated(contract, serviceRequest);
  } catch (error) {
    console.error('Erro ao notificar supervisor sobre contrato gerado:', error);
  }
};

const handleNotifySupervisorApproved = async (request: ServiceRequestWithContract) => {
  try {
    if (!request.contract_id) {
      console.error('ID do contrato não encontrado');
      return;
    }

    const response = await fetch(`/api/contracts/${request.contract_id}`);
    if (!response.ok) throw new Error('Falha ao buscar contrato');
    const contractData: APIContract = await response.json();

    const contract: Contract = {
      id: contractData.id,
      serviceRequestId: contractData.service_request_id,
      clientName: contractData.client_name,
      clientDocument: contractData.client_document,
      clientAddress: contractData.client_address,
      serviceValue: contractData.service_value,
      paymentConditions: contractData.payment_conditions,
      hasGuarantee: contractData.has_guarantee,
      requirements: contractData.requirements,
      materials: contractData.materials,
      additionalNotes: contractData.additional_notes,
      contractNumber: contractData.id,
      status: request.contract_status || 'approved',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const serviceRequest: ServiceRequestDB = {
      ...request,
      preferred_date: new Date(contractData.preferred_date),
      preferred_time: contractData.preferred_time
    };

    notifySupervisorContractApproved(contract, serviceRequest);
  } catch (error) {
    console.error('Erro ao notificar supervisor sobre contrato aprovado:', error);
  }
};

const handleNotifyClient = async (request: ServiceRequestWithContract) => {
  try {
    if (!request.contract_id) {
      console.error('ID do contrato não encontrado');
      return;
    }

    const response = await fetch(`/api/contracts/${request.contract_id}`);
    if (!response.ok) throw new Error('Falha ao buscar contrato');
    const contractData: APIContract = await response.json();

    const contract: Contract = {
      id: contractData.id,
      serviceRequestId: contractData.service_request_id,
      clientName: contractData.client_name,
      clientDocument: contractData.client_document,
      clientAddress: contractData.client_address,
      serviceValue: contractData.service_value,
      paymentConditions: contractData.payment_conditions,
      hasGuarantee: contractData.has_guarantee,
      requirements: contractData.requirements,
      materials: contractData.materials,
      additionalNotes: contractData.additional_notes,
      contractNumber: contractData.id,
      status: request.contract_status || 'signed/supervisor',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const serviceRequest: ServiceRequestDB = {
      ...request,
      preferred_date: new Date(contractData.preferred_date),
      preferred_time: contractData.preferred_time
    };

    notifyClientContractSign(contract, serviceRequest);
  } catch (error) {
    console.error('Erro ao notificar cliente sobre assinatura do contrato:', error);
  }
};

const handleCompleteContract = async (contractId: string) => {
  try {
    const response = await fetch(`/api/contracts/${contractId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar status do contrato');
    }

    // Refresh the contracts list
    await fetchRequests();
  } catch (error) {
    console.error('Erro ao concluir contrato:', error);
  }
};

  const LoadingState = () => (
    <div className="w-full flex justify-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"} p-6`}>
        <Card className="w-full">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Gerenciamento de Contratos</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="all" onValueChange={(value) => {
                setIsLoading(true);
                setCurrentTab(value);
                // Pequeno delay para mostrar o loading
                setTimeout(() => {
                  setIsLoading(false);
                }, 500);
              }}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">Contratos</TabsTrigger>
                <TabsTrigger value="to-generate">Contratos a Gerar</TabsTrigger>
                <TabsTrigger value="generated">Contratos Gerados</TabsTrigger>
                <TabsTrigger value="approved">Contratos Aprovados</TabsTrigger>
                <TabsTrigger value="supervisor-signed">Assinado Supervisor</TabsTrigger>
                <TabsTrigger value="client-signed">Assinado Cliente</TabsTrigger>
                <TabsTrigger value="completed">Contratos Concluídos</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <ContractTable
                  requests={requests}
                  onOpenContract={(req) => handleViewContract(req)}
                  readOnly={true}
                />
              </TabsContent>

              <TabsContent value="to-generate">
                <ContractTable
                  requests={requests.filter(req => req.status === 'concluido' && (!req.contract_id || req.contract_status === 'pending'))}
                  onOpenContract={handleOpenContractModal}
                  showGenerateButton={true}
                />
              </TabsContent>

              <TabsContent value="generated">
                <ContractTable
                  requests={requests.filter(req => req.contract_status === 'generated')}
                  onOpenContract={handleViewContract}
                  showNotifySupervisorButton={true}
                  onNotifySupervisor={handleNotifySupervisorGenerated}
                />
              </TabsContent>

              <TabsContent value="approved">
                <ContractTable
                  requests={requests.filter(req => req.contract_status === 'approved')}
                  onOpenContract={handleViewContract}
                  showNotifySupervisorButton={true}
                  onNotifySupervisor={handleNotifySupervisorApproved}
                  readOnly={true}
                />
              </TabsContent>

              <TabsContent value="supervisor-signed">
                <ContractTable
                  requests={requests.filter(req => req.contract_status === 'signed/supervisor')}
                  onOpenContract={handleViewContract}
                  showNotifyClientButton={true}
                  onNotifyClient={handleNotifyClient}
                  readOnly={true}
                />
              </TabsContent>

              <TabsContent value="client-signed">
              <ContractTable
                  requests={requests.filter(req => req.contract_status === 'signed/client')}
                  onOpenContract={handleViewContract}
                  showCompleteButton={true}
                  onCompleteContract={(req) => handleAproveContract(req)}
                  readOnly={true}
                />
              </TabsContent>

              <TabsContent value="completed">
                <ContractTable
                  requests={requests.filter(req => req.contract_status === 'completed')}
                  onOpenContract={handleViewContract}
                  readOnly={true}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isContractModalOpen} onOpenChange={(open) => {
        setIsContractModalOpen(open);
        if (!open) setIsEditing(false);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Contrato" : "Visualizar Contrato"}
            </DialogTitle>
          </DialogHeader>

          <ContractForm
            contractData={contractData}
            onInputChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setContractData(prev => ({
                ...prev,
                [e.target.name]: e.target.value
              }))
            }
            readOnly={!isEditing}
          />

          <ContractPreview
            ref={contractRef}
            contractData={contractData}
            currentDate={new Date().toLocaleDateString("pt-BR")}
            contractDate={selectedRequest?.preferred_date}
            signature={signature}
            clientSignature={contractData.clientSignature} 
          />

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => {
              setIsContractModalOpen(false);
              setIsEditing(false);
            }}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? "Gerando PDF..." : "Download PDF"}
            </Button>
            <Button variant="outline" onClick={handlePreviewPDF} disabled={isGeneratingPDF}>
              <Eye className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? "Gerando Preview..." : "Visualizar PDF"}
            </Button>
            {isEditing && !selectedRequest?.contract_id && (
              <Button onClick={handleGenerateContract} disabled={isGeneratingPDF}>
                <Send className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? "Gerando Contrato..." : "Gerar Contrato"}
              </Button>
            )}
            {isEditing && selectedRequest?.contract_id && (
              <Button onClick={handleUpdateContract} disabled={isGeneratingPDF}>
                <Save className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? "Atualizando Contrato..." : "Atualizar Contrato"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractsDashboard;