"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RequestDetailDialog } from "@/components/DetailDialog/DetailDialog"
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { SupervisorySidebar } from "@/components/SupervisorySidebar/SupervisorySidebar";
import { ptBR } from "date-fns/locale";

const ITEMS_PER_PAGE = 10;

const Pagination = ({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  onPageChange 
}: { 
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-2 py-4 border-t">
      <div className="text-sm text-gray-600">
        Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} até{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => (
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 1 && page <= currentPage + 1)
            ))
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`min-w-8 ${
                    currentPage === page 
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {page}
                </Button>
              </React.Fragment>
            ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const RequestsList = ({
  requests,
  currentPage,
  onPageChange,
  viewType,
  onRequestDetails,
  onApprove,
  onReject
}: {
  requests: any[];
  currentPage: number;
  onPageChange: (page: number) => void;
  viewType: 'all' | 'confirmed';
  onRequestDetails: (request: any) => void;
  onApprove?: (request: any) => void;
  onReject?: (request: any) => void;
}) => {
  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const currentPageRequests = getPaginatedData(requests);

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Data Preferencial</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPageRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div className="font-medium">{request.name}</div>
                <div className="text-sm text-gray-500">
                  {request.street}, {request.number}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{request.whatsapp}</div>
                <div className="text-sm text-gray-500">{request.email}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(request.preferred_date)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(request.preferred_time)}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`px-2 py-1 rounded-full ${
                  request.status === 'confirmado' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRequestDetails(request)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Detalhes
                  </Button>
                  
                  {viewType === 'confirmed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApprove && onApprove(request)}
                        className="text-green-600 hover:bg-green-50"
                      >
                        Aprovar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReject && onReject(request)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Reprovar
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Pagination
        totalItems={requests.length}
        itemsPerPage={ITEMS_PER_PAGE}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </>
  );
};

const InspectionsDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState<'all' | 'confirmed'>('all');
    const [requests, setRequests] = useState<any[]>([]);
    const [confirmedRequests, setConfirmedRequests] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      const data = await response.json();
      setRequests(data);
      setConfirmedRequests(data.filter((req: any) => req.status === 'confirmado'));
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  const handleRequestDetails = (request: any) => {
    setSelectedRequest(request);
    setIsDetailsDialogOpen(true);
  };

  const handleApprove = (request: any) => {
    console.log('Aprovar solicitação:', request);
    // Implementar lógica de aprovação
  };

  const handleReject = (request: any) => {
    console.log('Reprovar solicitação:', request);
    // Implementar lógica de reprovação
  };

  const getFilteredRequests = (data: any[]) => {
    if (!dateFilter.start || !dateFilter.end) return data;

    return data.filter(request => {
      const requestDate = new Date(request.preferred_date);
      const startDate = startOfDay(parseISO(dateFilter.start));
      const endDate = endOfDay(parseISO(dateFilter.end));
      return isWithinInterval(requestDate, { start: startDate, end: endDate });
    });
  };

  const filteredRequests = getFilteredRequests(
    activeView === 'all' ? requests : confirmedRequests
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <SupervisorySidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="space-y-4 p-6">
          <div className="flex space-x-4 mb-6">
            <Button
              variant={activeView === 'all' ? 'default' : 'outline'}
              onClick={() => {
                setActiveView('all');
                setCurrentPage(1);
              }}
              className={activeView === 'all' ? 'bg-blue-600 text-white' : ''}
            >
              Todas as Solicitações
            </Button>
            <Button
              variant={activeView === 'confirmed' ? 'default' : 'outline'}
              onClick={() => {
                setActiveView('confirmed');
                setCurrentPage(1);
              }}
              className={activeView === 'confirmed' ? 'bg-blue-600 text-white' : ''}
            >
              Solicitações Confirmadas
            </Button>
          </div>

          <Card className="w-full">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl">
                {activeView === 'all' ? 'Todas as Solicitações' : 'Solicitações Confirmadas'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Inicial</label>
                    <Input
                      type="date"
                      value={dateFilter.start}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Final</label>
                    <Input
                      type="date"
                      value={dateFilter.end}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {filteredRequests.length} solicitações encontradas
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setDateFilter({ start: '', end: '' })}
                  >
                    Limpar Filtros
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <RequestsList
                    requests={filteredRequests}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    viewType={activeView}
                    onRequestDetails={handleRequestDetails}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <RequestDetailDialog
            isOpen={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            request={selectedRequest}
          />
        </div>
      </div>
    </div>
  );
};

export default InspectionsDashboard;