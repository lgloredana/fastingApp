'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import Link from 'next/link';
import {
  getFastingHistory,
  getFastingStats,
  exportFastingDataAsFile,
  clearAllData,
  type FastingSession,
} from '@/lib/client-storage';
import { trackHistoryView, trackDataExport, trackDataClear } from '@/lib/analytics';

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

export default function HistoryPage() {
  const [history, setHistory] = useState<FastingSession[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalFastingTime: 0,
    averageFastingTime: 0,
    longestFast: 0,
  });

  useEffect(() => {
    const loadData = () => {
      const fastingHistory = getFastingHistory();
      const fastingStats = getFastingStats();

      setHistory(fastingHistory);
      setStats(fastingStats);
      
      // Track page view
      trackHistoryView();
    };

    loadData();
  }, []);

  const handleExportData = () => {
    exportFastingDataAsFile();
    trackDataExport();
  };

  const handleClearData = () => {
    if (
      confirm(
        'Are you sure you want to clear all fasting data? This cannot be undone.'
      )
    ) {
      clearAllData();
      setHistory([]);
      setStats({
        totalSessions: 0,
        totalFastingTime: 0,
        averageFastingTime: 0,
        longestFast: 0,
      });
      
      // Track analytics event
      trackDataClear();
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2'>
              Istoricul Postului
            </h1>
            <p className='text-lg text-gray-600 dark:text-gray-300'>
              Urmărește-ți progresul și vezi sesiunile trecute
            </p>
          </div>
          <Link href='/'>
            <Button variant='outline'>Înapoi la Monitor</Button>
          </Link>
        </div>

        {/* Statistics Overview */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Statistici Generale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center'>
                <p className='text-3xl font-bold text-primary'>
                  {stats.totalSessions}
                </p>
                <p className='text-sm text-muted-foreground'>Sesiuni Totale</p>
              </div>
              <div className='text-center'>
                <p className='text-3xl font-bold text-primary'>
                  {Math.floor(stats.totalFastingTime / (1000 * 60 * 60))}h
                </p>
                <p className='text-sm text-muted-foreground'>Timp Total</p>
              </div>
              <div className='text-center'>
                <p className='text-3xl font-bold text-primary'>
                  {Math.floor(stats.averageFastingTime / (1000 * 60 * 60))}h
                </p>
                <p className='text-sm text-muted-foreground'>Post Mediu</p>
              </div>
              <div className='text-center'>
                <p className='text-3xl font-bold text-primary'>
                  {Math.floor(stats.longestFast / (1000 * 60 * 60))}h
                </p>
                <p className='text-sm text-muted-foreground'>
                  Cel Mai Lung Post
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className='flex gap-2 mb-6'>
          <Button onClick={handleExportData} variant='outline'>
            Exportă Datele
          </Button>
          <Button onClick={handleClearData} variant='destructive'>
            Șterge Toate Datele
          </Button>
        </div>

        {/* Sessions History */}
        <Card>
          <CardHeader>
            <CardTitle>Istoricul Sesiunilor</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <p>Nu există încă sesiuni de post înregistrate.</p>
                <Link href='/'>
                  <Button className='mt-4'>Începe Primul Tău Post</Button>
                </Link>
              </div>
            ) : (
              <div className='space-y-3'>
                {history.map((session) => (
                  <div
                    key={session.id}
                    className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'
                  >
                    <div className='space-y-1'>
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

                    <div className='text-right'>
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
