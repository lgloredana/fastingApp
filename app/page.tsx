'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { safeFormatDate } from '@/lib/date-utils';
import Link from 'next/link';
import {
  readFastingData,
  startFastingSession,
  endFastingSession,
  getCurrentSession,
  getFastingHistory,
  getFastingStats,
  exportFastingDataAsFile,
  updateSessionStartTime,
  type FastingSession,
} from '@/lib/client-storage';
import { UpdateStartTimeDialog } from '@/components/update-start-time-dialog';
import { StopFastingDialog } from '@/components/stop-fasting-dialog';
import { MobileFastingPhases } from '@/components/mobile-fasting-phases';

/**
 * Helper function to format milliseconds into HH:MM:SS.
 */
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

interface FastingPhase {
  title: string;
  description: string;
  durationHours: number; // Added duration in hours for calculation
}

const FASTING_PHASES: FastingPhase[] = [
  {
    durationHours: 0,
    title: '0–4 ore după ultima masă',
    description:
      '- Corpul digeră glucoza din mâncare si e folosită pentru energie.\n- Rezervele rapide de glucoză din ficat și mușchi se reîncarcă.\n- Te simți bine, fără foame. E liniște metabolică.',
  },
  {
    durationHours: 4,
    title: 'După 4 ore: Tranziția energetică',
    description:
      'Corpul începe să scoată energie din depozite, funcționează pe baterii interne.',
  },
  {
    durationHours: 5,
    title: 'După 5 ore: Schimbarea combustibilului',
    description:
      'O ușoară foame și scădere de energie, motorul începe să schimbe combustibilul.',
  },
  {
    durationHours: 8,
    title: 'După 8 ore: Începe arderea grăsimilor',
    description:
      'Începe arderea grăsimilor, grelina atinge vârf maxim (trece după 20-30 min), primul prag metabolic important.',
  },
  {
    durationHours: 12,
    title: 'După 12 ore: Grăsimea ca sursă principală',
    description:
      'Grăsimea devine principala sursă de energie, creierul începe să meargă pe mod eco: cetone.',
  },
  {
    durationHours: 16,
    title: 'După 16 ore: Debutează autofagia',
    description:
      'Autofagia debutează, arderea grăsimilor este la maxim, corpul intră în faza de curățare interioară.',
  },
  {
    durationHours: 18,
    title: 'După 18-20 ore: Autofagie intensă',
    description:
      'Autofagia se intensifică, grăsimile sunt arse la intensitate maximă, se simte o claritate mentală sau ușoară euforie, reparații interioare serioase, corpul face curat.',
  },
  {
    durationHours: 24,
    title: 'După 24 ore: Echilibru profund',
    description:
      'Stare de echilibru metabolic profund, inflamația sistematică scade, se curăță structuri implicate în îmbătrânire și boli cronice, nivel maxim de autofagie.',
  },
  {
    durationHours: 36,
    title: 'După 36-48 ore: Regenerare și resetare',
    description:
      'Autofagia e profundă, corpul începe regenerarea: tulpini celulare în intestin și sistemul imunitar sunt stimulate, cetonele domină complet: claritate, energie lină, puțină foame, curățare + reconstrucție (resetarea sistemului).',
  },
];

const getFastingPhase = (hours: number): FastingPhase => {
  // Special case for the first 4 hours
  if (hours < 4) {
    return FASTING_PHASES[0]; // 0-4 hours phase
  }

  for (let i = FASTING_PHASES.length - 1; i >= 0; i--) {
    if (hours >= FASTING_PHASES[i].durationHours) {
      return FASTING_PHASES[i];
    }
  }
  return FASTING_PHASES[0];
};

const getPredictedPhaseTimes = (
  startTime: number | null
): { phase: FastingPhase; predictedTime: string }[] => {
  if (!startTime) {
    return [];
  }

  const predictions: { phase: FastingPhase; predictedTime: string }[] = [];
  FASTING_PHASES.forEach((phase) => {
    if (phase.durationHours > 0) {
      const predictedTimestamp =
        startTime + phase.durationHours * 60 * 60 * 1000;
      predictions.push({
        phase: phase,
        predictedTime: safeFormatDate(predictedTimestamp, 'HH:mm, dd MMM'),
      });
    }
  });
  return predictions;
};

