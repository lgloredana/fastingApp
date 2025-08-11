'use client';

import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { UpdateStartTimeDialog } from './update-start-time-dialog';

interface TimerDisplayProps {
  elapsedTime: number; // in milliseconds
  fastingStartTime?: Date;
  variant?: 'main' | 'dialog';
  onUpdateStartTime?: (newTime: Date) => void;
}

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const safeFormatDate = (date: Date | null, formatString: string): string => {
  if (!date) return '';
  try {
    return format(date, formatString, { locale: ro });
  } catch (error) {
    return '';
  }
};

export function TimerDisplay({
  elapsedTime,
  fastingStartTime,
  variant = 'main',
  onUpdateStartTime,
}: TimerDisplayProps) {
  if (variant === 'dialog') {
    return (
      <div data-testid='timerDisplay' className='text-center mb-3'>
        <p className='text-xs sm:text-sm text-muted-foreground mb-1'>
          Sesiunea Curentă
        </p>
        <p className='text-lg sm:text-xl md:text-2xl font-bold text-primary tabular-nums'>
          {formatTime(elapsedTime)}
        </p>
      </div>
    );
  }

  return (
    <div data-testid='timerDisplay' className='text-center'>
      <p className='text-xl font-semibold text-muted-foreground mb-2'>
        Timp scurs:
      </p>
      <p className='text-6xl md:text-7xl font-extrabold tracking-tight text-primary mb-4'>
        {formatTime(elapsedTime)}
      </p>
      {fastingStartTime && (
        <div className='text-center'>
          <p className='text-xl font-semibold text-muted-foreground mb-2'>
            Început : {safeFormatDate(fastingStartTime, 'HH:mm, dd MMM')}{' '}
            {onUpdateStartTime && (
              <UpdateStartTimeDialog
                currentStartTime={fastingStartTime}
                onUpdateStartTime={onUpdateStartTime}
              />
            )}{' '}
          </p>
        </div>
      )}
    </div>
  );
}
