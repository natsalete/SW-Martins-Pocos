//app/dashboard/requests
"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { RequestDetailDialog } from "@/components/DetailDialog/DetailDialog";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { ServiceRequestDB } from "../../types";
import { STATUS_STYLES } from "@/constants";
import { ClientSidebar } from "@/components/ClientSidebar/ClientSidebar";

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
          className="hover:bg-blue-50 hover:text-blue-600 disabled:hover:bg-transparent"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="hover:bg-blue-50 hover:text-blue-600 disabled:hover:bg-transparent"
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
          className="hover:bg-blue-50 hover:text-blue-600 disabled:hover:bg-transparent"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hover:bg-blue-50 hover:text-blue-600 disabled:hover:bg-transparent"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const RequestsDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequestDB[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestDB | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
  const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    fetchRequests();
  }, [router]);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/service-requests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else if (response.status === 401) {
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset para primeira página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter]);

  const formatDate = (date: Date | string) => {
    if (typeof date === "string") {
      date = new Date(date);
    }
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getStatusBadge = (status: string) => {
    const validStatus =
      STATUS_STYLES[status as keyof typeof STATUS_STYLES] ||
      "bg-gray-100 text-gray-800";
    return (
      <Badge className={`${validStatus} px-2 py-1 rounded-full`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getFilteredRequests = () => {
    return requests.filter((request) => {
      const matchesStatus = 
        statusFilter === "todos" || request.status === statusFilter;

      let matchesDate = true;
      if (dateFilter.start && dateFilter.end) {
        const requestDate = request.preferred_date;
        const startDate = startOfDay(parseISO(dateFilter.start));
        const endDate = endOfDay(parseISO(dateFilter.end));
        matchesDate = isWithinInterval(requestDate, { start: startDate, end: endDate });
      }

      return matchesStatus && matchesDate;
    });
  };

  const getPaginatedData = (data: ServiceRequestDB[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const filteredRequests = getFilteredRequests();
  const currentPageRequests = getPaginatedData(filteredRequests);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ClientSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"} p-6`}>
        <Card className="w-full">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Minhas Solicitações</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Solicitações</h2>
                  <p className="text-gray-500">
                    {filteredRequests.length} solicitações encontradas
                  </p>
                </div>
              </div>

              {/* Filters Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="remarcado">Remarcado</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStatusFilter('todos');
                    setDateFilter({ start: '', end: '' });
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
                </div>
              ) : (
                <div className="border rounded-lg">
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
                            <div className="text-sm text-gray-500">
                              {request.email}
                            </div>
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
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Pagination
                    totalItems={filteredRequests.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
          
      <RequestDetailDialog
        isOpen={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
        request={selectedRequest}
      />
    </div>
  );
};

export default RequestsDashboard;