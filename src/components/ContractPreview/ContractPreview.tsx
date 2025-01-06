import React, { memo, forwardRef } from 'react';
import { ContractData } from '@/app/types';

interface ContractPreviewProps {
  contractData: ContractData;
  currentDate: string;
  contractDate?: string;
  signature?: string;
  clientSignature?: string; // Nova prop para a assinatura do cliente
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const ContractPreview = memo(
  React.forwardRef<HTMLDivElement, ContractPreviewProps>(
    ({ contractData, currentDate, contractDate, signature, clientSignature }, ref) => (
      <div ref={ref} className="bg-white p-8" style={{ width: '21cm', minHeight: '29.7cm' }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PERFURAÇÃO</h1>
          <p className="text-sm text-gray-600">Nº {Math.floor(Math.random() * 10000)}</p>
        </div>

        <div className="mb-6">
          <p className="mb-4">
            Pelo presente instrumento particular, de um lado, doravante denominada CONTRATADA, e de outro lado:
          </p>
          <p className="font-semibold mb-2">{contractData.clientName}</p>
          <p className="mb-2">CNPJ/CPF: {contractData.clientDocument}</p>
          <p className="mb-4">Endereço: {contractData.clientAddress}</p>
          <p>doravante denominado(a) CONTRATANTE, têm entre si justo e contratado o seguinte:</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">1. OBJETO DO CONTRATO</h2>
          <p>
            O presente contrato tem por objeto a prestação de serviços de perfuração, conforme especificações técnicas
            aprovadas na vistoria realizada em {formatDate(contractDate || '')}.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">2. VALOR E FORMA DE PAGAMENTO</h2>
          <p>2.1. O valor total dos serviços é de R$ {contractData.serviceValue}.</p>
          <p>2.2. Condições de pagamento: {contractData.paymentConditions}.</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">3. GARANTIA</h2>
          <p>
            {contractData.guarantee
              ? 'Garantia de segunda tentativa sem custo adicional se o primeiro furo não der água.'
              : 'Sem garantia adicional.'}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">4. REQUISITOS</h2>
          <p>{contractData.requirements}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">5. MATERIAIS UTILIZADOS</h2>
          <p>{contractData.materials}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">6. OBSERVAÇÕES</h2>
          <p>{contractData.note}</p>
        </div>

        <div className="mt-12">
          <p className="mb-8 text-center">{contractData.clientAddress}, {currentDate}</p>

          <div className="flex justify-between mt-16">
            <div className="text-center relative">
              {clientSignature && (
                <div 
                  className="absolute bottom-8 left-0 right-0"
                  style={{
                    width: '192px',
                    height: '80px',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  <img 
                    src={clientSignature} 
                    alt="Assinatura do Cliente"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="border-t border-black w-48"></div>
              <p className="mt-2">CONTRATANTE</p>
              <p className="text-sm">{contractData.clientName}</p>
            </div>

            <div className="text-center relative">
              {signature && (
                <div 
                  className="absolute bottom-8 left-0 right-0"
                  style={{
                    width: '192px',
                    height: '80px',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  <img 
                    src={signature} 
                    alt="Assinatura"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="border-t border-black w-48"></div>
              <p className="mt-2">CONTRATADA</p>
              <p className="text-sm">Martins Poços</p>
            </div>
          </div>
        </div>
      </div>
    ),
  ),
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.contractData) === JSON.stringify(nextProps.contractData) &&
      prevProps.currentDate === nextProps.currentDate &&
      prevProps.contractDate === nextProps.contractDate &&
      prevProps.signature === nextProps.signature &&
      prevProps.clientSignature === nextProps.clientSignature // Incluída nova prop na comparação
    );
  },
);