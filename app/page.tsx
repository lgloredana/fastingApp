'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  UtensilsCrossed,
} from 'lucide-react';
import { safeFormatDate } from '@/lib/date-utils';
import {
  trackFastingStart,
  trackFastingStop,
  trackUpdateStartTime,
} from '@/lib/analytics';
import Link from 'next/link';
import Image from 'next/image';
import { Info, X, History, Clock, Volume2, Pause, Play } from 'lucide-react';
import { TimerDisplay } from '@/components/timer-display';
import {
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
import { DrinksCarousel } from '@/components/drinks-carousel';
import { InfoContainer } from '@/components/info-container';
import { useVoiceReader } from '@/hooks/use-voice-reader';

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
  textColor: string; // Text color for this phase
  encouragement?: string; // Optional motivational message
}

const FASTING_PHASES: FastingPhase[] = [
  {
    durationHours: 0,
    title: '0–4 ore după ultima masă',
    description:
      'Corpul digeră glucoza din mâncare si e folosită pentru energie. Rezervele rapide de glucoză din ficat și mușchi se reîncarcă. Te simți bine, fără foame. E liniște metabolică.',
    color: '#66BB6A',
    textColor: '#000000', // White text for blue background
    encouragement: 'Ai început. Rămâi constant/ă !',
  },
  {
    durationHours: 4,
    title: 'După 4 ore: Tranziția energetică',
    description:
      'Corpul începe să scoată energie din depozite, funcționează pe baterii interne.',
    color: '#9CCC65',
    textColor: '#000000', // Black text for yellow background
    encouragement: 'Tranziția a început. Ține direcția!',
  },
  {
    durationHours: 5,
    title: 'După 5 ore: Schimbarea combustibilului',
    description:
      'O ușoară foame și scădere de energie, motorul începe să schimbe combustibilul.',
    color: '#FFEB3B',
    textColor: '#000000', // Black text for yellow background
    encouragement: 'Schimbarea e în curs. Respira și continuă.',
  },
  {
    durationHours: 8,
    title: 'După 8 ore: Începe arderea grăsimilor',
    description:
      'Începe arderea grăsimilor, grelina (hormonul foamei) atinge vârf maxim (trece după 20-30 min), primul prag metabolic important.',
    color: '#FF9800',
    textColor: '#FFFFFF', // White text for blue background
    encouragement: 'Primul prag important. Ești mai puternic/ă decât crezi.',
  },
  {
    durationHours: 12,
    title: 'După 12 ore: Grăsimea ca sursă principală',
    description:
      'Grăsimea devine principala sursă de energie, creierul începe să meargă pe mod eco: cetone.',
    color: '#FF5722',
    textColor: '#FFFFFF', // White text for blue background
    encouragement: 'Motorul tău merge pe mod eficient. Bravo!',
  },
  {
    durationHours: 16,
    title: 'După 16 ore: Debutează autofagia',
    description:
      'Autofagia debutează, arderea grăsimilor este la maxim, corpul intră în faza de curățare interioară.',
    color: '#42A5F5',
    textColor: '#000000', // Black text for amber background
    encouragement: 'Curățarea internă a început. Menține ritmul!',
  },
  {
    durationHours: 18,
    title: 'După 18 ore: Autofagie intensă',
    description:
      'Autofagia se intensifică, grăsimile sunt arse la intensitate maximă, se simte o claritate mentală sau ușoară euforie, reparații interioare serioase, corpul face curat.',
    color: '#2196F3',
    textColor: '#FFFFFF', // White text for blue background
    encouragement: 'Claritate și energie. Bucură-te de moment!',
  },
  {
    durationHours: 24,
    title: 'După 24 ore: Echilibru profund',
    description:
      'Stare de echilibru metabolic profund, inflamația sistematică scade, se curăță structuri implicate în îmbătrânire și boli cronice, nivel maxim de autofagie.',
    color: '#3949AB',
    textColor: '#FFFFFF', // White text for dark indigo background
    encouragement: 'Echilibru profund. Corpul îți mulțumește.',
  },
  {
    durationHours: 36,
    title: 'După 36-48 ore: Regenerare și resetare',
    description:
      'Autofagia e profundă, corpul începe regenerarea: tulpini celulare în intestin și sistemul imunitar sunt stimulate, cetonele domină complet: claritate, energie lină, puțină foame, curățare + reconstrucție (resetarea sistemului).',
    color: '#8E24AA',
    textColor: '#FFFFFF', // White text for purple background
    encouragement: 'Regenerare completă. Inspiri putere și disciplină.',
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
  const [isHealthAlertExpanded, setIsHealthAlertExpanded] = useState(true);
  const [isBenefitsCardExpanded, setIsBenefitsCardExpanded] = useState(false);
  const [isHistoryCardExpanded, setIsHistoryCardExpanded] = useState(false);
  const [isPhasesCardExpanded, setIsPhasesCardExpanded] = useState(false);

  // Voice reading for current phase
  const { toggle, isReading, isPaused, isSupported, stop } = useVoiceReader({
    rate: 0.8,
    lang: 'ro-RO',
  });

  // Generate voice text for current phase
  const getCurrentPhaseVoiceText = useCallback(() => {
    let text = `Starea curentă: ${currentPhase.title}. ${currentPhase.description}`;

    if (currentPhase.encouragement) {
      text += ` ${currentPhase.encouragement}`;
    }

    if (fastingStartTime) {
      const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
      const minutes = Math.floor(
        (elapsedTime % (1000 * 60 * 60)) / (1000 * 60)
      );
      text += ` Timp trecut: ${hours} ore și ${minutes} minute.`;
    }

    return text;
  }, [currentPhase, elapsedTime, fastingStartTime]);

  // Handle hydration
  useEffect(() => {
    setMounted(true);

    // Check if health alert was dismissed recently (within 24 hours)
    const healthAlertDismissed = localStorage.getItem('healthAlertDismissed');
    if (healthAlertDismissed) {
      const dismissTime = parseInt(healthAlertDismissed);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (now - dismissTime < twentyFourHours) {
        setIsHealthAlertExpanded(false);
      } else {
        // Remove expired dismissal
        localStorage.removeItem('healthAlertDismissed');
      }
    }
  }, []);

  // Handle health alert collapse with localStorage
  const handleHealthAlertToggle = () => {
    const newState = !isHealthAlertExpanded;
    setIsHealthAlertExpanded(newState);

    // If collapsing, save the dismiss time
    if (!newState) {
      localStorage.setItem('healthAlertDismissed', Date.now().toString());
    } else {
      // If expanding, remove the dismiss record
      localStorage.removeItem('healthAlertDismissed');
    }
  };

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

  const handleUpdateStartTime = useCallback((newTime: Date) => {
    const newStartTime = newTime.getTime();
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

        {/* Cards Container with smaller gap */}
        <div className='space-y-2 mx-4 mb-6'>
          {/* Health Alert Card */}
          <div data-testid='healthAlertCard'>
            <InfoContainer
              title='Informații importante despre pauzele alimentare'
              isExpanded={isHealthAlertExpanded}
              onToggle={handleHealthAlertToggle}
              variant='emerald'
              className='shadow-lg'
              enableVoiceReading={true}
              voiceText='Informații importante despre pauzele alimentare. Pauzele alimentare sunt benefice atunci când sunt adaptate corpului tău. Pauza clasică de peste noapte are în jur de 12 ore și este, de regulă, sigură pentru majoritatea oamenilor. Orice pauză mai lungă de 12 ore poate aduce beneficii suplimentare, dar și riscuri, în funcție de starea de sănătate și nevoile tale. Pe toată durata pauzei este esențial să consumi lichide: apă simplă, apă cu o felie de fruct, ceai neîndulcit, cafea simplă fără zahăr sau lapte. În plus, este important să ai o alimentație echilibrată în ferestrele de mâncare: include legume, surse de proteine și carbohidrați complecși în cantități moderate. Ascultă-ți corpul, oprește pauza dacă apar simptome neplăcute și nu te expune înfometării. Dacă ai probleme medicale sau iei tratamente, consultă medicul înainte de a prelungi pauza.'
            >
              <p>
                <strong>
                  Pauzele alimentare sunt benefice atunci când sunt adaptate
                  corpului tău.
                </strong>
              </p>
              <p>
                Pauza clasică de peste noapte are în jur de 12 ore și este, de
                regulă, sigură pentru majoritatea oamenilor.
              </p>
              <p>
                Orice pauză mai lungă de 12 ore poate aduce beneficii
                suplimentare, dar și riscuri, în funcție de starea de sănătate
                și nevoile tale.
              </p>
              <p>
                <strong>
                  Pe toată durata pauzei este esențial să consumi lichide:
                </strong>
              </p>
              <ul className='space-y-1 pl-4 list-disc'>
                <li>apă simplă</li>
                <li>apă cu o felie de fruct (ex.: lămâie, portocală)</li>
                <li>ceai neîndulcit</li>
                <li>cafea simplă (fără zahăr sau lapte)</li>
              </ul>
              <p>
                În plus, este important să ai o alimentație echilibrată în
                ferestrele de mâncare: include legume, surse de proteine (carne,
                pește, ouă) și carbohidrați complecși în cantități moderate (cum
                ar fi pâinea integrală).
              </p>
              <p>
                <strong>
                  Ascultă-ți corpul, oprește pauza dacă apar simptome neplăcute
                  și nu te expune înfometării.
                </strong>
              </p>
              <p>
                <strong>
                  Dacă ai probleme medicale sau iei tratamente, consultă medicul
                  înainte de a prelungi pauza.
                </strong>
              </p>
            </InfoContainer>
          </div>

          {/* Action Cards - Same style as Health Alert */}
          <div data-testid='actionCards' className='space-y-2'>
            {/* Benefits Card */}
            <InfoContainer
              title='Vezi De Ce e Benefică Pauza Alimentară'
              isExpanded={isBenefitsCardExpanded}
              onToggle={() =>
                setIsBenefitsCardExpanded(!isBenefitsCardExpanded)
              }
              variant='info'
              icon={<Info className='h-6 w-6 text-white flex-shrink-0' />}
              className='shadow-lg'
              enableVoiceReading={true}
              voiceText='Vezi De Ce e Benefică Pauza Alimentară. Descoperă beneficiile științifice ale pauzelor alimentare și cum acestea pot îmbunătăți sănătatea ta.'
            >
              <p>
                Descoperă beneficiile științifice ale pauzelor alimentare și cum
                acestea pot îmbunătăți sănătatea ta.
              </p>
              <Link href='/beneficii'>
                <Button className='mt-3 bg-white/20 hover:bg-white/30 text-white border-white/30'>
                  Citește mai mult
                </Button>
              </Link>
            </InfoContainer>

            {/* History Card */}
            <InfoContainer
              title='Vezi Istoricul Complet'
              isExpanded={isHistoryCardExpanded}
              onToggle={() => setIsHistoryCardExpanded(!isHistoryCardExpanded)}
              variant='purple'
              icon={<History className='h-6 w-6 text-white flex-shrink-0' />}
              className='shadow-lg'
              enableVoiceReading={true}
              voiceText='Vezi Istoricul Complet. Urmărește progresul tău cu o vedere detaliată asupra tuturor sesiunilor de pauză alimentară.'
            >
              <p>
                Urmărește progresul tău cu o vedere detaliată asupra tuturor
                sesiunilor de pauză alimentară.
              </p>
              <Link href='/history'>
                <Button className='mt-3 bg-white/20 hover:bg-white/30 text-white border-white/30'>
                  Vezi istoricul
                </Button>
              </Link>
            </InfoContainer>

            {/* Phases Card */}
            <InfoContainer
              title='Fazele Pauzei Alimentare'
              isExpanded={isPhasesCardExpanded}
              onToggle={() => setIsPhasesCardExpanded(!isPhasesCardExpanded)}
              variant='warning'
              icon={<Clock className='h-6 w-6 text-white flex-shrink-0' />}
              className='shadow-lg lg:hidden'
              enableVoiceReading={true}
              voiceText='Fazele Pauzei Alimentare. Descoperă cum se dezvoltă corpul tău prin diferitele etape ale pauzei alimentare, de la digestie la autofagie și regenerare celulară.'
            >
              <p>
                Descoperă cum se dezvoltă corpul tău prin diferitele etape ale
                pauzei alimentare, de la digestie la autofagie și regenerare
                celulară.
              </p>
              <button
                onClick={() => {
                  const phasesSection = document.getElementById(
                    'mobile-phases-container'
                  );
                  if (phasesSection) {
                    phasesSection.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }
                }}
                className='mt-3 bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-2 rounded-lg transition-colors duration-200 font-medium'
              >
                Vezi fazele →
              </button>
            </InfoContainer>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {/* Current Status - Main Card */}
          <div className='lg:col-span-2'>
            <Card className='h-full relative overflow-hidden p-0'>
              <div
                className='absolute top-0 left-0 right-0 h-1 transition-colors duration-500'
                style={{ backgroundColor: currentPhase.color }}
              />
              <CardContent
                data-testid='cardContentTime'
                className='space-y-8 py-10'
                style={{
                  background: `linear-gradient(135deg, ${currentPhase.color}40`,
                }}
              >
                {/* Timer Display */}
                <TimerDisplay
                  elapsedTime={elapsedTime}
                  fastingStartTime={
                    fastingStartTime ? new Date(fastingStartTime) : undefined
                  }
                  variant='main'
                  onUpdateStartTime={handleUpdateStartTime}
                />

                {/* Current Phase */}
                <div
                  data-testid='currentPahseContainer'
                  className='text-center space-y-4'
                >
                  <div
                    className='mt-6 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl'
                    style={{
                      background: `linear-gradient(135deg, ${currentPhase.color}dd, ${currentPhase.color})`,
                      border: `2px solid ${currentPhase.color}`,
                    }}
                  >
                    <div className='text-center space-y-4'>
                      <div className='bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                        <Stethoscope className='h-8 w-8 text-white' />
                      </div>
                      <div className='flex items-center justify-center gap-3 mb-2'>
                        <p
                          className='text-lg font-semibold'
                          style={{ color: currentPhase.textColor }}
                        >
                          Starea curentă:
                        </p>
                        {isSupported && (
                          <button
                            onClick={() => toggle(getCurrentPhaseVoiceText())}
                            className='p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200'
                            aria-label={
                              isReading
                                ? 'Oprește citirea fazei curente'
                                : 'Citește faza curentă cu vocea'
                            }
                          >
                            {isReading ? (
                              <Pause className='h-5 w-5 text-white' />
                            ) : (
                              <Volume2 className='h-5 w-5 text-white' />
                            )}
                          </button>
                        )}
                      </div>
                      <h2
                        className='text-2xl font-bold text-center max-w-2xl mx-auto px-4 transition-all duration-500'
                        style={{ color: currentPhase.textColor }}
                      >
                        {currentPhase.title}
                      </h2>
                      <div
                        data-testid='descriptionContainer'
                        className='text-base font-medium max-w-2xl mx-auto leading-relaxed bg-white/10 backdrop-blur-sm rounded-lg p-4'
                        style={{ color: currentPhase.textColor }}
                      >
                        {currentPhase.description
                          .split('\n')
                          .map((line, index) => (
                            <p key={index} className='mb-2 last:mb-0'>
                              {line}
                            </p>
                          ))}
                      </div>

                      {fastingStartTime && currentPhase.encouragement && (
                        <div
                          data-testid='encouragementContainer'
                          className='mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg'
                        >
                          <div className='flex items-center gap-3 justify-center'>
                            <span className='text-2xl'>💪</span>
                            <p
                              className='text-lg font-bold text-center'
                              style={{ color: currentPhase.textColor }}
                            >
                              {currentPhase.encouragement}
                            </p>
                          </div>
                        </div>
                      )}
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
                              data-testid='nextPhaseContainer'
                              className='mt-6 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl'
                              style={{
                                background: `linear-gradient(135deg, ${nextPhase.color}dd, ${nextPhase.color})`,
                                border: `2px solid ${nextPhase.color}`,
                              }}
                            >
                              <div className='text-center space-y-4'>
                                <div className='bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                                  <span className='text-2xl'>🎯</span>
                                </div>
                                <p
                                  className='text-lg font-semibold mb-2'
                                  style={{ color: nextPhase.textColor }}
                                >
                                  Următoarea fază
                                </p>
                                <h2
                                  className='text-2xl font-bold text-center max-w-2xl mx-auto px-4 transition-all duration-500'
                                  style={{ color: nextPhase.textColor }}
                                >
                                  {nextPhase.title}
                                </h2>
                                <div className='bg-white/10 backdrop-blur-sm rounded-lg p-4'>
                                  <div
                                    className='flex flex-col sm:flex-row justify-center items-center gap-2 text-base font-medium'
                                    style={{ color: nextPhase.textColor }}
                                  >
                                    <span>
                                      În {Math.floor(hoursUntilNext)}h{' '}
                                      {Math.floor((hoursUntilNext % 1) * 60)}min
                                    </span>
                                    <span className='hidden sm:inline opacity-70'>
                                      •
                                    </span>
                                    <span>
                                      la{' '}
                                      {safeFormatDate(nextPhaseTime, 'HH:mm')}
                                    </span>
                                  </div>
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
                <div data-testid='actionButtons' className='flex w-full gap-4'>
                  {!fastingStartTime ? (
                    <Button
                      data-testid='startButton'
                      onClick={startFasting}
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
                        <Stethoscope className='!h-12 !w-12 flex-shrink-0' />
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
                    <div className='w-full space-y-4'>
                      {/* Drinks Carousel */}
                      <DrinksCarousel />
                      <StopFastingDialog
                        onConfirmStop={stopFasting}
                        fastingStartTime={fastingStartTime}
                        elapsedTime={elapsedTime}
                      />
                    </div>
                  )}
                </div>

                {/* Timer Display under Stop Button - Mobile Only */}
                {fastingStartTime && (
                  <div className='mt-6 sm:hidden'>
                    <TimerDisplay
                      elapsedTime={elapsedTime}
                      fastingStartTime={
                        fastingStartTime
                          ? new Date(fastingStartTime)
                          : undefined
                      }
                      variant='main'
                      onUpdateStartTime={handleUpdateStartTime}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Phase Timeline - Only visible on desktop */}
          <div className='hidden lg:block space-y-6'>
            {/* Next Phases Card */}
            {fastingStartTime && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-xl font-semibold'>
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
                                    className={`font-xl font-semibold  ${
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
                                    className={`text-sm font-semibold ${
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
                              <span className='text-sm font-semibold text-muted-foreground text-left'>
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
                                    <span className='text-xl font-semibold text-green-700 dark:text-green-300'>
                                      În Progres
                                    </span>
                                  </div>
                                  <p className='text-xl font-semibold text-green-600 dark:text-green-400 mt-1'>
                                    Această fază este în desfășurare. Continuă
                                    să fii puternic/ă!
                                  </p>
                                </div>
                              )}
                              <div className='text-xl font-semibold text-gray-700 dark:text-gray-300 space-y-1'>
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
                <CardTitle className='text-xl font-semibold'>
                  Privire de Ansamblu
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between text-xl font-semibold'>
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
        <div className='mt-6 space-y-4'></div>

        {/* Mobile Phases Section - Only visible on mobile */}
        <div id='mobile-phases-container' className='lg:hidden'>
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
