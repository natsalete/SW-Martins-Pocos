// components/Footer.tsx
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-900 text-white py-8">
      <div className="container mx-auto text-center">
        <p>&copy; 2024 Martins Poços Semi-Artesiano. Todos os direitos reservados.</p>
        <div className="mt-4 space-x-4">
          <a href="#" className="hover:text-blue-200">Política de Privacidade</a>
          <a href="#" className="hover:text-blue-200">Termos de Serviço</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
