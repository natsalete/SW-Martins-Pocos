"use client";

import React, { useEffect, useState } from "react";
import { 
  Droplet, 
  Droplets, 
  Construction, 
  Map, 
  Send, 
  CheckCircle, 
  ShieldCheck, 
  Truck 
} from "lucide-react";
import SplashScreen from "@/components/SplashScreen/SplashScreen";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar/Topbar"; 
import Footer from "@/components/Footer/Footer";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleServiceRequest = () => {
    router.push("/solicitar-servico");
  };

  return (
    <>
      {loading ? (
        <SplashScreen />
      ) : (
        <div className="bg-gray-50 min-h-screen">
          {/* Topbar */}
          <Topbar />

          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
            <div className="container mx-auto text-center">
              <h2 className="text-4xl font-bold mb-4">Solução Completa em Perfuração de Poços</h2>
              <p className="text-xl mb-8">
                Água de qualidade e abundância para sua propriedade rural ou urbana
              </p>
              <button 
                onClick={handleServiceRequest}
                className="bg-yellow-500 text-blue-900 px-8 py-3 rounded-full text-lg font-bold hover:bg-yellow-400 transition"
              >
                Solicitar Serviço
              </button>
            </div>
          </section>

          {/* Serviços */}
          <section id="servicos" className="container mx-auto py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Nossos Serviços</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Construction size={64} className="mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-4">Perfuração de Poços</h3>
                <p>Utilizamos tecnologia de ponta para perfuração precisa e segura.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Droplets size={64} className="mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-4">Análise da Água</h3>
                <p>Garantimos a qualidade e potabilidade da água extraída.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Droplet size={64} className="mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-4">Manutenção</h3>
                <p>Serviços contínuos de manutenção e limpeza de poços.</p>
              </div>
            </div>
          </section>

          {/* Benefícios */}
          <section id="beneficios" className="bg-blue-50 py-16">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Por Que Escolher a Martins Poços</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex items-start space-x-4">
                  <ShieldCheck size={48} className="text-blue-600" />
                  <div>
                    <h3 className="text-xl font-semibold">Segurança</h3>
                    <p>Processos certificados e seguros em todas as etapas.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle size={48} className="text-blue-600" />
                  <div>
                    <h3 className="text-xl font-semibold">Qualidade</h3>
                    <p>Equipamentos modernos e equipe técnica especializada.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Truck size={48} className="text-blue-600" />
                  <div>
                    <h3 className="text-xl font-semibold">Atendimento Regional</h3>
                    <p>Cobrimos diversas regiões com rapidez e eficiência.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Chamada Final */}
          <section id="contato" className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 text-center">
            <h2 className="text-3xl font-bold mb-6">Transforme Sua Propriedade com Água de Qualidade</h2>
            <p className="text-xl mb-8">
              Entre em contato e descubra como podemos ajudar você
            </p>
            <button 
              onClick={handleServiceRequest}
              className="bg-yellow-500 text-blue-900 px-8 py-3 rounded-full text-lg font-bold hover:bg-yellow-400 transition flex items-center mx-auto space-x-2"
            >
              <Send size={20} />
              <span>Solicitar Serviço Agora</span>
            </button>
          </section>

          {/* Footer */}
          <Footer />
        </div>
      )}
    </>
  );
}
