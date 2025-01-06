"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupervisorySidebar } from "@/components/SupervisorySidebar/SupervisorySidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { ClipboardList, FileText, Send } from "lucide-react";
import { useForm } from "react-hook-form";

// Função para formatar número de telefone para WhatsApp
const formatPhoneForWhatsApp = (phone: string) => {
  return phone.replace(/\D/g, '');
};

// Função para enviar mensagem via WhatsApp
const sendWhatsAppMessage = (manager: any) => {
  const message = `Dados de Acesso - Martins Poços

*Olá ${manager.name}!*
Seguem seus dados de acesso ao sistema:

*Dados Cadastrais:*
Nome: ${manager.name}
Email: ${manager.email}
WhatsApp: ${manager.whatsapp}

*Dados de Acesso:*
Login: ${manager.whatsapp}
Senha: ${manager.password}

Em caso de dúvidas, entre em contato com o suporte.

*Bem-vindo à equipe!*`;

  const phoneNumber = formatPhoneForWhatsApp(manager.whatsapp);
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/55${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappLink, "_blank");
};

const Managers = () => {
  const [managers, setManagers] = useState<
    { id: string; name: string; email: string; whatsapp: string; password: string }[]
  >([]);
  const [editingManager, setEditingManager] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
      password: "",
    },
  });


  const handleRegister = async (data: any) => {
    try {
      const response = await fetch("/api/managers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newManager = await response.json();
        setManagers([...managers, newManager]);
        reset();
      } else {
        alert("Erro ao cadastrar gestor.");
      }
    } catch (error) {
      console.error("Erro ao cadastrar gestor:", error);
      alert("Erro ao cadastrar gestor.");
    }
  };
  
  const handleFetchManagers = async () => {
    try {
      const response = await fetch("/api/managers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setManagers(data);
      } else {
        alert("Erro ao buscar gestores.");
      }
    } catch (error) {
      console.error("Erro ao buscar gestores:", error);
      alert("Erro ao buscar gestores.");
    }
  };

  const handleEdit = async (data: any) => {
    try {
      const response = await fetch("/api/managers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingManager.id,
          ...data,
        }),
      });

      if (response.ok) {
        const updatedManager = await response.json();
        setManagers(managers.map((manager) =>
          manager.id === updatedManager.id ? updatedManager : manager
        ));
        setIsEditDialogOpen(false);
        setEditingManager(null);
        reset();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erro ao atualizar gestor.");
      }
    } catch (error) {
      console.error("Erro ao atualizar gestor:", error);
      alert("Erro ao atualizar gestor.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este gestor?")) {
      return;
    }

    try {
      const response = await fetch(`/api/managers?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setManagers(managers.filter((manager) => manager.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Erro ao excluir gestor.");
      }
    } catch (error) {
      console.error("Erro ao excluir gestor:", error);
      alert("Erro ao excluir gestor.");
    }
  };

  const openEditDialog = (manager: any) => {
    setEditingManager(manager);
    setValue("name", manager.name);
    setValue("email", manager.email);
    setValue("whatsapp", manager.whatsapp);
    setValue("password", manager.password);
    // Clear password field for security
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <SupervisorySidebar sidebarOpen={true} setSidebarOpen={() => {}} />

      <div className="ml-64 p-6">
        <Card className="w-full">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">
              Gerenciamento de Gestores de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="register">
              <TabsList className="mb-4">
                <TabsTrigger value="register">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Cadastrar Gestores
                </TabsTrigger>
                <TabsTrigger value="list" onClick={handleFetchManagers}>
                  <FileText className="w-4 h-4 mr-2" />
                  Listar Gestores
                </TabsTrigger>
              </TabsList>

              <TabsContent value="register">
                <form
                  onSubmit={handleSubmit(handleRegister)}
                  className="space-y-4 max-w-md"
                >
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Nome Completo
                    </label>
                    <Input
                      placeholder="Nome do Gestor"
                      {...register("name", { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="gestor@email.com"
                      {...register("email", { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      WhatsApp
                    </label>
                    <Input
                      placeholder="(99) 99999-9999"
                      {...register("whatsapp", { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Senha
                    </label>
                    <Input
                      type="password"
                      placeholder="********"
                      {...register("password", { required: true })}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-500"
                  >
                    Cadastrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="list">
                <div className="space-y-4">
                  {managers.length === 0 ? (
                    <p className="text-gray-500">Nenhum gestor cadastrado.</p>
                  ) : (
                    managers.map((manager) => (
                      <div
                        key={manager.id}
                        className="p-4 border rounded-md flex justify-between items-center"
                      >
                        <div>
                          <p className="text-lg font-semibold">{manager.name}</p>
                          <p className="text-gray-500">{manager.email}</p>
                          <p className="text-gray-500">{manager.whatsapp}</p>
                          <p className="text-gray-500">Senha: ********</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => sendWhatsAppMessage(manager)}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Dados
                          </Button>
                          <Button
                            onClick={() => openEditDialog(manager)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDelete(manager.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Gestor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Nome Completo
                    </label>
                    <Input
                      placeholder="Nome do Gestor"
                      {...register("name")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="gestor@email.com"
                      {...register("email")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      WhatsApp
                    </label>
                    <Input
                      placeholder="(99) 99999-9999"
                      {...register("whatsapp")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Nova Senha (opcional)
                    </label>
                    <Input
                      type="password"
                      placeholder="Digite apenas se desejar alterar"
                      {...register("password")}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 text-white">
                      Salvar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Managers;