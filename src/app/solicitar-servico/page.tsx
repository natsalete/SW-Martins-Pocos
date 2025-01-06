"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Droplet,
  MapPin,
  Phone,
  Clock,
  Calendar,
  Mail,
  Home,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormData {
  name: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  whatsapp: string;
  email: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  terrainType: string;
  hasWaterNetwork: boolean;
}

interface Errors {
  [key: string]: string;
}

const ServiceRequestForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    whatsapp: "",
    email: "",
    description: "",
    preferredDate: "",
    preferredTime: "",
    terrainType: "",
    hasWaterNetwork: false,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    // Correção da manipulação do hasWaterNetwork
    if (type === "radio" && name === "hasWaterNetwork") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "true", 
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Errors = {};
    
    const requiredFields = {
      name: "Nome é obrigatório",
      email: "Email é obrigatório",
      whatsapp: "WhatsApp é obrigatório",
      cep: "CEP é obrigatório",
      street: "Logradouro é obrigatório",
      number: "Número é obrigatório",
      neighborhood: "Bairro é obrigatório",
      city: "Cidade é obrigatória",
      state: "Estado é obrigatório",
      terrainType: "Tipo de terreno é obrigatório",
      description: "Descrição é obrigatória",
      preferredDate: "Data preferencial é obrigatória",
      preferredTime: "Horário preferencial é obrigatório",
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field as keyof FormData]) {
        newErrors[field] = message;
      }
    });

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validação de WhatsApp
    const whatsappRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (formData.whatsapp && !whatsappRegex.test(formData.whatsapp)) {
      newErrors.whatsapp = "WhatsApp inválido";
    }

    // Validação de CEP
    const cepRegex = /^\d{5}-?\d{3}$/;
    if (formData.cep && !cepRegex.test(formData.cep.replace(/\D/g, ""))) {
      newErrors.cep = "CEP inválido";
    }

    // Validação de data futura
    if (formData.preferredDate) {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.preferredDate = "A data deve ser igual ou posterior a hoje";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
  
    console.log('Iniciando submissão do formulário');
  
    if (validateForm()) {
      try {
        // Primeiro verifica a autenticação
        const authCheckResponse = await fetch("/api/check-session", {
          method: "GET",
          credentials: 'include', // Importante: inclui cookies na requisição
          headers: { "Content-Type": "application/json" },
        });
  
        if (!authCheckResponse.ok) {
          throw new Error("Erro ao verificar autenticação");
        }
  
        const authData = await authCheckResponse.json();
        console.log('Status de autenticação:', authData);
  
        // Envia a solicitação
        const requestResponse = await fetch("/api/service-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
  
        if (!requestResponse.ok) {
          const errorData = await requestResponse.json();
          console.error('Erro na resposta:', errorData);
          throw new Error(errorData.error || "Erro ao enviar solicitação");
        }
  
        setSubmitStatus("success");
  
        // Redireciona baseado no status de autenticação
        if (authData.isAuthenticated) {
          console.log('Usuário autenticado, redirecionando para dashboard');
          router.push("/dashboard/requests");
          return; 
        }
  
        // Se não estiver autenticado, verifica se o usuário existe
        console.log('Verificando usuário:', formData.whatsapp);
        const checkUserResponse = await fetch("/api/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ whatsapp: formData.whatsapp }),
        });
  
        if (!checkUserResponse.ok) {
          throw new Error("Erro ao verificar usuário");
        }
  
        const { exists } = await checkUserResponse.json();
        console.log('Usuário existe:', exists);
  
        // Redireciona após breve delay
        setTimeout(() => {
          if (exists) {
            router.push("/sign-in");
          } else {
            router.push("/sign-up");
          }
        }, 1500);
  
      } catch (error) {
        console.error('Erro completo:', error);
        setSubmitStatus("error");
        setErrors(prev => ({
          ...prev,
          submit: error instanceof Error ? error.message : "Erro ao enviar solicitação. Tente novamente."
        }));
      }
    } else {
      console.log('Formulário inválido:', errors);
    }
  
    setIsSubmitting(false);
  };
  
  // Função auxiliar para verificar usuário e redirecionar
  const checkUserAndRedirect = async () => {
    try {
      const checkUserResponse = await fetch("/api/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: formData.whatsapp }),
      });
  
      if (!checkUserResponse.ok) {
        throw new Error("Erro ao verificar usuário");
      }
  
      const { exists } = await checkUserResponse.json();
      console.log('Usuário existe:', exists);
  
      if (exists) {
        router.push("/sign-in");
      } else {
        router.push("/sign-up");
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      setSubmitStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="h-8 w-8" />
            <CardTitle className="text-2xl md:text-3xl">
              Solicitação de Mini Poço Artesiano
            </CardTitle>
          </div>
          <CardDescription className="text-blue-100">
            Preencha o formulário abaixo para solicitar um orçamento de
            perfuração de poço artesiano
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* Seção de Informações Pessoais */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Home className="h-5 w-5 text-blue-500" />
                Informações Pessoais
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite seu nome completo"
                  />
                  {errors.name && (
                    <span className="text-red-500 text-sm">{errors.name}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className="pl-10"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && (
                    <span className="text-red-500 text-sm">{errors.email}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-sm font-medium">
                    WhatsApp
                  </Label>
                  <div className="relative">
                    <Phone className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                      className="pl-10 transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.whatsapp && (
                    <span className="text-red-500 text-sm">{errors.whatsapp}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Seção de Endereço */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-blue-500" />
                Local da Perfuração
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    placeholder="00000-000"
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.cep && (
                    <span className="text-red-500 text-sm">{errors.cep}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Logradouro</Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Rua, Avenida, etc."
                  />
                  {errors.street && (
                    <span className="text-red-500 text-sm">{errors.street}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder="Nº"
                  />
                  {errors.number && (
                    <span className="text-red-500 text-sm">{errors.number}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    placeholder="Seu bairro"
                  />
                  {errors.neighborhood && (
                    <span className="text-red-500 text-sm">{errors.neighborhood}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Sua cidade"
                  />
                  {errors.city && (
                    <span className="text-red-500 text-sm">{errors.city}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="UF"
                    maxLength={2}
                  />
                  {errors.state && (
                    <span className="text-red-500 text-sm">{errors.state}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Seção de Especificações Técnicas */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Droplet className="h-5 w-5 text-blue-500" />
                Especificações Técnicas
              </h3>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="terrainType">Tipo de Terreno</Label>
                    <select
                      id="terrainType"
                      name="terrainType"
                      className="w-full rounded-md border border-gray-300 p-2"
                      value={formData.terrainType}
                      onChange={handleChange}
                    >
                      <option value="">Selecione o tipo de terreno</option>
                      <option value="plano">Terreno Plano</option>
                      <option value="inclinado">Terreno Inclinado</option>
                      <option value="rochoso">Terreno Rochoso</option>
                    </select>
                    {errors.terrainType && (
                      <span className="text-red-500 text-sm">{errors.terrainType}</span>
                    )}
                    </div>
  
                    <div className="space-y-2">
                      <Label>Possui Rede de Água?</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="hasWaterNetwork"
                            value="true"
                            checked={formData.hasWaterNetwork === true}
                            onChange={handleChange}
                            className="text-blue-500"
                          />
                          Sim
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="hasWaterNetwork"
                            value="false"
                            checked={formData.hasWaterNetwork === false}
                            onChange={handleChange}
                            className="text-blue-500"
                          />
                          Não
                        </label>
                      </div>
                    </div>
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição e Observações</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Descreva detalhes adicionais sobre o terreno ou necessidades específicas..."
                      className="h-32"
                    />
                    {errors.description && (
                      <span className="text-red-500 text-sm">{errors.description}</span>
                    )}
                  </div>
                </div>
              </div>
  
              {/* Seção de Agendamento */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Agendamento da Visita Técnica
                </h3>
  
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredDate">Data Preferencial</Label>
                    <div className="relative">
                      <Calendar className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        id="preferredDate"
                        name="preferredDate"
                        type="date"
                        className="pl-10"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    {errors.preferredDate && (
                      <span className="text-red-500 text-sm">{errors.preferredDate}</span>
                    )}
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="preferredTime">Horário Preferencial</Label>
                    <div className="relative">
                      <Clock className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        id="preferredTime"
                        name="preferredTime"
                        type="time"
                        className="pl-10"
                        value={formData.preferredTime}
                        onChange={handleChange}
                        min="08:00"
                        max="18:00"
                      />
                    </div>
                    {errors.preferredTime && (
                      <span className="text-red-500 text-sm">{errors.preferredTime}</span>
                    )}
                  </div>
                </div>
              </div>
  
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm text-blue-700">
                    Após o envio, nossa equipe entrará em contato em até 24 horas úteis para confirmar a visita técnica.
                </AlertDescription>
              </Alert>
  
              {submitStatus === "success" && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-700">
                    Solicitação enviada com sucesso! Redirecionando...
                  </AlertDescription>
                </Alert>
              )}
  
              {submitStatus === "error" && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-700">
                    {errors.submit || "Erro ao enviar solicitação. Por favor, tente novamente."}
                  </AlertDescription>
                </Alert>
              )}
  
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium"
              >
                {isSubmitting ? "Enviando..." : "Solicitar Orçamento"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  export default ServiceRequestForm;