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
import { AlertTriangle, StopCircle } from 'lucide-react';
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
        <Button variant='destructive' size='lg' className='px-8 py-3 text-lg'>
          Oprește Fastingul
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-destructive'>
            <AlertTriangle className='h-5 w-5' />
            Oprești Sesiunea de Post?
          </DialogTitle>
          <DialogDescription>
            Ești sigur că vrei să oprești această perioadă de post?
          </DialogDescription>
          <div className='text-sm text-muted-foreground mt-2'>
            Această acțiune nu poate fi anulată și sesiunea ta curentă va fi
            salvată în istoric.
          </div>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <div className='text-center'>
              <p className='text-sm text-muted-foreground mb-1'>
                Sesiunea Curentă
              </p>
              <p className='text-2xl font-bold text-primary'>
                {formatTime(elapsedTime)}
              </p>
            </div>

            <div className='space-y-1 text-sm'>
              <div className='flex justify-between'>
                <span>Început:</span>
                <span>
                  {format(fastingStartTime, 'HH:mm, dd MMM', { locale: ro })}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Durata:</span>
                <span className='font-medium'>
                  {(elapsedTime / (1000 * 60 * 60)).toFixed(1)} ore
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={handleCancel}>
            Continuă Postul
          </Button>
          <Button
            variant='destructive'
            onClick={handleConfirm}
            className='gap-2'
          >
            <StopCircle className='h-4 w-4' />
            Oprește & Salvează Sesiunea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
