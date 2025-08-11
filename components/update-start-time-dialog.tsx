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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Clock, Edit3 } from 'lucide-react';
import { ValidationAlertDialog } from '@/components/validation-alert-dialog';

interface UpdateStartTimeDialogProps {
  currentStartTime: number;
  onUpdateStartTime: (newStartTime: Date) => void;
}

export function UpdateStartTimeDialog({
  currentStartTime,
  onUpdateStartTime,
}: UpdateStartTimeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(currentStartTime), 'yyyy-MM-dd')
  );
  const [selectedTime, setSelectedTime] = useState(
    format(new Date(currentStartTime), 'HH:mm')
  );
  const [validationDialog, setValidationDialog] = useState<{
    isOpen: boolean;
    type: 'future-time' | 'invalid-format' | 'old-time';
    selectedDateTime?: string;
  }>({
    isOpen: false,
    type: 'future-time',
  });

  const handleSubmit = () => {
    try {
      // Validate inputs first
      if (!selectedDate || !selectedTime) {
        setValidationDialog({
          isOpen: true,
          type: 'invalid-format',
        });
        return;
      }

      // Combine date and time into a timestamp
      const dateTimeString = `${selectedDate}T${selectedTime}`;
      const newDate = new Date(dateTimeString);

      // Check if the date is valid
      if (isNaN(newDate.getTime())) {
        console.error('Invalid date created:', dateTimeString, newDate);
        setValidationDialog({
          isOpen: true,
          type: 'invalid-format',
        });
        return;
      }

      const newStartTime = newDate.getTime();

      const selectedDateTime = format(newDate, 'EEEE, dd MMMM yyyy, HH:mm', {
        locale: ro,
      });

      // Validate that the new start time is not in the future
      if (newStartTime > Date.now()) {
        setValidationDialog({
          isOpen: true,
          type: 'future-time',
          selectedDateTime,
        });
        return;
      }

      // Validate that the new start time is reasonable (not more than 7 days ago)
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (newStartTime < sevenDaysAgo) {
        setValidationDialog({
          isOpen: true,
          type: 'old-time',
          selectedDateTime,
        });
        return;
      }

      // If we get here, the time is valid
      handleConfirmUpdate(newDate);
    } catch (error) {
      console.error('Error in handleSubmit:', error, {
        selectedDate,
        selectedTime,
      });
      setValidationDialog({
        isOpen: true,
        type: 'invalid-format',
      });
    }
  };

  const handleConfirmUpdate = (newDate: Date) => {
    onUpdateStartTime(newDate);
    setIsOpen(false);
  };

  const handleConfirmOldTime = () => {
    try {
      // Validate inputs first
      if (!selectedDate || !selectedTime) {
        setValidationDialog({
          isOpen: true,
          type: 'invalid-format',
        });
        return;
      }

      const dateTimeString = `${selectedDate}T${selectedTime}`;
      const newDate = new Date(dateTimeString);

      // Check if the date is valid
      if (isNaN(newDate.getTime())) {
        console.error(
          'Invalid date created in confirmOldTime:',
          dateTimeString,
          newDate
        );
        setValidationDialog({
          isOpen: true,
          type: 'invalid-format',
        });
        return;
      }

      setValidationDialog({ ...validationDialog, isOpen: false });
      handleConfirmUpdate(newDate);
    } catch (error) {
      console.error('Error in handleConfirmOldTime:', error, {
        selectedDate,
        selectedTime,
      });
      setValidationDialog({
        isOpen: true,
        type: 'invalid-format',
      });
    }
  };

  const handleCancel = () => {
    // Reset to current values
    setSelectedDate(format(new Date(currentStartTime), 'yyyy-MM-dd'));
    setSelectedTime(format(new Date(currentStartTime), 'HH:mm'));
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='gap-2 rounded-full'
          style={{ borderRadius: '50px' }}
        >
          <Edit3 className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader className='text-center '>
          <DialogTitle
            className='flex items-start gap-2 text-white text-base sm:text-lg leading-tight -mx-3 sm:-mx-4 -mt-3 sm:-mt-4 px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg mb-1 sm:mb-2'
            style={{
              background: '#4cba98',
            }}
          >
            <Clock className='h-5 w-5' />
            Actualizează Ora de Început a Pauzei Alimentare
          </DialogTitle>
          <DialogDescription>
            Ajustează când ai început de fapt pauza alimentara. Aceasta va
            recalcula progresul tău curent.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='current-time'>Ora Curentă de Start</Label>
            <div className='p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm'>
              {format(new Date(currentStartTime), 'EEEE, dd MMMM yyyy, HH:mm', {
                locale: ro,
              })}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='date'>Data</Label>
              <Input
                id='date'
                type='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='time'>Ora</Label>
              <Input
                id='time'
                type='time'
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Previzualizare Nouă Oră de Start</Label>
            <div className='p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm'>
              {(() => {
                try {
                  const previewDate = new Date(
                    `${selectedDate}T${selectedTime}`
                  );
                  if (isNaN(previewDate.getTime())) {
                    return 'Format invalid';
                  }
                  return format(previewDate, 'EEEE, dd MMMM yyyy, HH:mm', {
                    locale: ro,
                  });
                } catch (error) {
                  console.error('Preview error:', error, {
                    selectedDate,
                    selectedTime,
                  });
                  return 'Format invalid';
                }
              })()}
            </div>
          </div>
        </div>

        <DialogFooter className='flex justify-center text-center gap-3'>
          <Button
            variant='destructive'
            onClick={handleCancel}
            className='rounded-full'
            style={{ borderRadius: '50px' }}
          >
            Anulează
          </Button>
          <Button
            onClick={handleSubmit}
            className='rounded-full  text-white'
            style={{
              borderRadius: '50px',
              background: '#4cba98',
            }}
          >
            Actualizează Ora de Start
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Validation Alert Dialog */}
      <ValidationAlertDialog
        isOpen={validationDialog.isOpen}
        onClose={() =>
          setValidationDialog({ ...validationDialog, isOpen: false })
        }
        onConfirm={
          validationDialog.type === 'old-time'
            ? handleConfirmOldTime
            : undefined
        }
        type={validationDialog.type}
        selectedDateTime={validationDialog.selectedDateTime}
      />
    </Dialog>
  );
}
