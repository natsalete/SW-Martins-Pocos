"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupervisorySidebar } from "@/components/SupervisorySidebar/SupervisorySidebar";
import {
  Construction,
  ClipboardList,
  FileText,
  Users,
  Drill,
  Activity,
  CheckCircle,
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
      <SupervisorySidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } p-6`}
      >
        <div className="flex justify-between items-center mb-8">
          <Card className="w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
            <CardHeader className="py-8">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl font-bold">Supervisão de Perfuração</CardTitle>
                  <p className="mt-2 text-blue-100 text-lg">
                    Acompanhamento e controle das operações de perfuração
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold">Supervisor</p>
                  <p className="text-md text-blue-100">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Projetos Ativos</p>
                  <p className="text-2xl font-bold text-gray-800">15</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Construction className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Em Perfuração</p>
                  <p className="text-2xl font-bold text-gray-800">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Aguardando Vistoria</p>
                  <p className="text-2xl font-bold text-gray-800">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Gerentes Ativos</p>
                  <p className="text-2xl font-bold text-gray-800">6</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-xl transition-all duration-300 bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-blue-50 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Construction className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Solicitações</h3>
                <div className="flex justify-center gap-4 mb-6">
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    7 Novas
                  </span>
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    5 Urgentes
                  </span>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                  onClick={() => handleNavigation('/supervisoryControl/requests')}
                >
                  Gerenciar Solicitações
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
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Contratos</h3>
                <div className="flex justify-center gap-4 mb-6">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    10 Em Execução
                  </span>
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    3 Para Revisar
                  </span>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                  onClick={() => handleNavigation('/supervisoryControl/contracts')}
                >
                  Gerenciar Contratos
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-blue-50 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Gerentes de Vendas</h3>
                <div className="flex justify-center gap-4 mb-6">
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    6 Ativos
                  </span>
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    2 Novos
                  </span>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                  onClick={() => handleNavigation('/supervisoryControl/managers')}
                >
                  Gerenciar Equipe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServicesDashboard;