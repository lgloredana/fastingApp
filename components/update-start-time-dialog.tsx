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

interface UpdateStartTimeDialogProps {
  currentStartTime: number;
  onUpdateStartTime: (newStartTime: number) => void;
}

export function UpdateStartTimeDialog({
  currentStartTime,
  onUpdateStartTime,
}: UpdateStartTimeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    format(currentStartTime, 'yyyy-MM-dd')
  );
  const [selectedTime, setSelectedTime] = useState(
    format(currentStartTime, 'HH:mm')
  );

  const handleSubmit = () => {
    try {
      // Combine date and time into a timestamp
      const newStartTime = new Date(
        `${selectedDate}T${selectedTime}`
      ).getTime();

      // Validate that the new start time is not in the future
      if (newStartTime > Date.now()) {
        alert('Start time cannot be in the future!');
        return;
      }

      // Validate that the new start time is reasonable (not more than 7 days ago)
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (newStartTime < sevenDaysAgo) {
        if (!confirm('The start time is more than 7 days ago. Are you sure?')) {
          return;
        }
      }

      onUpdateStartTime(newStartTime);
      setIsOpen(false);
    } catch (error) {
      alert('Format de dată/oră invalid');
    }
  };

  const handleCancel = () => {
    // Reset to current values
    setSelectedDate(format(currentStartTime, 'yyyy-MM-dd'));
    setSelectedTime(format(currentStartTime, 'HH:mm'));
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Edit3 className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Actualizează Ora de Început a Postului
          </DialogTitle>
          <DialogDescription>
            Ajustează când ai început de fapt postul. Aceasta va recalcula
            progresul tău curent.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='current-time'>Ora Curentă de Start</Label>
            <div className='p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm'>
              {format(currentStartTime, 'EEEE, dd MMMM yyyy, HH:mm', {
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
              {format(
                new Date(`${selectedDate}T${selectedTime}`),
                'EEEE, dd MMMM yyyy, HH:mm',
                { locale: ro }
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleCancel}>
            Anulează
          </Button>
          <Button onClick={handleSubmit}>Actualizează Ora de Start</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
