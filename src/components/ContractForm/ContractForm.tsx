import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContractData } from '@/app/types/index';

interface ContractFormProps {
  contractData: ContractData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

export const ContractForm = ({ contractData, onInputChange, readOnly = false }: ContractFormProps) => (
  <div className="mb-6 bg-gray-100 p-4 rounded-lg">
    <h3 className="text-lg font-semibold mb-4">Dados do Cliente</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="clientName">Nome do Cliente</Label>
        <Input
          id="clientName"
          name="clientName"
          value={contractData.clientName}
          onChange={onInputChange}
          placeholder="Nome completo do cliente"
          readOnly={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="clientDocument">CNPJ/CPF</Label>
        <Input
          id="clientDocument"
          name="clientDocument"
          value={contractData.clientDocument}
          onChange={onInputChange}
          placeholder="000.000.000-00"
          readOnly={readOnly}
        />
      </div>
      <div className="col-span-2">
        <Label htmlFor="clientAddress">Endereço Completo</Label>
        <Input
          id="clientAddress"
          name="clientAddress"
          value={contractData.clientAddress}
          onChange={onInputChange}
          placeholder="Endereço completo do cliente"
          readOnly={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="serviceValue">Valor do Serviço</Label>
        <Input
          id="serviceValue"
          name="serviceValue"
          value={contractData.serviceValue}
          onChange={onInputChange}
          placeholder="R$ 0,00"
          readOnly={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="paymentConditions">Condições de Pagamento</Label>
        <Input
          id="paymentConditions"
          name="paymentConditions"
          value={contractData.paymentConditions}
          onChange={onInputChange}
          placeholder="Ex: 50% entrada, 50% na conclusão"
          readOnly={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="guarantee">Garantia</Label>
        <select
          id="guarantee"
          name="guarantee"
          value={contractData.guarantee ? 'yes' : 'no'}
          onChange={onInputChange}
          className="form-select"
          disabled={readOnly}
        >
          <option value="no">Sem Garantia</option>
          <option value="yes">Garantia de Segunda Tentativa</option>
        </select>
      </div>
      <div>
        <Label htmlFor="requirements">Requisitos</Label>
        <Input
          id="requirements"
          name="requirements"
          value={contractData.requirements}
          onChange={onInputChange}
          placeholder="Ex: Fornecimento de brita, energia 220V"
          readOnly={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="materials">Materiais Utilizados</Label>
        <Input
          id="materials"
          name="materials"
          value={contractData.materials}
          onChange={onInputChange}
          placeholder="Ex: Cano PN80, bomba caneta Intech Machine"
          readOnly={readOnly}
        />
      </div>
      <div className="col-span-2">
        <Label htmlFor="note">Observações</Label>
        <Input
          id="note"
          name="note"
          value={contractData.note}
          onChange={onInputChange}
          placeholder="Observações adicionais sobre o contrato"
          readOnly={readOnly}
        />
      </div>
    </div>
  </div>
);