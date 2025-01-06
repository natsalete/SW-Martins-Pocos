//app/services/notifications
import { ServiceRequestDB, Contract, ContractData } from "@/app/types/index";
import { formatPhoneForWhatsApp, formatDate } from "../utils/formatters";
import { SUPERVISOR_PHONE, TERRAIN_TYPES } from "@/constants";

const safeFormatCurrency = (value: number): string => {
  try {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  } catch {
    return '0,00';
  }
};

export const notifySupervisor = (request: ServiceRequestDB) => {
  const message = `📋 Nova Solicitação de Vistoria

*Dados do Cliente:*
Nome: ${request.name}
Telefone: ${request.whatsapp}

*Localização:*
Endereço: ${request.street}, ${request.number}
Bairro: ${request.neighborhood}
Cidade: ${request.city}/${request.state}
CEP: ${request.cep}

*Especificações do Terreno:*
Tipo: ${TERRAIN_TYPES[request.terrain_type]}
Rede de Água: ${request.has_water_network ? "Sim" : "Não"}
Descrição: ${request.description}

*Data e Hora Solicitada:*
Data: ${formatDate(request.preferred_date)}
Hora: ${request.preferred_time}

Por favor, confirme se podemos prosseguir com o agendamento desta vistoria.`;

  const phoneNumber = formatPhoneForWhatsApp(SUPERVISOR_PHONE);
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/55${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappLink, "_blank");
};

export const notifyCustomer = (
  request: ServiceRequestDB,
  type: "confirmation" | "reschedule" | "cancellation" | "completion",
  newDate?: string,
  newTime?: string
) => {
  let message = "";

  switch (type) {
    case "confirmation":
      message = `Olá ${request.name}! Confirmamos sua visita técnica para ${formatDate(
        request.preferred_date
      )} às ${
        request.preferred_time
      }. Por favor, confirme se ainda está disponível neste horário.`;
      break;
    
    case "reschedule":
      message = `Olá ${request.name}! Sua visita técnica foi reagendada para ${formatDate(
        newDate!
      )} às ${newTime}.`;
      break;
    
    case "cancellation":
      message = `Olá ${request.name}! Informamos que sua solicitação de visita técnica para ${formatDate(
        request.preferred_date
      )} às ${request.preferred_time} foi cancelada. Se desejar, pode fazer uma nova solicitação em outro horário.`;
      break;

    case "completion":
      message = `Olá ${request.name}! Informamos que a visita técnica realizada ${formatDate(
        request.preferred_date
      )} às ${request.preferred_time} foi concluída!`;
      break;
  }

  const phoneNumber = formatPhoneForWhatsApp(request.whatsapp);
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/55${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappLink, "_blank");
};

export const notifySupervisorContractGenerated = (
  contract: Contract,
  request: ServiceRequestDB
): void => {
  const message = `Novo Contrato Gerado

*Dados do Contrato:*
Cliente: ${contract.clientName}
CNPJ/CPF: ${contract.clientDocument || 'Não informado'}
Endereço: ${contract.clientAddress}

*Valores:*
Valor do Serviço: R$ ${safeFormatCurrency(contract.serviceValue)}
Condições de Pagamento: ${contract.paymentConditions}

*Data e Hora:*
Data: ${formatDate(request.preferred_date)}
Hora: ${request.preferred_time}

Por favor, acesse o sistema para revisar o contrato gerado.`;

  const phoneNumber = formatPhoneForWhatsApp(SUPERVISOR_PHONE);
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/55${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappLink, "_blank");
};

export const notifySupervisorContractApproved = (
  contract: Contract,
  request: ServiceRequestDB
): void => {
  const message = `Novo Contrato Aprovado

*Dados do Contrato:*
Cliente: ${contract.clientName}
CNPJ/CPF: ${contract.clientDocument || 'Não informado'}
Endereço: ${contract.clientAddress}

*Valores:*
Valor do Serviço: R$ ${safeFormatCurrency(contract.serviceValue)}
Condições de Pagamento: ${contract.paymentConditions}

*Data e Hora:*
Data: ${formatDate(request.preferred_date)}
Hora: ${request.preferred_time}

Por favor, acesse o sistema para assinar o contrato aprovado.`;

  const phoneNumber = formatPhoneForWhatsApp(SUPERVISOR_PHONE);
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/55${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappLink, "_blank");
};

export const notifyClientContractSign = (
  contract: Contract,
  request: ServiceRequestDB
): void => {
  const message = `*Contrato Pronto para Assinatura Digital*

Olá, ${contract.clientName}!

Seu contrato foi aprovado e está disponível para assinatura digital. Por favor, revise os dados e assine o documento o mais breve possível.

*Dados do Contrato:*
Cliente: ${contract.clientName}
CNPJ/CPF: ${contract.clientDocument || 'Não informado'}
Endereço: ${contract.clientAddress}

*Valores:*
Valor do Serviço: R$ ${safeFormatCurrency(contract.serviceValue)}
Condições de Pagamento: ${contract.paymentConditions}

*Informações Importantes:*
Data Preferencial do Serviço: ${formatDate(request.preferred_date)}
Hora: ${request.preferred_time}

Acesse o sistema para assinar digitalmente.

Caso tenha dúvidas, entre em contato conosco.`;

  const phoneNumber = formatPhoneForWhatsApp(request.whatsapp);
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/55${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappLink, "_blank");
};

