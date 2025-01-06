"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientSidebar } from "@/components/ClientSidebar/ClientSidebar";
import { GERENTE_PHONE } from "@/constants";
import { formatPhoneForWhatsApp } from "../../utils/formatters";
import {
  Construction,
  ClipboardList,
  FileText,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  PhoneCall
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const ServicesDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } p-6`}
      >
        <div className="mb-8">
          <Card className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
            <CardHeader className="py-8">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl font-bold">Bem-vindo à Martins Poços</CardTitle>
                  <p className="mt-2 text-blue-100 text-lg">
                    Acompanhe seus serviços e solicite novos atendimentos
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-md text-blue-100">Último acesso: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Em Andamento</p>
                  <p className="text-2xl font-bold text-gray-800">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Concluídos</p>
                  <p className="text-2xl font-bold text-gray-800">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-800">1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Contratos</p>
                  <p className="text-2xl font-bold text-gray-800">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <Card className="hover:shadow-xl transition-all duration-300 bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-blue-50 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Construction className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Nova Solicitação</h3>
                <p className="text-gray-600 mb-6">
                  Solicite um novo serviço de perfuração ou manutenção. Nossa equipe está pronta para atender você.
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                  onClick={() => handleNavigation('/solicitar-servico')}
                >
                  Solicitar Serviço
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-blue-50 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                  <ClipboardList className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Minhas Solicitações</h3>
                <p className="text-gray-600 mb-6">
                  Acompanhe o status e o progresso de todas as suas solicitações em tempo real.
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                  onClick={() => handleNavigation('/dashboard/requests')}
                >
                  Ver Solicitações
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-blue-50 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Meus Contratos</h3>
                <p className="text-gray-600 mb-6">
                  Acesse seus contratos, documentos e histórico de serviços realizados.
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                  onClick={() => handleNavigation('/dashboard/contracts')}
                >
                  Ver Contratos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <PhoneCall className="h-12 w-12 text-blue-600 mr-6" />
                <div>
                  <h3 className="text-2xl font-bold text-blue-800 mb-2">
                    Precisa de Ajuda?
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Nossa equipe está disponível 24/7 para ajudar você com qualquer dúvida.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 py-6 px-8 text-lg"
                  onClick={() => {
                    const phoneNumber = formatPhoneForWhatsApp(GERENTE_PHONE);
                    const whatsappLink = `https://wa.me/+55${phoneNumber}`;
                    window.open(whatsappLink, '_blank');
                  }}
                >
                  <Send className="h-5 w-5 mr-2" />
                  Falar Conosco
                </Button>
            </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServicesDashboard;