import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RescheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newDate: string;
  setNewDate: (date: string) => void;
  newTime: string;
  setNewTime: (time: string) => void;
  onConfirm: () => void;
}

export const RescheduleDialog: React.FC<RescheduleDialogProps> = ({
  isOpen,
  onOpenChange,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-blue-600">Reagendar Visita</DialogTitle>
          <DialogDescription>
            Selecione a nova data e horário para a visita
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Nova Data</Label>
            <Input
              id="date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time">Novo Horário</Label>
            <Input
              id="time"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300 hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!newDate || !newTime}
            className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};