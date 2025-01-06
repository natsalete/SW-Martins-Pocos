// /app/supervisoryControl/contracts/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, PenLine, Download, Eye } from "lucide-react";
import { SupervisorySidebar } from "@/components/SupervisorySidebar/SupervisorySidebar";
import { ContractForm } from "@/components/ContractForm/ContractForm";
import { ContractPreview } from "@/components/ContractPreview/ContractPreview";
import { ContractsTable } from "@/components/ContractTableSupervisory/ContractTableSupervisory";
import { ContractData } from "@/app/types";
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


interface ServiceRequestWithContract extends ServiceRequestDB {
  contract_id?: string;
  contract_status?: Contract['status'];
  contract_pdf?: string;
}

const ContractsDashboardSupervisory = () => {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contracts, setContracts] = useState<ServiceRequestWithContract[]>([]);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ServiceRequestWithContract | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);
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
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/supervisory/contracts');
      if (!response.ok) throw new Error('Falha ao buscar contratos');
      const data = await response.json();
      setContracts(data);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
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

  const handleViewContract = async (contract: ServiceRequestWithContract) => {
    try {
      // Buscar os dados completos do contrato
      const contractResponse = await fetch(`/api/contracts/${contract.contract_id}`);
      if (!contractResponse.ok) throw new Error('Falha ao buscar contrato');
      const contractDetails = await contractResponse.json();
  
      // Buscar assinatura
      const signatureResponse = await fetch(`/api/supervisory/contracts/${contract.contract_id}/sign`);
      if (!signatureResponse.ok) throw new Error('Falha ao buscar assinatura');
      const signatures = await signatureResponse.json();
      const supervisorSignature = signatures.find(sig => sig.signed_by === 'supervisor')?.signature_data || '';
  
      // Preparar os dados do contrato com todos os campos
      const formattedContractData: ContractData = {
        clientName: contractDetails.client_name || contract.name,
        clientDocument: contractDetails.client_document || contract.document || '',
        clientAddress: contractDetails.client_address || `${contract.street}, ${contract.number} - ${contract.city}/${contract.state}`,
        serviceValue: contractDetails.service_value?.toString() || contract.service_value || '',
        paymentConditions: contractDetails.payment_conditions || contract.payment_conditions || '',
        guarantee: contractDetails.has_guarantee || contract.has_guarantee || false,
        note: contractDetails.additional_notes || contract.additional_notes || '',
        requirements: contractDetails.requirements || contract.requirements || '',
        materials: contractDetails.materials || contract.materials || '',
        supervisorSignature: supervisorSignature,
      };
  
      // Atualizar os estados
      setSelectedContract(contract);
      setContractData(formattedContractData);
      setIsContractModalOpen(true);
    } catch (error) {
      console.error('Erro ao visualizar contrato ou assinatura:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contrato ou assinatura",
      });
    }
  };
  
  const handleApproveContract = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved'
        })
      });

      if (!response.ok) throw new Error('Falha ao aprovar contrato');
      await fetchContracts();
    } catch (error) {
      console.error('Erro ao aprovar contrato:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <SupervisorySidebar  sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
                <TabsTrigger value="generated">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Contratos Gerados
                </TabsTrigger>
                <TabsTrigger value="to-sign">
                  <PenLine className="w-4 h-4 mr-2" />
                  Contratos para Assinar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <ContractsTable
                  contracts={contracts}
                  onViewContract={handleViewContract}
                  showApproveButton={false}
                />
              </TabsContent>

              <TabsContent value="generated">
                <ContractsTable
                  contracts={contracts.filter(c => c.contract_status === 'generated')}
                  onViewContract={handleViewContract}
                  onApproveContract={handleApproveContract}
                  showApproveButton={true}
                />
              </TabsContent>

              <TabsContent value="to-sign">
                <ContractsTable
                  contracts={contracts.filter(c => c.contract_status === 'approved')}
                  onViewContract={handleViewContract}
                  showApproveButton={false}
                />
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

          <ContractForm
            contractData={contractData}
            readOnly={true}
          />

          <ContractPreview
            ref={contractRef}
            contractData={contractData}
            currentDate={new Date().toLocaleDateString("pt-BR")}
            contractDate={selectedContract?.preferred_date}
            signature={contractData.supervisorSignature}
          />

      
          <div className="flex justify-end gap-4 mt-4">
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
    </div>
  );
};

export default ContractsDashboardSupervisory;