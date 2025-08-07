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
import { AlertTriangle, UtensilsCrossed, Stethoscope } from 'lucide-react';
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
          className='sm:w-auto px-12 py-8 text-3xl md:text-4xl font-bold text-green-900 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[130px] sm:min-h-auto'
          style={{
            background:
              'linear-gradient(135deg, #C5E8DD 0%, #A5D6A7 50%, #48b895 100%)',
            borderColor: '#C5E8DD',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              'linear-gradient(135deg, #48b895 0%, #3a9d7a 50%, #2d7a5f 100%)';
            e.currentTarget.style.borderColor = '#48b895';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              'linear-gradient(135deg, #C5E8DD 0%, #A5D6A7 50%, #48b895 100%)';
            e.currentTarget.style.borderColor = '#C5E8DD';
            e.currentTarget.style.color = '#14532d';
          }}
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
      <DialogContent className='w-[95vw] max-w-[450px] md:max-w-[550px] max-h-[90vh] overflow-y-auto p-3 sm:p-4'>
        <DialogHeader className='space-y-2 sm:space-y-3'>
          <DialogTitle
            className='flex items-start gap-2 text-white text-base sm:text-lg leading-tight -mx-3 sm:-mx-4 -mt-3 sm:-mt-4 px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg mb-1 sm:mb-2'
            style={{
              background: '#3B82F6',
            }}
          >
            <AlertTriangle className='h-5 w-5 mt-0.5 flex-shrink-0' />
            <span className='break-words hyphens-auto'>
              Oprești Sesiunea de Pauza Alimentara?
            </span>
          </DialogTitle>
          <DialogDescription className='text-sm sm:text-base text-wrap leading-relaxed'>
            Ești sigur că vrei să oprești această perioadă de pauza alimentara?
          </DialogDescription>
          <div className='text-xs sm:text-sm text-muted-foreground text-wrap leading-relaxed'>
            Această acțiune nu poate fi anulată și sesiunea ta curentă va fi
            salvată în istoric.
          </div>
        </DialogHeader>

        <div className='py-3 sm:py-4'>
          <div className='space-y-2 sm:space-y-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <div className='text-center mb-3'>
              <p className='text-xs sm:text-sm text-muted-foreground mb-1'>
                Sesiunea Curentă
              </p>
              <p className='text-lg sm:text-xl md:text-2xl font-bold text-primary tabular-nums'>
                {formatTime(elapsedTime)}
              </p>
            </div>

            <div className='space-y-1 text-xs sm:text-sm'>
              <div className='flex items-center gap-1'>
                <span className='text-muted-foreground'>Început:</span>
                <span className='font-medium tabular-nums'>
                  {format(fastingStartTime, 'HH:mm, dd MMM', { locale: ro })}
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='text-muted-foreground'>Durata:</span>
                <span className='font-medium tabular-nums'>
                  {(elapsedTime / (1000 * 60 * 60)).toFixed(1)} ore
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-2 sm:gap-3 pt-1 sm:pt-2'>
          <Button
            variant='outline'
            onClick={handleCancel}
            className='w-full gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold order-2 text-green-900 hover:text-white transition-colors duration-300'
            style={{
              background:
                'linear-gradient(135deg, #C5E8DD 0%, #A5D6A7 50%, #48b895 100%)',
              borderColor: '#C5E8DD',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #48b895 0%, #3a9d7a 50%, #2d7a5f 100%)';
              e.currentTarget.style.borderColor = '#48b895';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #C5E8DD 0%, #A5D6A7 50%, #48b895 100%)';
              e.currentTarget.style.borderColor = '#C5E8DD';
            }}
          >
            <Stethoscope className='h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0' />
            <span className='truncate'>Continuă Pauza Alimentara</span>
          </Button>
          <Button
            variant='destructive'
            onClick={handleConfirm}
            className='w-full gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold order-1 text-black border-blue-600 hover:border-blue-700 transition-all duration-300'
            style={{
              background:
                'linear-gradient(135deg, #DBEAFE 0%, #3B82F6 50%, #1D4ED8 100%)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 50%, #1E3A8A 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #DBEAFE 0%, #3B82F6 50%, #1D4ED8 100%)';
            }}
          >
            <UtensilsCrossed className='h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0' />
            <span className='truncate'>Oprește & Salvează Sesiunea</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
