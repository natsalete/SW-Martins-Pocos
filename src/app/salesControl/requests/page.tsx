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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Phone, Mail } from "lucide-react";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { ServiceRequestDB } from "@/app/types";
import { notifyCustomer, notifySupervisor } from "@/services/notifications";
import { fetchRequests, updateRequestStatus, rescheduleRequest } from "@/services/requests";
import { STATUS_STYLES } from "@/constants";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { formatDate } from "@/utils/formatters";
import { RequestDetailDialog } from "@/components/DetailDialog/DetailDialog";
import { RescheduleDialog } from "@/components/RescheduleDialog/RescheduleDialog";

const ConfirmationDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
}) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="text-blue-600">{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="border-gray-300 hover:bg-gray-100">
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction
          className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          onClick={onConfirm}
        >
          Confirmar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);


// Pagination component
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

const RequestsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequestDB[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestDB | null>(null);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const data = await fetchRequests();
      setRequests(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar solicitações",
        description: "Não foi possível carregar as solicitações. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmVisit = async (request: ServiceRequestDB) => {
    setSelectedRequest(request);
    setConfirmationDialog({
      isOpen: true,
      title: "Confirmar Visita",
      description: `Deseja confirmar a visita para ${request.name}?`,
      onConfirm: async () => {
        try {
          setProcessingRequestId(request.id);
          const updatedRequest = await updateRequestStatus(request.id, "confirmado");
          setRequests(prev => 
            prev.map(req => req.id === request.id ? updatedRequest : req)
          );
          await notifyCustomer(request, "confirmation");
          toast({
            title: "Visita confirmada",
            description: "A visita foi confirmada com sucesso.",
          });
        } catch (error) {
          toast({
            title: "Erro ao confirmar visita",
            description: "Não foi possível confirmar a visita. Por favor, tente novamente.",
            variant: "destructive",
          });
        } finally {
          setProcessingRequestId(null);
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleRequestReschedule = (request: ServiceRequestDB) => {
    setSelectedRequest(request);
    setIsRescheduleDialogOpen(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedRequest || !newDate || !newTime) return;

    setConfirmationDialog({
      isOpen: true,
      title: "Confirmar Reagendamento",
      description: `Deseja reagendar a visita para ${newDate} às ${newTime}?`,
      onConfirm: async () => {
        try {
          setProcessingRequestId(selectedRequest.id);
          const updatedRequest = await rescheduleRequest(
            selectedRequest.id,
            newDate,
            newTime
          );
          setRequests(prev => 
            prev.map(req => req.id === selectedRequest.id ? updatedRequest : req)
          );
          await notifyCustomer(selectedRequest, "reschedule", newDate, newTime);
          await notifySupervisor(selectedRequest);
          toast({
            title: "Visita reagendada",
            description: "A visita foi reagendada com sucesso.",
          });
        } catch (error) {
          toast({
            title: "Erro ao reagendar visita",
            description: "Não foi possível reagendar a visita. Por favor, tente novamente.",
            variant: "destructive",
          });
        } finally {
          setProcessingRequestId(null);
          setIsRescheduleDialogOpen(false);
          setNewDate("");
          setNewTime("");
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleCancel = (request: ServiceRequestDB) => {
    setConfirmationDialog({
      isOpen: true,
      title: "Cancelar Solicitação",
      description: `Deseja realmente cancelar a solicitação de ${request.name}?`,
      onConfirm: async () => {
        try {
          setProcessingRequestId(request.id);
          const updatedRequest = await updateRequestStatus(request.id, "cancelado");
          setRequests(prev => 
            prev.map(req => req.id === request.id ? updatedRequest : req)
          );
          await notifyCustomer(request, "cancellation");
          toast({
            title: "Solicitação cancelada",
            description: "A solicitação foi cancelada com sucesso.",
          });
        } catch (error) {
          toast({
            title: "Erro ao cancelar solicitação",
            description: "Não foi possível cancelar a solicitação. Por favor, tente novamente.",
            variant: "destructive",
          });
        } finally {
          setProcessingRequestId(null);
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleCompleteVisit = async (request: ServiceRequestDB) => {
    setSelectedRequest(request);
    setConfirmationDialog({
      isOpen: true,
      title: "Concluir Visita",
      description: `Deseja marcar a visita de ${request.name} como concluída?`,
      onConfirm: async () => {
        try {
          setProcessingRequestId(request.id);
          const updatedRequest = await updateRequestStatus(request.id, "concluido");
          setRequests(prev => 
            prev.map(req => req.id === request.id ? updatedRequest : req)
          );
          await notifyCustomer(request, "completion");
          toast({
            title: "Visita concluída",
            description: "A visita foi marcada como concluída com sucesso.",
          });
        } catch (error) {
          toast({
            title: "Erro ao concluir visita",
            description: "Não foi possível concluir a visita. Por favor, tente novamente.",
            variant: "destructive",
          });
        } finally {
          setProcessingRequestId(null);
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
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

  useEffect(() => {
    // Reset para primeira página quando os filtros mudam
    setCurrentPage(1);
  }, [statusFilter, dateFilter]);

  const getFilteredRequests = () => {
    return requests.filter((request) => {
      const matchesStatus = 
        statusFilter === "todos" || request.status === statusFilter;

      let matchesDate = true;
      if (dateFilter.start && dateFilter.end) {
        const requestDate = new Date(request.preferred_date);
        const startDate = startOfDay(new Date(dateFilter.start));
        const endDate = endOfDay(new Date(dateFilter.end));
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

  // Obter requests filtradas
  const filteredRequests = getFilteredRequests();
  // Obter apenas os itens da página atual
  const currentPageRequests = getPaginatedData(filteredRequests);


  if (isLoading) {
    return <div>Carregando...</div>;
  }


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"} p-6`}>
        <Card className="w-full">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Gerenciamento de Solicitações</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full">
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

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {filteredRequests.length} solicitações encontradas
                  </div>
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
              </div>

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
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {request.whatsapp}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="h-4 w-4" />
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
                            {request.preferred_time}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {request.status === "pendente" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                                  onClick={() => notifySupervisor(request)}
                                  disabled={processingRequestId === request.id}
                                >
                                  Enviar p/ Supervisor
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1"
                                  onClick={() => handleConfirmVisit(request)}
                                  disabled={processingRequestId === request.id}
                                >
                                  Confirmar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1 text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                  onClick={() => handleRequestReschedule(request)}
                                  disabled={processingRequestId === request.id}
                                >
                                  Reagendar
                                </Button>
                              </>
                            )}

                            {request.status === "confirmado" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleCompleteVisit(request)}
                                disabled={processingRequestId === request.id}
                              >
                                Concluir
                              </Button>
                            )}

                            {request.status === "remarcado" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={() => handleConfirmVisit(request)}
                                disabled={processingRequestId === request.id}
                              >
                                Confirmar
                              </Button>
                            )}

                            {request.status !== "cancelado" &&
                              request.status !== "concluido" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => handleCancel(request)}
                                  disabled={processingRequestId === request.id}
                                >
                                  Cancelar
                                </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex items-center gap-1"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              Detalhes
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                totalItems={filteredRequests.length}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <RequestDetailDialog
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        request={selectedRequest}
      />

      <RescheduleDialog
        isOpen={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
        newDate={newDate}
        setNewDate={setNewDate}
        newTime={newTime}
        setNewTime={setNewTime}
        onConfirm={handleConfirmReschedule}
      />

      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onOpenChange={(open) =>
          setConfirmationDialog((prev) => ({ ...prev, isOpen: open }))
        }
        onConfirm={confirmationDialog.onConfirm}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
      />
    </div>
  );
};

export default RequestsDashboard;