'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { safeFormatDate } from '@/lib/date-utils';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import type { FastingSession } from '@/lib/client-storage';

interface RecentHistoryCardProps {
  fastingHistory: FastingSession[];
  showAll?: boolean;
  title?: string;
  onDeleteSession?: (sessionId: string) => void;
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

export function RecentHistoryCard({
  fastingHistory,
  showAll = false,
  title = 'Sesiuni Recente',
  onDeleteSession,
}: RecentHistoryCardProps) {
  const [deletingSessionIds, setDeletingSessionIds] = useState<Set<string>>(
    new Set()
  );

  const handleDeleteClick = (sessionId: string) => {
    if (confirm('Ești sigur că vrei să ștergi această sesiune?')) {
      // Start the animation
      setDeletingSessionIds((prev) => new Set([...prev, sessionId]));

      // Wait for animation to complete before actually deleting
      setTimeout(() => {
        onDeleteSession?.(sessionId);
        setDeletingSessionIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(sessionId);
          return newSet;
        });
      }, 300); // Animation duration
    }
  };
  if (fastingHistory.length === 0) {
    return (
      <Card data-testid='history-card'>
        <CardHeader>
          <CardTitle className='text-xl'>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            <p>Nu există încă sesiuni de pauza alimentara înregistrate.</p>
            <Link href='/'>
              <Button className='mt-4'>Începe Prima Ta Pauza Alimentara</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sessionsToShow = showAll ? fastingHistory : fastingHistory.slice(0, 3);

  return (
    <Card data-testid='history-card'>
      <CardHeader>
        <CardTitle className='text-xl'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {sessionsToShow.map((session) => {
          const isDeleting = deletingSessionIds.has(session.id);
          return (
            <div
              key={session.id}
              className={`
                ${
                  showAll
                    ? 'flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'
                    : 'flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg'
                }
                transition-all duration-300 ease-in-out
                ${
                  isDeleting
                    ? 'opacity-0 scale-95 -translate-y-2 max-h-0 py-0 my-0 overflow-hidden'
                    : 'opacity-100 scale-100 translate-y-0'
                }
              `}
              style={{
                maxHeight: isDeleting ? '0px' : showAll ? '200px' : '100px',
                marginBottom: isDeleting ? '0px' : '8px',
                paddingTop: isDeleting ? '0px' : undefined,
                paddingBottom: isDeleting ? '0px' : undefined,
              }}
            >
              {showAll ? (
                // Full history page layout
                <>
                  <div className='space-y-1 flex-1'>
                    <div className='font-medium'>
                      {format(session.startTime, 'EEEE, dd MMMM yyyy', {
                        locale: ro,
                      })}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Început:{' '}
                      {format(session.startTime, 'HH:mm', { locale: ro })}
                      {session.endTime && (
                        <span>
                          {' '}
                          • Terminat:{' '}
                          {format(session.endTime, 'HH:mm', { locale: ro })}
                        </span>
                      )}
                    </div>
                    {session.notes && (
                      <div className='text-sm text-muted-foreground'>
                        Notes: {session.notes}
                      </div>
                    )}
                  </div>
                  <div className='text-right flex items-center gap-3'>
                    <div>
                      <div className='text-2xl font-bold text-primary'>
                        {session.duration
                          ? formatTime(session.duration)
                          : 'În Desfășurare'}
                      </div>
                      {session.duration && (
                        <div className='text-sm text-muted-foreground'>
                          {(session.duration / (1000 * 60 * 60)).toFixed(1)} ore
                        </div>
                      )}
                    </div>
                    {onDeleteSession && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteClick(session.id)}
                        disabled={isDeleting}
                        className='text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                // Recent sessions compact layout
                <>
                  <div className='flex-1'>
                    <div className='flex justify-between text-sm'>
                      <span>{safeFormatDate(session.startTime, 'dd MMM')}</span>
                      <span className='font-medium'>
                        {session.duration
                          ? formatTime(session.duration)
                          : 'În Desfășurare'}
                      </span>
                    </div>
                    {session.duration && (
                      <div className='text-xs text-muted-foreground'>
                        {(session.duration / (1000 * 60 * 60)).toFixed(1)}h fast
                      </div>
                    )}
                  </div>
                  {onDeleteSession && (
                    <div className='ml-2 flex items-center'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteClick(session.id)}
                        disabled={isDeleting}
                        className='text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 disabled:opacity-50'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {!showAll && fastingHistory.length > 3 && (
          <div className='text-center pt-2'>
            <Link href='/history'>
              <Button variant='ghost' size='sm' className='text-xs'>
                Vezi Toate {fastingHistory.length} Sesiunile
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
