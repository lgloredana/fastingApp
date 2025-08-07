'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronDown,
  ChevronUp,
  HeartIcon,
  Info,
  SmileIcon,
  Stethoscope,
} from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { safeFormatDate } from '@/lib/date-utils';
import {
  trackFastingStart,
  trackFastingStop,
  trackUpdateStartTime,
} from '@/lib/analytics';
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
  color: string; // Color for this phase
}

const FASTING_PHASES: FastingPhase[] = [
  {
    durationHours: 0,
    title: '0–4 ore după ultima masă',
    description:
      'Corpul digeră glucoza din mâncare si e folosită pentru energie.\n Rezervele rapide de glucoză din ficat și mușchi se reîncarcă.\n Te simți bine, fără foame. E liniște metabolică.',
    color: '#FFA726', // Portocaliu cald - digestie activă
  },
  {
    durationHours: 4,
    title: 'După 4 ore: Tranziția energetică',
    description:
      'Corpul începe să scoată energie din depozite, funcționează pe baterii interne.',
    color: '#FDD835', // Galben-muștar - tranziție
  },
  {
    durationHours: 5,
    title: 'După 5 ore: Schimbarea combustibilului',
    description:
      'O ușoară foame și scădere de energie, motorul începe să schimbe combustibilul.',
    color: '#FDD835', // Galben-muștar - tranziție
  },
  {
    durationHours: 8,
    title: 'După 8 ore: Începe arderea grăsimilor',
    description:
      'Începe arderea grăsimilor, grelina atinge vârf maxim (trece după 20-30 min), primul prag metabolic important.',
    color: '#FB8C00', // Chihlimbar - orange închis
  },
  {
    durationHours: 12,
    title: 'După 12 ore: Grăsimea ca sursă principală',
    description:
      'Grăsimea devine principala sursă de energie, creierul începe să meargă pe mod eco: cetone.',
    color: '#FB8C00', // Chihlimbar - orange închis
  },
  {
    durationHours: 16,
    title: 'După 16 ore: Debutează autofagia',
    description:
      'Autofagia debutează, arderea grăsimilor este la maxim, corpul intră în faza de curățare interioară.',
    color: '#42A5F5', // Albastru mediu - autofagie + cetoză
  },
  {
    durationHours: 18,
    title: 'După 18 ore: Autofagie intensă',
    description:
      'Autofagia se intensifică, grăsimile sunt arse la intensitate maximă, se simte o claritate mentală sau ușoară euforie, reparații interioare serioase, corpul face curat.',
    color: '#42A5F5', // Albastru mediu - autofagie + cetoză
  },
  {
    durationHours: 24,
    title: 'După 24 ore: Echilibru profund',
    description:
      'Stare de echilibru metabolic profund, inflamația sistematică scade, se curăță structuri implicate în îmbătrânire și boli cronice, nivel maxim de autofagie.',
    color: '#3949AB', // Indigo închis - autofagie profundă
  },
  {
    durationHours: 36,
    title: 'După 36-48 ore: Regenerare și resetare',
    description:
      'Autofagia e profundă, corpul începe regenerarea: tulpini celulare în intestin și sistemul imunitar sunt stimulate, cetonele domină complet: claritate, energie lină, puțină foame, curățare + reconstrucție (resetarea sistemului).',
    color: '#7E57C2', // Violet profund - regenerare completă
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
  const [expandedDesktopPhase, setExpandedDesktopPhase] = useState<
    number | null
  >(null);
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

    // Track analytics event
    trackFastingStart();

    // Update stats
    const stats = getFastingStats();
    setFastingStats(stats);
  }, []);

  const stopFasting = useCallback(() => {
    if (currentSession) {
      const completedSession = endFastingSession();

      // Track analytics event with duration
      if (completedSession && completedSession.duration) {
        trackFastingStop(completedSession.duration);
      }

      setCurrentSession(null);
      setFastingStartTime(null);

      // Update history and stats
      const history = getFastingHistory();
      const stats = getFastingStats();
      setFastingHistory(history);
      setFastingStats(stats);
    }
  }, [currentSession]);

  const toggleDesktopPhase = (index: number) => {
    setExpandedDesktopPhase(expandedDesktopPhase === index ? null : index);
  };

  // Auto-expand current phase in desktop sidebar and scroll to it
  useEffect(() => {
    if (fastingStartTime) {
      const currentPhaseIndex = FASTING_PHASES.findIndex(
        (phase) => phase.durationHours === currentPhase.durationHours
      );

      // Find the corresponding index in getPredictedPhaseTimes (which excludes durationHours: 0)
      const predictions = getPredictedPhaseTimes(fastingStartTime);
      const predictionIndex = predictions.findIndex(
        (prediction) =>
          prediction.phase.durationHours === currentPhase.durationHours
      );

      if (predictionIndex !== -1) {
        setExpandedDesktopPhase(predictionIndex);

        // Scroll to current phase within the phases container after a short delay
        setTimeout(() => {
          const currentPhaseElement = document.getElementById(
            `desktop-phase-${predictionIndex}`
          );
          const phasesContainer = document.getElementById(
            'desktop-phases-container'
          );

          if (currentPhaseElement && phasesContainer) {
            const containerRect = phasesContainer.getBoundingClientRect();
            const elementRect = currentPhaseElement.getBoundingClientRect();

            // Calculate scroll position to center the element in the container
            const scrollTop =
              phasesContainer.scrollTop +
              (elementRect.top - containerRect.top) -
              containerRect.height / 2 +
              elementRect.height / 2;

            phasesContainer.scrollTo({
              top: scrollTop,
              behavior: 'smooth',
            });
          }
        }, 100);
      }
    }
  }, [currentPhase, fastingStartTime]);

  const handleUpdateStartTime = useCallback((newStartTime: number) => {
    const updatedSession = updateSessionStartTime(newStartTime);
    if (updatedSession) {
      setCurrentSession(updatedSession);
      setFastingStartTime(updatedSession.startTime);

      // Track analytics event
      trackUpdateStartTime();
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
    <div className='min-h-screen bg-gradient-to-br from-light-green-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 '>
      <div className='max-w-7xl mx-auto'>
        {/* Header - Compact */}
        <div className='text-center mb-4 pt-2'>
          <div className='flex items-center justify-center gap-2 w-full py-1 px-4 bg-light-green-200'>
            <Stethoscope className='h-8 w-8 text-light-green-800' />
            <h1 className='text-xl font-semibold text-light-green-800'>
              Monitorul de Pauza Alimentara
            </h1>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {/* Current Status - Main Card */}
          <div className='lg:col-span-2'>
            <Card className='h-full relative overflow-hidden'>
              <div
                className='absolute top-0 left-0 right-0 h-1 transition-colors duration-500'
                style={{ backgroundColor: currentPhase.color }}
              />
              <CardContent className='space-y-8'>
                {/* Timer Display */}
                <div className='text-center'>
                  <p className='text-xl font-semibold text-muted-foreground mb-2'>
                    Timp scurs:
                  </p>
                  <p className='text-6xl md:text-7xl font-extrabold tracking-tight text-primary mb-4'>
                    {formatTime(elapsedTime)}
                  </p>
                  {fastingStartTime && (
                    <div className='text-center'>
                      <p className='text-xl font-semibold text-muted-foreground mb-2'>
                        Început :{' '}
                        {safeFormatDate(fastingStartTime, 'HH:mm, dd MMM')}{' '}
                        <UpdateStartTimeDialog
                          currentStartTime={fastingStartTime}
                          onUpdateStartTime={handleUpdateStartTime}
                        />{' '}
                      </p>
                    </div>
                  )}
                </div>

                {/* Current Phase */}
                <div className='text-center space-y-4'>
                  <div
                    className='mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'
                    style={{ borderColor: currentPhase.color }}
                  >
                    <div className='text-center space-y-2'>
                      <p className='text-xl font-semibold text-muted-foreground mb-2'>
                        Starea curentă:
                      </p>
                      <h2
                        className='text-2xl md:text-3xl lg:text-4xl font-semibold text-center px-4 transition-colors duration-500'
                        style={{ color: currentPhase.color }}
                      >
                        {currentPhase.title}
                      </h2>
                      <div className='text-xl font-semibold text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
                        {currentPhase.description
                          .split('\n')
                          .map((line, index) => (
                            <p key={index} className='mb-2 last:mb-0'>
                              {line}
                            </p>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Next Phase Info */}
                  {fastingStartTime &&
                    (() => {
                      const currentPhaseIndex = FASTING_PHASES.findIndex(
                        (phase) =>
                          phase.durationHours === currentPhase.durationHours
                      );
                      const nextPhase = FASTING_PHASES[currentPhaseIndex + 1];

                      if (nextPhase) {
                        const currentHours = elapsedTime / (1000 * 60 * 60);
                        const hoursUntilNext =
                          nextPhase.durationHours - currentHours;

                        if (hoursUntilNext > 0) {
                          const nextPhaseTime = new Date(
                            fastingStartTime +
                              nextPhase.durationHours * 60 * 60 * 1000
                          );

                          return (
                            <div
                              className='mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'
                              style={{ borderColor: nextPhase.color }}
                            >
                              <div className='text-xl font-semibold text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
                                <p className='text-xl font-semibold'>
                                  🎯 Următoarea fază
                                </p>
                                <h2
                                  className='text-2xl md:text-3xl lg:text-4xl font-semibold text-center px-4 transition-colors duration-500'
                                  style={{ color: nextPhase.color }}
                                >
                                  {nextPhase.title}
                                </h2>
                                <div className='flex flex-col sm:flex-row justify-center items-center gap-2 text-readable-sm '>
                                  <span>
                                    În {Math.floor(hoursUntilNext)}h{' '}
                                    {Math.floor((hoursUntilNext % 1) * 60)}min
                                  </span>
                                  <span className='hidden sm:inline'>•</span>
                                  <span>
                                    la {safeFormatDate(nextPhaseTime, 'HH:mm')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}
                </div>

                {/* Action Buttons */}
                <div className='flex justify-center gap-4 pt-4'>
                  {!fastingStartTime ? (
                    <Button
                      onClick={startFasting}
                      size='lg'
                      className='w-full sm:w-auto px-12 py-8 text-3xl md:text-4xl font-bold text-green-900 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[130px] sm:min-h-[80px]'
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
                        <span className='hidden sm:inline'>
                          Începe Pauza Alimentara
                        </span>
                        <span className='sm:hidden flex flex-col text-center leading-tight'>
                          <span>Începe</span>
                          <span>Pauza</span>
                          <span>Alimentara</span>
                        </span>
                      </div>
                    </Button>
                  ) : (
                    <div className='text-center space-y-4'>
                      <p className='text-readable-base text-muted-foreground'>
                        Sesiunea de pauza alimentara este activă
                      </p>
                      <StopFastingDialog
                        onConfirmStop={stopFasting}
                        fastingStartTime={fastingStartTime}
                        elapsedTime={elapsedTime}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Phase Timeline - Only visible on desktop */}
          <div className='hidden lg:block space-y-6'>
            {/* Next Phases Card */}
            {fastingStartTime && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-readable-xl'>
                    Toate Fazele de Pauza Alimentara
                  </CardTitle>
                </CardHeader>
                <CardContent
                  id='desktop-phases-container'
                  className='space-y-3 max-h-[600px] overflow-y-auto'
                >
                  {getPredictedPhaseTimes(fastingStartTime).map(
                    (prediction, index) => {
                      const currentHours = elapsedTime / (1000 * 60 * 60);
                      const isActive =
                        currentHours >= prediction.phase.durationHours;
                      const isNext = !isActive && index === 0;
                      const isExpanded = expandedDesktopPhase === index;

                      // Find the current phase index in the full FASTING_PHASES array
                      const currentPhaseIndex = FASTING_PHASES.findIndex(
                        (phase) =>
                          phase.durationHours === currentPhase.durationHours
                      );

                      // Map the prediction index to the actual FASTING_PHASES index
                      // Since getPredictedPhaseTimes excludes phase with durationHours: 0
                      const actualPhaseIndex = FASTING_PHASES.findIndex(
                        (phase) =>
                          phase.durationHours === prediction.phase.durationHours
                      );

                      const isCurrent = actualPhaseIndex === currentPhaseIndex;

                      return (
                        <div
                          key={index}
                          id={`desktop-phase-${index}`}
                          className='space-y-2'
                        >
                          <Button
                            variant='ghost'
                            className='w-full p-0 h-auto justify-start hover:bg-transparent'
                            onClick={() => toggleDesktopPhase(index)}
                          >
                            <div
                              className={`relative flex flex-col space-y-1 p-3 rounded-lg cursor-pointer transition-colors overflow-hidden w-full ${
                                isCurrent
                                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 border-2'
                                  : isActive
                                  ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                                  : isNext
                                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                                  : 'bg-gray-50 dark:bg-gray-800'
                              }`}
                            >
                              <div
                                className='absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300'
                                style={{
                                  backgroundColor: prediction.phase.color,
                                }}
                              />
                              <div className='flex items-center justify-between w-full'>
                                <div className='flex items-center justify-between flex-1'>
                                  <span
                                    className={`font-medium text-readable-base ${
                                      isCurrent
                                        ? 'text-green-700 dark:text-green-300'
                                        : isActive
                                        ? 'text-green-800 dark:text-green-200'
                                        : isNext
                                        ? 'text-blue-800 dark:text-blue-200'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    {prediction.phase.title.split(':')[0]}
                                  </span>
                                  <span
                                    className={`text-readable-sm ${
                                      isCurrent
                                        ? 'text-green-600 dark:text-green-300'
                                        : isActive
                                        ? 'text-green-600 dark:text-green-300'
                                        : isNext
                                        ? 'text-blue-600 dark:text-blue-300'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {isCurrent
                                      ? '🎉 În Progres'
                                      : isActive
                                      ? '✓ Completă'
                                      : prediction.predictedTime}
                                  </span>
                                </div>
                                <div className='ml-2'>
                                  {isExpanded ? (
                                    <ChevronUp className='h-4 w-4 opacity-60' />
                                  ) : (
                                    <ChevronDown className='h-4 w-4 opacity-60' />
                                  )}
                                </div>
                              </div>
                              <span className='text-readable-sm text-muted-foreground text-left'>
                                {prediction.phase.durationHours}h mark
                              </span>
                            </div>
                          </Button>

                          {isExpanded && (
                            <div
                              className={`px-3 py-2 rounded-lg ml-4 ${
                                isCurrent
                                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                  : 'bg-gray-50 dark:bg-gray-800'
                              }`}
                            >
                              {isCurrent && (
                                <div className='mb-3 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700'>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-lg'>🎉</span>
                                    <span className='text-readable-base font-medium text-green-700 dark:text-green-300'>
                                      În Progres
                                    </span>
                                  </div>
                                  <p className='text-readable-sm text-green-600 dark:text-green-400 mt-1'>
                                    Această fază este în desfășurare. Continuă
                                    să fii puternic/ă!
                                  </p>
                                </div>
                              )}
                              <div className='text-readable-base text-gray-700 dark:text-gray-300 space-y-1'>
                                {prediction.phase.description
                                  .split('\n')
                                  .map((line, lineIndex) => (
                                    <p
                                      key={lineIndex}
                                      className='leading-relaxed'
                                    >
                                      {line}
                                    </p>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </CardContent>
              </Card>
            )}

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className='text-readable-xl'>
                  Privire de Ansamblu
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between text-readable-base'>
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
                      <span>Ore de Pauza Alimentara:</span>
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
                    <span>Pauza Alimentara Medie:</span>
                    <span className='font-medium'>
                      {formatTime(fastingStats.averageFastingTime)}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Cea Mai Lungă Pauza Alimentara:</span>
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

        {/* Action Buttons Section - Outside of grid */}
        <div className='mt-6 space-y-4'>
          {/* History Button Section */}
          <div className='flex justify-center'>
            <Link href='/history'>
              <Button
                variant='outline'
                size='lg'
                className='px-6 py-3 text-readable-base'
              >
                📊 Vezi Istoricul Complet
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Phases Section - Only visible on mobile */}
        <div className='lg:hidden mt-6'>
          <MobileFastingPhases
            phases={FASTING_PHASES}
            currentPhaseIndex={FASTING_PHASES.findIndex(
              (phase) => phase.durationHours === currentPhase.durationHours
            )}
            elapsedHours={elapsedTime / (1000 * 60 * 60)}
          />
        </div>
      </div>
    </div>
  );
}