export default function FastingTracker() {
  const [mounted, setMounted] = useState(false);
  const [fastingStartTime, setFastingStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<FastingPhase>(
    getFastingPhase(0)
  );
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(
    null
  );
  const [fastingHistory, setFastingHistory] = useState<FastingSession[]>([]);
  const [fastingStats, setFastingStats] = useState({
    totalSessions: 0,
    totalFastingTime: 0,
    averageFastingTime: 0,
    longestFast: 0,
  });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load data from storage on component mount
  useEffect(() => {
    if (!mounted) return;

    const loadData = () => {
      const session = getCurrentSession();
      const history = getFastingHistory();
      const stats = getFastingStats();

      setCurrentSession(session);
      setFastingHistory(history);
      setFastingStats(stats);

      if (session) {
        setFastingStartTime(session.startTime);
      }
    };

    loadData();
  }, [mounted]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (fastingStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const newElapsedTime = now - fastingStartTime;
        setElapsedTime(newElapsedTime);
        setCurrentPhase(getFastingPhase(newElapsedTime / (1000 * 60 * 60)));
      }, 1000);
    } else {
      setElapsedTime(0);
      setCurrentPhase(getFastingPhase(0));
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fastingStartTime]);

  const startFasting = useCallback(() => {
    const session = startFastingSession();
    setCurrentSession(session);
    setFastingStartTime(session.startTime);

    // Update stats
    const stats = getFastingStats();
    setFastingStats(stats);
  }, []);

  const stopFasting = useCallback(() => {
    if (currentSession) {
      const completedSession = endFastingSession();
      setCurrentSession(null);
      setFastingStartTime(null);

      // Update history and stats
      const history = getFastingHistory();
      const stats = getFastingStats();
      setFastingHistory(history);
      setFastingStats(stats);
    }
  }, [currentSession]);

  const handleUpdateStartTime = useCallback((newStartTime: number) => {
    const updatedSession = updateSessionStartTime(newStartTime);
    if (updatedSession) {
      setCurrentSession(updatedSession);
      setFastingStartTime(updatedSession.startTime);
    }
  }, []);

  // Prevent hydration mismatch by not rendering time-sensitive content until mounted
  if (!mounted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 dark:text-white'>
              Fasting Tracker
            </h1>
            <p className='text-lg text-gray-600 dark:text-gray-300'>
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex-1'></div>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 dark:text-white'>
              Monitorul de Post
            </h1>
            <div className='flex-1 flex justify-end'>
              <Link href='/history'>
                <Button variant='outline'>Vezi Istoricul</Button>
              </Link>
            </div>
          </div>
          <p className='text-lg text-gray-600 dark:text-gray-300'>
            Urmărește-ți călătoria de post intermitent și fazele acestuia
          </p>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Current Status - Main Card */}
          <div className='lg:col-span-2'>
            <Card className='h-full'>
              <CardHeader>
                <CardTitle className='text-2xl font-bold text-center'>
                  Starea Curentă
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-8'>
                {/* Timer Display */}
                <div className='text-center'>
                  <p className='text-xl text-muted-foreground mb-2'>
                    Timp scurs:
                  </p>
                  <p className='text-6xl md:text-7xl font-extrabold tracking-tight text-primary mb-4'>
                    {formatTime(elapsedTime)}
                  </p>
                  {fastingStartTime && (
                    <div className='text-center'>
                      <p className='text-sm text-muted-foreground mb-2'>
                        Început:{' '}
                        {safeFormatDate(fastingStartTime, 'HH:mm, dd MMM')}
                      </p>
                      <UpdateStartTimeDialog
                        currentStartTime={fastingStartTime}
                        onUpdateStartTime={handleUpdateStartTime}
                      />
                    </div>
                  )}
                </div>

                {/* Current Phase */}
                <TooltipProvider>
                  <div className='text-center space-y-4'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h2 className='text-2xl md:text-3xl font-semibold cursor-help text-center px-4'>
                          {currentPhase.title}
                        </h2>
                      </TooltipTrigger>
                      <TooltipContent className='max-w-md text-center'>
                        <div>
                          {currentPhase.description
                            .split('\n')
                            .map((line, index) => (
                              <p key={index} className='mb-1 last:mb-0'>
                                {line}
                              </p>
                            ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    <div className='text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
                      {currentPhase.description
                        .split('\n')
                        .map((line, index) => (
                          <p key={index} className='mb-2 last:mb-0'>
                            {line}
                          </p>
                        ))}
                    </div>
                  </div>
                </TooltipProvider>

                {/* Action Buttons */}
                <div className='flex justify-center gap-4 pt-4'>
                  {!fastingStartTime ? (
                    <Button
                      onClick={startFasting}
                      size='lg'
                      className='px-8 py-3 text-lg'
                    >
                      Începe Fastingul
                    </Button>
                  ) : (
                    <StopFastingDialog
                      onConfirmStop={stopFasting}
                      fastingStartTime={fastingStartTime}
                      elapsedTime={elapsedTime}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Phases Section - Only visible on mobile */}
          <MobileFastingPhases
            phases={FASTING_PHASES}
            currentPhaseIndex={FASTING_PHASES.findIndex(
              (phase) => phase.durationHours === currentPhase.durationHours
            )}
            elapsedHours={elapsedTime / (1000 * 60 * 60)}
          />

          {/* Sidebar - Phase Timeline */}
          <div className='space-y-6'>
            {/* Next Phases Card */}
            {fastingStartTime && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-xl'>Fazele Urmățoare</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <TooltipProvider>
                    {getPredictedPhaseTimes(fastingStartTime)
                      .slice(0, 5)
                      .map((prediction, index) => {
                        const currentHours = elapsedTime / (1000 * 60 * 60);
                        const isActive =
                          currentHours >= prediction.phase.durationHours;
                        const isNext = !isActive && index === 0;

                        return (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <div
                                className={`flex flex-col space-y-1 p-3 rounded-lg cursor-help transition-colors ${
                                  isActive
                                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                                    : isNext
                                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                                    : 'bg-gray-50 dark:bg-gray-800'
                                }`}
                              >
                                <div className='flex items-center justify-between'>
                                  <span
                                    className={`font-medium text-sm ${
                                      isActive
                                        ? 'text-green-800 dark:text-green-200'
                                        : isNext
                                        ? 'text-blue-800 dark:text-blue-200'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    {prediction.phase.title.split(':')[0]}
                                  </span>
                                  <span
                                    className={`text-xs ${
                                      isActive
                                        ? 'text-green-600 dark:text-green-300'
                                        : isNext
                                        ? 'text-blue-600 dark:text-blue-300'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {isActive
                                      ? '✓ Completă'
                                      : prediction.predictedTime}
                                  </span>
                                </div>
                                <span className='text-xs text-muted-foreground'>
                                  {prediction.phase.durationHours}h mark
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className='max-w-xs text-center'>
                              <div>
                                {prediction.phase.description
                                  .split('\n')
                                  .map((line, index) => (
                                    <p
                                      key={index}
                                      className='mb-1 last:mb-0 text-sm'
                                    >
                                      {line}
                                    </p>
                                  ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                  </TooltipProvider>
                </CardContent>
              </Card>
            )}

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Privire de Ansamblu</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Faza Curentă</span>
                    <span className='font-medium'>
                      {Math.floor(elapsedTime / (1000 * 60 * 60))}h
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700'>
                    <div
                      className='bg-primary h-2 rounded-full transition-all duration-1000'
                      style={{
                        width: `${Math.min(
                          100,
                          (elapsedTime / (1000 * 60 * 60) / 48) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>0h</span>
                    <span>48h</span>
                  </div>
                </div>

                <div className='pt-2 border-t'>
                  <div className='text-sm space-y-1'>
                    <div className='flex justify-between'>
                      <span>Timp Total:</span>
                      <span className='font-mono'>
                        {formatTime(elapsedTime)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Ore de Post:</span>
                      <span className='font-mono'>
                        {(elapsedTime / (1000 * 60 * 60)).toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {fastingStartTime && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-xl'>Sesiunea Curentă</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='grid grid-cols-2 gap-4 text-center'>
                    <div className='space-y-1'>
                      <p className='text-2xl font-bold text-primary'>
                        {Math.floor(elapsedTime / (1000 * 60 * 60))}
                      </p>
                      <p className='text-xs text-muted-foreground'>Ore</p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-2xl font-bold text-primary'>
                        {Math.floor(elapsedTime / (1000 * 60))}
                      </p>
                      <p className='text-xs text-muted-foreground'>Minute</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overall Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Statistici</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Sesiuni Totale:</span>
                    <span className='font-medium'>
                      {fastingStats.totalSessions}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Timp Total:</span>
                    <span className='font-medium'>
                      {formatTime(fastingStats.totalFastingTime)}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Post Mediu:</span>
                    <span className='font-medium'>
                      {formatTime(fastingStats.averageFastingTime)}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Cel Mai Lung Post:</span>
                    <span className='font-medium'>
                      {formatTime(fastingStats.longestFast)}
                    </span>
                  </div>
                </div>

                <div className='pt-2 border-t'>
                  <Button
                    onClick={exportFastingDataAsFile}
                    variant='outline'
                    size='sm'
                    className='w-full'
                  >
                    Exportă Datele
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent History */}
            {fastingHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-xl'>Sesiuni Recente</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {fastingHistory.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className='p-2 bg-gray-50 dark:bg-gray-800 rounded-lg'
                    >
                      <div className='flex justify-between text-sm'>
                        <span>
                          {safeFormatDate(session.startTime, 'dd MMM')}
                        </span>
                        <span className='font-medium'>
                          {session.duration
                            ? formatTime(session.duration)
                            : 'În Desfășurare'}
                        </span>
                      </div>
                      {session.duration && (
                        <div className='text-xs text-muted-foreground'>
                          {(session.duration / (1000 * 60 * 60)).toFixed(1)}h
                          fast
                        </div>
                      )}
                    </div>
                  ))}

                  {fastingHistory.length > 3 && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
