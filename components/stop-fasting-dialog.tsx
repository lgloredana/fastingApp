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
import {
  AlertTriangle,
  UtensilsCrossed,
  Stethoscope,
  Clock,
  Edit3,
} from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { TimerDisplay } from './timer-display';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StopFastingDialogProps {
  onConfirmStop: () => void;
  onConfirmStopWithEndTime?: (endTime: Date) => void;
  fastingStartTime: number;
  elapsedTime: number;
}

export function StopFastingDialog({
  onConfirmStop,
  onConfirmStopWithEndTime,
  fastingStartTime,
  elapsedTime,
}: StopFastingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingEndTime, setIsEditingEndTime] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleConfirm = () => {
    onConfirmStop();
    setIsOpen(false);
    setIsEditingEndTime(false);
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleConfirmWithCustomEndTime = () => {
    try {
      if (selectedDate && selectedTime && onConfirmStopWithEndTime) {
        const endTime = new Date(`${selectedDate}T${selectedTime}`);

        // Validate that the end time is not in the future
        if (endTime.getTime() > Date.now()) {
          alert('Timpul de oprire nu poate fi în viitor!');
          return;
        }

        // Validate that the end time is after start time
        if (endTime.getTime() <= fastingStartTime) {
          alert('Timpul de oprire trebuie să fie după timpul de început!');
          return;
        }

        onConfirmStopWithEndTime(endTime);
        setIsOpen(false);
        setIsEditingEndTime(false);
        setSelectedDate('');
        setSelectedTime('');
      }
    } catch (error) {
      alert('Format de dată/oră invalid');
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setIsEditingEndTime(false);
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleEditEndTime = () => {
    // Set default end time to current time (presetat cu ora curentă)
    const now = new Date();
    setSelectedDate(format(now, 'yyyy-MM-dd'));
    setSelectedTime(format(now, 'HH:mm'));
    setIsEditingEndTime(true);
  };

  const handleCancelEditEndTime = () => {
    setIsEditingEndTime(false);
    setSelectedDate('');
    setSelectedTime('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          data-testid='stopButton'
          variant='outline'
          size='default'
          className='w-full px-8 py-6 text-2xl md:text-3xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[140px] sm:min-h-[120px] rounded-2xl border-2 transform hover:-translate-y-1 active:translate-y-0'
          style={{
            background:
              'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
            borderColor: '#ffffff',
            borderRadius: '16px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              'linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)';
            e.currentTarget.style.borderColor = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderRadius = '16px';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)';
            e.currentTarget.style.borderColor = '#ffffff';
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.borderRadius = '16px';
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
            <TimerDisplay elapsedTime={elapsedTime} variant='dialog' />

            <div className='space-y-1 text-xs sm:text-sm'>
              <div className='flex items-center gap-1'>
                <span className='text-muted-foreground'>Început:</span>
                <span className='font-medium tabular-nums'>
                  {format(new Date(fastingStartTime), 'HH:mm, dd MMM', {
                    locale: ro,
                  })}
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='text-muted-foreground'>Durata:</span>
                <span className='font-medium tabular-nums'>
                  {(elapsedTime / (1000 * 60 * 60)).toFixed(1)} ore
                </span>
              </div>
              {!isEditingEndTime && onConfirmStopWithEndTime && (
                <div className='pt-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleEditEndTime}
                    className='h-8 px-3 text-xs hover:bg-gray-200 dark:hover:bg-gray-700'
                  >
                    <Edit3 className='h-3 w-3 mr-1' />
                    Am uitat să opresc mai devreme
                  </Button>
                </div>
              )}
            </div>
          </div>

          {isEditingEndTime && (
            <div className='mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                  <span className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                    Când ai oprit de fapt postul?
                  </span>
                </div>

                <div className='space-y-3'>
                  <div className='space-y-2'>
                    <Label className='text-xs text-muted-foreground'>
                      Timpul curent de oprire ar fi:
                    </Label>
                    <div className='p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs'>
                      {format(new Date(), 'EEEE, dd MMMM yyyy, HH:mm', {
                        locale: ro,
                      })}
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-2'>
                      <Label htmlFor='end-date' className='text-xs'>
                        Data
                      </Label>
                      <Input
                        id='end-date'
                        type='date'
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        min={format(new Date(fastingStartTime), 'yyyy-MM-dd')}
                        className='text-sm'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='end-time' className='text-xs'>
                        Ora
                      </Label>
                      <Input
                        id='end-time'
                        type='time'
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className='text-sm'
                      />
                    </div>
                  </div>

                  {selectedDate && selectedTime && (
                    <div className='space-y-2'>
                      <Label className='text-xs'>
                        Previzualizare Timp de Oprire
                      </Label>
                      <div className='p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs'>
                        {format(
                          new Date(`${selectedDate}T${selectedTime}`),
                          'EEEE, dd MMMM yyyy, HH:mm',
                          { locale: ro }
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    onClick={handleCancelEditEndTime}
                    variant='outline'
                    className='flex-1 rounded-full'
                    style={{ borderRadius: '50px' }}
                  >
                    Anulează
                  </Button>
                  <Button
                    size='sm'
                    onClick={handleConfirmWithCustomEndTime}
                    disabled={!selectedDate || !selectedTime}
                    className='flex-1 rounded-full text-white'
                    style={{
                      borderRadius: '50px',
                      background: '#3B82F6',
                    }}
                  >
                    Confirmă Oprirea
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isEditingEndTime && (
          <div className='flex flex-col gap-2 sm:gap-3 pt-1 sm:pt-2'>
            <Button
              variant='outline'
              onClick={handleCancel}
              className='w-full gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold order-2 text-green-900 hover:text-white transition-colors duration-300 rounded-full'
              style={{
                background:
                  'linear-gradient(135deg, #C5E8DD 0%, #A5D6A7 50%, #48b895 100%)',
                borderColor: '#C5E8DD',
                borderRadius: '50px',
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
                e.currentTarget.style.borderRadius = '50px';
              }}
            >
              <Stethoscope className='h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0' />
              <span className='truncate'>Continuă Pauza Alimentara</span>
            </Button>
            <Button
              variant='destructive'
              onClick={handleConfirm}
              className='w-full gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold order-1 text-black border-blue-600 hover:border-blue-700 transition-all duration-300 rounded-full'
              style={{
                background:
                  'linear-gradient(135deg, #DBEAFE 0%, #3B82F6 50%, #1D4ED8 100%)',
                borderRadius: '50px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 50%, #1E3A8A 100%)';
                e.currentTarget.style.borderRadius = '50px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #DBEAFE 0%, #3B82F6 50%, #1D4ED8 100%)';
                e.currentTarget.style.borderRadius = '50px';
              }}
            >
              <UtensilsCrossed className='h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0' />
              <span className='truncate'>Oprește & Salvează Sesiunea</span>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
