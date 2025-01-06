import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ClipboardList, FileText, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export const ClientSidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  const [activeMenu, setActiveMenu] = React.useState<string>('');
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/sign-in');
  };

  const handleNavigation = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? '' : menuName);
    
    switch(menuName) {
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'solicitacoes':
        router.push('/dashboard/requests');
        break;
      case 'contratos':
        router.push('/dashboard/contracts');
        break;
    }
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          {sidebarOpen && (
            <h2
              className={`font-semibold text-xl ${!sidebarOpen ? 'hidden' : ''} cursor-pointer hover:text-blue-600`}
              onClick={() => handleNavigation('dashboard')}
            >
              Dashboard
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <LayoutDashboard className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-2">
          <Button 
            variant="ghost"
            className={`w-full justify-start hover:bg-blue-50 hover:text-blue-600 ${
              activeMenu === 'solicitacoes' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => handleNavigation('solicitacoes')}
          >
            <ClipboardList className="h-5 w-5 mr-2" />
            {sidebarOpen && 'Solicitações'}
          </Button>

          <Button 
            variant="ghost"
            className={`w-full justify-start hover:bg-blue-50 hover:text-blue-600 ${
              activeMenu === 'contratos' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => handleNavigation('contratos')}
          >
            <FileText className="h-5 w-5 mr-2" />
            {sidebarOpen && 'Contratos'}
          </Button>

          <Button 
            variant="ghost"
            className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 text-gray-600"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            {sidebarOpen && 'Sair'}
          </Button>
        </nav>
      </div>
    </div>
  );
};