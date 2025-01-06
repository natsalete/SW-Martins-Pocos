import { format } from 'date-fns';
import { ptBR } from "date-fns/locale";

export const formatPhoneForWhatsApp = (phone: string) => {
  return phone.replace(/\D/g, '');
};

export const formatDate = (date: Date | string) => {
    if (typeof date === "string") {
      date = new Date(date);
    }
    return format(date, "dd/MM/yyyy", { locale: ptBR });
};