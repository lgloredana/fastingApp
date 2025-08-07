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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='p-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 shadow-md hover:shadow-lg transition-all duration-300'
              >
                <UtensilsCrossed className='h-5 w-5' />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Oprește postul</p>
          </TooltipContent>
        </Tooltip>
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
              <UtensilsCrossed className='h-4 w-4' />
              Oprește & Salvează Sesiunea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
