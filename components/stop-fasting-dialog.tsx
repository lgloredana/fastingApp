'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertTriangle, UtensilsCrossed } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface StopFastingDialogProps {
  onConfirmStop: () => void;
  fastingStartTime: number;
  elapsedTime: number;
}

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`;
};

export function StopFastingDialog({
  onConfirmStop,
  fastingStartTime,
  elapsedTime,
}: StopFastingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    onConfirmStop();
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='default'
          className='sm:w-auto px-12 py-8 text-3xl md:text-4xl font-bold bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[130px] sm:min-h-auto'
        >
          <div className='flex items-center gap-4'>
            <UtensilsCrossed className='!h-12 !w-12 flex-shrink-0' />
            <span className='hidden sm:inline'>Oprește Pauza Alimentara</span>
            <span className='sm:hidden flex flex-col text-center leading-tight'>
              <span>Oprește</span>
              <span>Pauza</span>
              <span>Alimentara</span>
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-destructive flex-wrap'>
            <AlertTriangle className='h-5 w-5 flex-shrink-0' />
            <span className='break-words'>
              Oprești Sesiunea de Pauza Alimentara?
            </span>
          </DialogTitle>
          <DialogDescription className='text-wrap'>
            Ești sigur că vrei să oprești această perioadă de pauza alimentara?
          </DialogDescription>
          <div className='text-sm text-muted-foreground mt-2 text-wrap leading-relaxed'>
            Această acțiune nu poate fi anulată și sesiunea ta curentă va fi
            salvată în istoric.
          </div>
        </DialogHeader>

        <div className='py-4'>
          <div className='space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mx-auto max-w-full'>
            <div className='text-center'>
              <p className='text-sm text-muted-foreground mb-1'>
                Sesiunea Curentă
              </p>
              <p className='text-xl font-bold text-primary break-all'>
                {formatTime(elapsedTime)}
              </p>
            </div>

            <div className='space-y-1 text-sm'>
              <div className='flex justify-between items-center flex-wrap gap-1'>
                <span className='flex-shrink-0'>Început:</span>
                <span className='text-right'>
                  {format(fastingStartTime, 'HH:mm, dd MMM', { locale: ro })}
                </span>
              </div>
              <div className='flex justify-between items-center flex-wrap gap-1'>
                <span className='flex-shrink-0'>Durata:</span>
                <span className='font-medium text-right'>
                  {(elapsedTime / (1000 * 60 * 60)).toFixed(1)} ore
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='gap-3 flex-col sm:flex-row'>
          <Button
            variant='outline'
            onClick={handleCancel}
            className='w-full sm:w-auto px-6 py-3 text-lg font-semibold'
          >
            Continuă Pauza Alimentara
          </Button>
          <Button
            variant='destructive'
            onClick={handleConfirm}
            className='w-full sm:w-auto gap-3 px-6 py-3 text-lg font-semibold'
          >
            <UtensilsCrossed className='!h-6 !w-6' />
            Oprește & Salvează Sesiunea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
