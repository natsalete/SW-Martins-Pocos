"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import {
  Construction,
  FileText,
  TrendingUp,
  Users,
  Target,
  DollarSign,
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
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } p-6`}
      >
        <div className="flex justify-between items-center mb-8">
          <Card className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
            <CardHeader className="py-8">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl font-bold">Dashboard de Vendas</CardTitle>
                  <p className="mt-2 text-blue-100 text-lg">
                    Visão geral do desempenho comercial da Martins Poços
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold">Bem-vindo, Gerente</p>
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
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Vendas do Mês</p>
                  <p className="text-2xl font-bold text-gray-800">R$ 125.000</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Meta Mensal</p>
                  <p className="text-2xl font-bold text-gray-800">85%</p>
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
                  <p className="text-sm font-medium text-gray-500">Novos Clientes</p>
                  <p className="text-2xl font-bold text-gray-800">24</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-gray-800">68%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-xl transition-all duration-300 bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-blue-50 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Construction className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Solicitações</h3>
                <div className="flex justify-center gap-4 mb-6">
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    12 Novas
                  </span>
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    5 Pendentes
                  </span>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                  onClick={() => handleNavigation('/salesControl/requests')}
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
                  <FileText className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Contratos</h3>
                <div className="flex justify-center gap-4 mb-6">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    8 Em Andamento
                  </span>
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    3 Para Assinar
                  </span>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                  onClick={() => handleNavigation('/salesControl/contracts')}
                >
                  Gerenciar Contratos
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