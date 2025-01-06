import React from "react";
import { Link } from "react-scroll";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

const Topbar: React.FC = () => {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  return (
    <header className="bg-blue-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Martins Poços Semi-Artesiano</h1>
        <nav className="flex items-center space-x-6">
          <Link to="servicos" smooth={true} duration={500} className="hover:text-blue-200 cursor-pointer">
            Serviços
          </Link>
          <Link to="beneficios" smooth={true} duration={500} className="hover:text-blue-200 cursor-pointer">
            Benefícios
          </Link>
          <Link to="contato" smooth={true} duration={500} className="hover:text-blue-200 cursor-pointer">
            Contato
          </Link>
          <button
            onClick={handleSignIn}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md transition-colors"
          >
            <LogIn size={18} />
            <span>Entrar</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Topbar;