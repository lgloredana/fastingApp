"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";

import { DrinksCarousel } from "@/components/drinks-carousel";
import { InfoContainer } from "@/components/info-container";
import { MobileFastingPhases } from "@/components/mobile-fasting-phases";
import { NotificationTestPanel } from "@/components/notification-test-panel";
import { PhaseTestPanel } from "@/components/phase-test-panel";
import { RecentHistoryCard } from "@/components/recent-history-card";
import { StopFastingDialog } from "@/components/stop-fasting-dialog";
import { TimerDisplay } from "@/components/timer-display";
import { UserSwitcher } from "@/components/user-switcher";
import { useNotifications } from "@/hooks/use-notifications";
import { usePhaseNotifications } from "@/hooks/use-phase-notifications";
import { useVoiceReader } from "@/hooks/use-voice-reader";
import {
  trackFastingStart,
  trackFastingStop,
  trackUpdateStartTime,
} from "@/lib/analytics";
import {
  deleteFastingSession,
  endFastingSession,
  exportFastingDataAsFile,
  getCurrentSession,
  getFastingHistory,
  getFastingStats,
  startFastingSession,
  updateSessionStartTime,
  type FastingSession,
} from "@/lib/client-storage";
import { safeFormatDate } from "@/lib/date-utils";
import {
  Bell,
  BellOff,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Info,
  Menu,
  Pause,
  Stethoscope,
  UtensilsCrossed,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Helper function to format milliseconds into HH:MM:SS.
 */
const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;
};

interface FastingPhase {
  id: string; // Unique identifier for notifications
  title: string;
  description: string;
  durationHours: number; // Added duration in hours for calculation
  color: string; // Color for this phase
  textColor: string; // Text color for this phase
  encouragement?: string; // Optional motivational message
}

const FASTING_PHASES: FastingPhase[] = [
  {
    id: "phase-1",
    durationHours: 0,
    title: "0–4 ore după ultima masă",
    description:
      "Corpul digeră glucoza din mâncare si e folosită pentru energie. Rezervele rapide de glucoză din ficat și mușchi se reîncarcă. Te simți bine, fără foame. E liniște metabolică.",
    color: "#66BB6A",
    textColor: "#000000", // White text for blue background
    encouragement: "Ai început. Rămâi constant/ă !",
  },
  {
    id: "phase-2",
    durationHours: 4,
    title: "După 4 ore: Tranziția energetică",
    description:
      "Corpul începe să scoată energie din depozite, funcționează pe baterii interne.",
    color: "#9CCC65",
    textColor: "#000000", // Black text for yellow background
    encouragement: "Tranziția a început. Ține direcția!",
  },
  {
    id: "phase-3",
    durationHours: 5,
    title: "După 5 ore: Schimbarea combustibilului",
    description:
      "O ușoară foame și scădere de energie, motorul începe să schimbe combustibilul.",
    color: "#FFEB3B",
    textColor: "#000000", // Black text for yellow background
    encouragement: "Schimbarea e în curs. Respira și continuă.",
  },
  {
    id: "phase-4",
    durationHours: 8,
    title: "După 8 ore: Începe arderea grăsimilor",
    description:
      "Începe arderea grăsimilor, grelina (hormonul foamei) atinge vârf maxim (trece după 20-30 min), primul prag metabolic important.",
    color: "#FF9800",
    textColor: "#FFFFFF", // White text for blue background
    encouragement: "Primul prag important. Ești mai puternic/ă decât crezi.",
  },
  {
    id: "phase-5",
    durationHours: 12,
    title: "După 12 ore: Grăsimea ca sursă principală",
    description:
      "Grăsimea devine principala sursă de energie, creierul începe să meargă pe mod eco: cetone.",
    color: "#FF5722",
    textColor: "#FFFFFF", // White text for blue background
    encouragement: "Motorul tău merge pe mod eficient. Bravo!",
  },
  {
    id: "phase-6",
    durationHours: 16,
    title: "După 16 ore: Debutează autofagia",
    description:
      "Autofagia debutează, arderea grăsimilor este la maxim, corpul intră în faza de curățare interioară.",
    color: "#42A5F5",
    textColor: "#000000", // Black text for amber background
    encouragement: "Curățarea internă a început. Menține ritmul!",
  },
  {
    id: "phase-7",
    durationHours: 18,
    title: "După 18 ore: Autofagie intensă",
    description:
      "Autofagia se intensifică, grăsimile sunt arse la intensitate maximă, se simte o claritate mentală sau ușoară euforie, reparații interioare serioase, corpul face curat.",
    color: "#2196F3",
    textColor: "#FFFFFF", // White text for blue background
    encouragement: "Claritate și energie. Bucură-te de moment!",
  },
  {
    id: "phase-8",
    durationHours: 24,
    title: "După 24 ore: Echilibru profund",
    description:
      "Stare de echilibru metabolic profund, inflamația sistematică scade, se curăță structuri implicate în îmbătrânire și boli cronice, nivel maxim de autofagie.",
    color: "#3949AB",
    textColor: "#FFFFFF", // White text for dark indigo background
    encouragement: "Echilibru profund. Corpul îți mulțumește.",
  },
  {
    id: "phase-9",
    durationHours: 36,
    title: "După 36-48 ore: Regenerare și resetare",
    description:
      "Autofagia e profundă, corpul începe regenerarea: tulpini celulare în intestin și sistemul imunitar sunt stimulate, cetonele domină complet: claritate, energie lină, puțină foame, curățare + reconstrucție (resetarea sistemului).",
    color: "#8E24AA",
    textColor: "#FFFFFF", // White text for purple background
    encouragement: "Regenerare completă. Inspiri putere și disciplină.",
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
  startTime: number | null,
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
        predictedTime: safeFormatDate(predictedTimestamp, "HH:mm, dd MMM"),
      });
    }
  });
  return predictions;
};

export default function FastingTracker() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [fastingStartTime, setFastingStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<FastingPhase>(
    getFastingPhase(0),
  );
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(
    null,
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
  const [isBenefitsCardExpanded, setIsBenefitsCardExpanded] = useState(false);
  const [isPhasesCardExpanded, setIsPhasesCardExpanded] = useState(false);
  const [isActionsExpanded, setIsActionsExpanded] = useState(false);

  // Voice reading for current phase
  const { toggle, isReading, isPaused, isSupported, stop } = useVoiceReader({
    rate: 0.8,
    lang: "ro-RO",
  });

  // Notifications hooks
  const notifications = useNotifications();

  // Phase notifications hook
  usePhaseNotifications({
    currentPhase,
    fastingStartTime,
    isActive: !!currentSession,
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
        (elapsedTime % (1000 * 60 * 60)) / (1000 * 60),
      );
      text += ` Timp trecut: ${hours} ore și ${minutes} minute.`;
    }

    return text;
  }, [currentPhase, elapsedTime, fastingStartTime]);

  // Handle hydration
  useEffect(() => {
    setMounted(true);

    // Suppress Chrome extension errors
    if (
      typeof window !== "undefined" &&
      window.chrome &&
      window.chrome.runtime
    ) {
      const originalError = console.error;
      console.error = (...args) => {
        if (
          args[0] &&
          args[0].includes &&
          args[0].includes("Could not establish connection")
        ) {
          // Suppress Chrome extension connection errors
          return;
        }
        originalError.apply(console, args);
      };
    }

    // Check if health alert was dismissed recently (within 24 hours)
    const healthAlertDismissed = localStorage.getItem("healthAlertDismissed");
    if (healthAlertDismissed) {
      const dismissTime = parseInt(healthAlertDismissed);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    }
  }, []);

  // Load data from storage on component mount
  useEffect(() => {
    if (!mounted) return;

    const loadData = () => {
      // Initialize default user and migrate data if needed
      if (typeof window !== "undefined") {
        const { initializeDefaultUser } = require("@/lib/user-storage");
        initializeDefaultUser();
      }

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

  const stopFastingWithEndTime = useCallback(
    (endTime: Date) => {
      if (currentSession) {
        // Calculate custom duration based on provided end time
        const customDuration = endTime.getTime() - currentSession.startTime;

        // End session with custom end time
        const completedSession = endFastingSession(endTime.getTime());

        // Track analytics event with custom duration
        if (completedSession && customDuration > 0) {
          trackFastingStop(customDuration);
        }

        setCurrentSession(null);
        setFastingStartTime(null);

        // Update history and stats
        const history = getFastingHistory();
        const stats = getFastingStats();
        setFastingHistory(history);
        setFastingStats(stats);
      }
    },
    [currentSession],
  );

  const handleDeleteSession = useCallback((sessionId: string) => {
    const success = deleteFastingSession(sessionId);

    if (success) {
      // Refresh data after deletion
      const history = getFastingHistory();
      const stats = getFastingStats();
      setFastingHistory(history);
      setFastingStats(stats);
    }
  }, []);

  const handleUserChange = useCallback(() => {
    // Reload all data when user changes
    const loadData = () => {
      const session = getCurrentSession();
      const history = getFastingHistory();
      const stats = getFastingStats();

      setCurrentSession(session);
      setFastingHistory(history);
      setFastingStats(stats);

      if (session) {
        setFastingStartTime(session.startTime);
        const elapsed = Date.now() - session.startTime;
        setElapsedTime(elapsed);
        setCurrentPhase(getFastingPhase(elapsed));
      } else {
        setFastingStartTime(null);
        setElapsedTime(0);
        setCurrentPhase(getFastingPhase(0));
      }
    };

    loadData();
  }, []);

  const toggleDesktopPhase = (index: number) => {
    setExpandedDesktopPhase(expandedDesktopPhase === index ? null : index);
  };

  // Auto-expand current phase in desktop sidebar and scroll to it
  useEffect(() => {
    if (fastingStartTime) {
      const currentPhaseIndex = FASTING_PHASES.findIndex(
        (phase) => phase.durationHours === currentPhase.durationHours,
      );

      // Find the corresponding index in getPredictedPhaseTimes (which excludes durationHours: 0)
      const predictions = getPredictedPhaseTimes(fastingStartTime);
      const predictionIndex = predictions.findIndex(
        (prediction) =>
          prediction.phase.durationHours === currentPhase.durationHours,
      );

      if (predictionIndex !== -1) {
        setExpandedDesktopPhase(predictionIndex);

        // Scroll to current phase within the phases container after a short delay
        setTimeout(() => {
          const currentPhaseElement = document.getElementById(
            `desktop-phase-${predictionIndex}`,
          );
          const phasesContainer = document.getElementById(
            "desktop-phases-container",
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
              behavior: "smooth",
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

  const handleStopFasting = () => {
    stopFasting();
  };

  // Prevent hydration mismatch by not rendering time-sensitive content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
              Fasting Tracker
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="from-light-green-500 min-h-screen bg-gradient-to-br to-emerald-600 dark:from-emerald-600 dark:to-emerald-700">
      <div className="mx-auto max-w-7xl">
        {/* Header - Compact */}
        <div className="mb-4 pt-2 text-center">
          <div className="bg-light-green-200 flex w-full items-center justify-center gap-2 px-4 py-1">
            <Stethoscope className="text-light-green-800 h-8 w-8" />
            <h1 className="text-light-green-800 text-xl font-semibold">
              Fără Mâncare – Monitor
            </h1>
          </div>

          {/* Current Phase Quick Summary */}
          {false && (
            <div className="mt-3 px-4">
              <div className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white/90 px-4 py-2 text-gray-800 shadow-md backdrop-blur-sm dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-200">
                <div
                  className="h-3 w-3 animate-pulse rounded-full"
                  style={{ backgroundColor: currentPhase.color }}
                />
                <div className="text-center">
                  <span className="block text-xs text-gray-600 dark:text-gray-400">
                    Faza curentă
                  </span>
                  <span className="text-sm font-semibold">
                    {currentPhase.title.split(":")[0]}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.floor(elapsedTime / (1000 * 60 * 60))}h
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        {false && (
          <div className="mx-auto mb-4 grid w-full grid-cols-1 items-center justify-center gap-3 px-4 sm:grid-cols-2 lg:grid-cols-2 lg:flex-wrap">
            {/* Start Fasting Button */}
            <Button
              data-testid="startFastingButton"
              onClick={startFasting}
              disabled={!!fastingStartTime}
              className="h-16 w-full border-0 bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl sm:h-10 sm:px-4 sm:py-4 sm:text-base md:h-20 md:px-6 md:py-6 md:text-lg lg:h-12 lg:px-4 lg:py-3 lg:text-base"
            >
              <Stethoscope className="mr-2 !h-6 !w-6 flex-shrink-0 sm:mr-3 sm:!h-8 sm:!w-8 md:mr-4 md:!h-12 md:!w-12 lg:mr-2 lg:!h-5 lg:!w-5" />
              Gata cu mâncarea
            </Button>

            {/* Stop Fasting Button */}
            <Button
              data-testid="stopFastingButton"
              disabled={!fastingStartTime}
              onClick={stopFasting}
              className="h-16 w-full border-0 bg-gradient-to-b from-blue-500 to-blue-600 px-3 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl sm:h-10 sm:px-4 sm:py-4 sm:text-base md:h-20 md:px-6 md:py-6 md:text-lg lg:h-12 lg:px-4 lg:py-3 lg:text-base"
            >
              <UtensilsCrossed className="mr-2 !h-6 !w-6 flex-shrink-0 sm:mr-3 sm:!h-8 sm:!w-8 md:mr-4 md:!h-12 md:!w-12 lg:mr-2 lg:!h-5 lg:!w-5" />
              Încep să mănânc
            </Button>
          </div>
        )}

        {/* Cards Container with smaller gap */}
        <div className="mx-4 mb-2 space-y-2">
          {/* Health Alert Card */}
          {false && (
            <div data-testid="healthAlertCard">
              <InfoContainer
                title="Informații importante despre pauzele alimentare"
                isExpanded={false}
                variant="emerald"
                className="shadow-lg"
                enableVoiceReading={true}
                voiceText="Informații importante despre pauzele alimentare. Pauzele alimentare sunt benefice atunci când sunt adaptate corpului tău. Pauza clasică de peste noapte are în jur de 12 ore și este, de regulă, sigură pentru majoritatea oamenilor. Orice pauză mai lungă de 12 ore poate aduce beneficii suplimentare, dar și riscuri, în funcție de starea de sănătate și nevoile tale. Pe toată durata pauzei este esențial să consumi lichide: apă simplă, apă cu o felie de fruct, ceai neîndulcit, cafea simplă fără zahar sau lapte. În plus, este important să ai o alimentație echilibrată în ferestrele de mâncare: include legume, surse de proteine și carbohidrați complecși în cantități moderate. Ascultă-ți corpul, oprește pauza dacă apar simptome neplăcute și nu te expune înfometării. Dacă ai probleme medicale sau iei tratamente, consultă medicul înainte de a prelungi pauza."
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
                <ul className="list-disc space-y-1 pl-4">
                  <li>apă simplă</li>
                  <li>apă cu o felie de fruct (ex.: lămâie, portocală)</li>
                  <li>ceai neîndulcit</li>
                  <li>cafea simplă (fără zahăr sau lapte)</li>
                </ul>
                <p>
                  În plus, este important să ai o alimentație echilibrată în
                  ferestrele de mâncare: include legume, surse de proteine
                  (carne, pește, ouă) și carbohidrați complecși în cantități
                  moderate (cum ar fi pâinea integrală).
                </p>
                <p>
                  <strong>
                    Ascultă-ți corpul, oprește pauza dacă apar simptome
                    neplăcute și nu te expune înfometării.
                  </strong>
                </p>
                <p>
                  <strong>
                    Dacă ai probleme medicale sau iei tratamente, consultă
                    medicul înainte de a prelungi pauza.
                  </strong>
                </p>
              </InfoContainer>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Current Status - Main Card */}
            <div className="lg:col-span-2">
              <Card className="relative h-full overflow-hidden p-0">
                <div
                  className="absolute top-0 right-0 left-0 h-1 transition-colors duration-500"
                  style={{ backgroundColor: currentPhase.color }}
                />
                <CardContent
                  data-testid="cardContentTime"
                  className="space-y-8 py-10"
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
                    variant="main"
                    onUpdateStartTime={handleUpdateStartTime}
                  />

                  {/* Current Phase */}
                  <div
                    data-testid="currentPahseContainer"
                    className="space-y-4 text-center"
                  >
                    <div
                      className="mt-6 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
                      style={{
                        background: `linear-gradient(135deg, ${currentPhase.color}dd, ${currentPhase.color})`,
                        border: `2px solid ${currentPhase.color}`,
                      }}
                    >
                      <div className="space-y-4 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <Stethoscope className="h-8 w-8 text-white" />
                        </div>
                        <div className="mb-2 flex items-center justify-center gap-3">
                          <p
                            className="text-lg font-semibold"
                            style={{ color: currentPhase.textColor }}
                          >
                            Starea curentă:
                          </p>
                          <div className="flex items-center gap-2">
                            {isSupported && (
                              <button
                                onClick={() =>
                                  toggle(getCurrentPhaseVoiceText())
                                }
                                className="rounded-full bg-white/20 p-2 transition-colors duration-200 hover:bg-white/30"
                                aria-label={
                                  isReading
                                    ? "Oprește citirea fazei curente"
                                    : "Citește faza curentă cu vocea"
                                }
                              >
                                {isReading ? (
                                  <Pause className="h-5 w-5 text-white" />
                                ) : (
                                  <Volume2 className="h-5 w-5 text-white" />
                                )}
                              </button>
                            )}
                            {notifications.isSupported && (
                              <button
                                onClick={() => {
                                  if (notifications.permission === "granted") {
                                    notifications.setIsEnabled(
                                      !notifications.isEnabled,
                                    );
                                  } else {
                                    notifications.requestPermission();
                                  }
                                }}
                                className={`rounded-full p-2 transition-colors duration-200 ${
                                  notifications.isEnabled &&
                                  notifications.permission === "granted"
                                    ? "bg-yellow-500/20 hover:bg-yellow-500/30"
                                    : "bg-white/20 hover:bg-white/30"
                                }`}
                                aria-label={
                                  notifications.isEnabled &&
                                  notifications.permission === "granted"
                                    ? "Dezactivează notificările pentru faze"
                                    : "Activează notificările pentru faze"
                                }
                              >
                                {notifications.isEnabled &&
                                notifications.permission === "granted" ? (
                                  <Bell className="h-5 w-5 text-white" />
                                ) : (
                                  <BellOff className="h-5 w-5 text-white" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        <h2
                          className="mx-auto max-w-2xl px-4 text-center text-2xl font-bold transition-all duration-500"
                          style={{ color: currentPhase.textColor }}
                        >
                          {currentPhase.title}
                        </h2>
                        <div
                          data-testid="descriptionContainer"
                          className="mx-auto max-w-2xl rounded-lg bg-white/10 p-4 text-base leading-relaxed font-medium backdrop-blur-sm"
                          style={{ color: currentPhase.textColor }}
                        >
                          {currentPhase.description
                            .split("\n")
                            .map((line, index) => (
                              <p key={index} className="mb-2 last:mb-0">
                                {line}
                              </p>
                            ))}
                        </div>

                        {fastingStartTime && currentPhase.encouragement && (
                          <div
                            data-testid="encouragementContainer"
                            className="mt-4 rounded-lg bg-white/10 p-4 backdrop-blur-sm"
                          >
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-2xl">💪</span>
                              <p
                                className="text-center text-lg font-bold"
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
                            phase.durationHours === currentPhase.durationHours,
                        );
                        const nextPhase = FASTING_PHASES[currentPhaseIndex + 1];

                        if (nextPhase) {
                          const currentHours = elapsedTime / (1000 * 60 * 60);
                          const hoursUntilNext =
                            nextPhase.durationHours - currentHours;

                          if (hoursUntilNext > 0) {
                            const nextPhaseTime = new Date(
                              fastingStartTime +
                                nextPhase.durationHours * 60 * 60 * 1000,
                            );

                            return (
                              <div
                                data-testid="nextPhaseContainer"
                                className="mt-6 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
                                style={{
                                  background: `linear-gradient(135deg, ${nextPhase.color}dd, ${nextPhase.color})`,
                                  border: `2px solid ${nextPhase.color}`,
                                }}
                              >
                                <div className="space-y-4 text-center">
                                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                    <span className="text-2xl">🎯</span>
                                  </div>
                                  <p
                                    className="mb-2 text-lg font-semibold"
                                    style={{ color: nextPhase.textColor }}
                                  >
                                    Următoarea fază
                                  </p>
                                  <h2
                                    className="mx-auto max-w-2xl px-4 text-center text-2xl font-bold transition-all duration-500"
                                    style={{ color: nextPhase.textColor }}
                                  >
                                    {nextPhase.title}
                                  </h2>
                                  <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                                    <div
                                      className="flex flex-col items-center justify-center gap-2 text-base font-medium sm:flex-row"
                                      style={{ color: nextPhase.textColor }}
                                    >
                                      <span>
                                        În {Math.floor(hoursUntilNext)}h{" "}
                                        {Math.floor((hoursUntilNext % 1) * 60)}
                                        min
                                      </span>
                                      <span className="hidden opacity-70 sm:inline">
                                        •
                                      </span>
                                      <span>
                                        la{" "}
                                        {safeFormatDate(nextPhaseTime, "HH:mm")}
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
                  <div
                    data-testid="actionButtons"
                    className="flex w-full gap-4"
                  >
                    {!fastingStartTime ? (
                      <Button
                        data-testid="startButton"
                        onClick={startFasting}
                        variant="outline"
                        size="default"
                        className="min-h-[140px] w-full transform rounded-2xl border-2 px-8 py-6 text-2xl font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 sm:min-h-[120px] md:text-3xl"
                        style={{
                          background:
                            "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
                          borderColor: "#ffffff",
                          borderRadius: "16px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)";
                          e.currentTarget.style.borderColor = "#ffffff";
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.borderRadius = "16px";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)";
                          e.currentTarget.style.borderColor = "#ffffff";
                          e.currentTarget.style.transform = "translateY(0px)";
                          e.currentTarget.style.borderRadius = "16px";
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <Stethoscope className="!h-12 !w-12 flex-shrink-0" />
                          <span className="hidden sm:inline">
                            Gata cu mâncarea
                          </span>
                          <span className="flex flex-col text-center leading-tight sm:hidden">
                            <span>Gata</span>
                            <span>cu</span>
                            <span>mâncarea</span>
                          </span>
                        </div>
                      </Button>
                    ) : (
                      <div className="w-full space-y-4">
                        {/* Drinks Carousel */}
                        <DrinksCarousel />
                        <StopFastingDialog
                          onConfirmStop={stopFasting}
                          onConfirmStopWithEndTime={stopFastingWithEndTime}
                          fastingStartTime={fastingStartTime}
                          elapsedTime={elapsedTime}
                        />
                      </div>
                    )}
                  </div>

                  {/* Timer Display under Stop Button - Mobile Only */}
                  {fastingStartTime && (
                    <div className="mt-6 sm:hidden">
                      <TimerDisplay
                        elapsedTime={elapsedTime}
                        fastingStartTime={
                          fastingStartTime
                            ? new Date(fastingStartTime)
                            : undefined
                        }
                        variant="main"
                        onUpdateStartTime={handleUpdateStartTime}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Phase Timeline - Only visible on desktop */}
            <div className="hidden space-y-6 lg:block">
              {/* Next Phases Card */}
              {fastingStartTime && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Toate Fazele de Pauza Alimentara
                    </CardTitle>
                  </CardHeader>
                  <CardContent
                    id="desktop-phases-container"
                    className="max-h-[600px] space-y-3 overflow-y-auto"
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
                            phase.durationHours === currentPhase.durationHours,
                        );

                        // Map the prediction index to the actual FASTING_PHASES index
                        // Since getPredictedPhaseTimes excludes phase with durationHours: 0
                        const actualPhaseIndex = FASTING_PHASES.findIndex(
                          (phase) =>
                            phase.durationHours ===
                            prediction.phase.durationHours,
                        );

                        const isCurrent =
                          actualPhaseIndex === currentPhaseIndex;

                        return (
                          <div
                            key={index}
                            id={`desktop-phase-${index}`}
                            className="space-y-2"
                          >
                            <Button
                              variant="ghost"
                              className="h-auto w-full justify-start p-0 hover:bg-transparent"
                              onClick={() => toggleDesktopPhase(index)}
                            >
                              <div
                                className={`relative flex w-full cursor-pointer flex-col space-y-1 overflow-hidden rounded-lg p-3 transition-colors ${
                                  isCurrent
                                    ? "border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                                    : isActive
                                      ? "border border-green-300 bg-green-100 dark:border-green-700 dark:bg-green-900/30"
                                      : isNext
                                        ? "border border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30"
                                        : "bg-gray-50 dark:bg-gray-800"
                                }`}
                              >
                                <div
                                  className="absolute top-0 bottom-0 left-0 w-1 transition-colors duration-300"
                                  style={{
                                    backgroundColor: prediction.phase.color,
                                  }}
                                />
                                <div className="flex w-full items-center justify-between">
                                  <div className="flex flex-1 items-center justify-between">
                                    <span
                                      className={`font-xl font-semibold ${
                                        isCurrent
                                          ? "text-green-700 dark:text-green-300"
                                          : isActive
                                            ? "text-green-800 dark:text-green-200"
                                            : isNext
                                              ? "text-blue-800 dark:text-blue-200"
                                              : "text-gray-700 dark:text-gray-300"
                                      }`}
                                    >
                                      {prediction.phase.title.split(":")[0]}
                                    </span>
                                    <span
                                      className={`text-sm font-semibold ${
                                        isCurrent
                                          ? "text-green-600 dark:text-green-300"
                                          : isActive
                                            ? "text-green-600 dark:text-green-300"
                                            : isNext
                                              ? "text-blue-600 dark:text-blue-300"
                                              : "text-muted-foreground"
                                      }`}
                                    >
                                      {isCurrent
                                        ? "🎉 În Progres"
                                        : isActive
                                          ? "✓ Completă"
                                          : prediction.predictedTime}
                                    </span>
                                  </div>
                                  <div className="ml-2">
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4 opacity-60" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 opacity-60" />
                                    )}
                                  </div>
                                </div>
                                <span className="text-muted-foreground text-left text-sm font-semibold">
                                  {prediction.phase.durationHours}h mark
                                </span>
                              </div>
                            </Button>

                            {isExpanded && (
                              <div
                                className={`ml-4 rounded-lg px-3 py-2 ${
                                  isCurrent
                                    ? "border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                                    : "bg-gray-50 dark:bg-gray-800"
                                }`}
                              >
                                {isCurrent && (
                                  <div className="mb-3 rounded-lg border border-green-200 bg-green-100 p-2 dark:border-green-700 dark:bg-green-900/30">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">🎉</span>
                                      <span className="text-xl font-semibold text-green-700 dark:text-green-300">
                                        În Progres
                                      </span>
                                    </div>
                                    <p className="mt-1 text-xl font-semibold text-green-600 dark:text-green-400">
                                      Această fază este în desfășurare. Continuă
                                      să fii puternic/ă!
                                    </p>
                                  </div>
                                )}
                                <div className="space-y-1 text-xl font-semibold text-gray-700 dark:text-gray-300">
                                  {prediction.phase.description
                                    .split("\n")
                                    .map((line, lineIndex) => (
                                      <p
                                        key={lineIndex}
                                        className="leading-relaxed"
                                      >
                                        {line}
                                      </p>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Privire de Ansamblu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xl font-semibold">
                      <span>Faza Curentă</span>
                      <span className="font-medium">
                        {Math.floor(elapsedTime / (1000 * 60 * 60))}h
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(
                            100,
                            (elapsedTime / (1000 * 60 * 60) / 48) * 100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>0h</span>
                      <span>48h</span>
                    </div>
                  </div>

                  <div className="border-t pt-2">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Timp Total:</span>
                        <span className="font-mono">
                          {formatTime(elapsedTime)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ore de Pauza Alimentara:</span>
                        <span className="font-mono">
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
                    <CardTitle className="text-xl">Sesiunea Curentă</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="space-y-1">
                        <p className="text-primary text-2xl font-bold">
                          {Math.floor(elapsedTime / (1000 * 60 * 60))}
                        </p>
                        <p className="text-muted-foreground text-xs">Ore</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-primary text-2xl font-bold">
                          {Math.floor(elapsedTime / (1000 * 60))}
                        </p>
                        <p className="text-muted-foreground text-xs">Minute</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Overall Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Statistici</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Sesiuni:</span>
                      <span className="font-medium">
                        {fastingStats.totalSessions}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Timp Total:</span>
                      <span className="font-medium">
                        {formatTime(fastingStats.totalFastingTime)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pauza Alimentara Medie:</span>
                      <span className="font-medium">
                        {formatTime(fastingStats.averageFastingTime)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cea Mai Lungă Pauza Alimentara:</span>
                      <span className="font-medium">
                        {formatTime(fastingStats.longestFast)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-2">
                    <Button
                      onClick={exportFastingDataAsFile}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Exportă Datele
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent History */}
              <RecentHistoryCard
                fastingHistory={fastingHistory}
                onDeleteSession={handleDeleteSession}
              />
            </div>
          </div>

          {/* Actions Container */}
          <InfoContainer
            title="Acțiuni Rapide"
            isExpanded={isActionsExpanded}
            onToggle={() => setIsActionsExpanded(!isActionsExpanded)}
            variant="info"
            icon={<Menu className="h-6 w-6 flex-shrink-0 text-white" />}
            className="shadow-lg"
            enableVoiceReading={true}
            voiceText="Acțiuni Rapide. Acces rapid la beneficii, istoric, faze și setări de notificări pentru a-ți personaliza experiența de pauza alimentara."
          >
            <div data-testid="actionCards" className="space-y-3">
              {/* Benefits Card */}
              <div className="overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg dark:from-blue-600 dark:to-blue-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBenefitsCardExpanded(!isBenefitsCardExpanded);
                  }}
                  className="w-full p-4 text-left transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Info className="h-6 w-6 flex-shrink-0 text-white" />
                      <h3 className="text-lg font-bold">
                        Vezi De Ce e Benefică Pauza Alimentară
                      </h3>
                    </div>
                    <div
                      className="h-5 w-5 opacity-80 transition-transform duration-300"
                      style={{
                        transform: isBenefitsCardExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ⌄
                    </div>
                  </div>
                </button>
                {isBenefitsCardExpanded && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 pl-9 leading-relaxed opacity-95">
                      <p>
                        Descoperă beneficiile științifice ale pauzelor
                        alimentare și cum acestea pot îmbunătăți sănătatea ta.
                      </p>
                      <Link href="/beneficii">
                        <Button
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 border-white/30 bg-white/20 text-white hover:bg-white/30"
                        >
                          Citește mai mult
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* History Card - Direct Navigation */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling to parent InfoContainer
                  // Track analytics for history navigation
                  if (typeof window !== "undefined" && window.gtag) {
                    window.gtag("event", "navigate_to_history", {
                      event_category: "navigation",
                      event_label: "history_card_click",
                    });
                  }
                  router.push("/history");
                }}
                className="w-full transform cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-left text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-purple-600 hover:to-purple-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="h-6 w-6 flex-shrink-0 text-white" />
                    <h3 className="text-lg font-bold">
                      Vezi Istoricul Complet
                    </h3>
                  </div>
                  <div className="text-purple-200">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Fasting Secrets Card - Direct Navigation */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/secretele-fastingului");
                }}
                className="w-full transform cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-left text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-teal-600 hover:to-teal-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 flex-shrink-0 text-white" />
                    <h3 className="text-lg font-bold">
                      Secretele unui fasting reușit
                    </h3>
                  </div>
                  <div className="text-teal-200">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Phases Card */}
              <div className="overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg lg:hidden dark:from-orange-600 dark:to-orange-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPhasesCardExpanded(!isPhasesCardExpanded);
                  }}
                  className="w-full p-4 text-left transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-6 w-6 flex-shrink-0 text-white" />
                      <h3 className="text-lg font-bold">
                        Fazele Pauzei Alimentare
                      </h3>
                    </div>
                    <div
                      className="h-5 w-5 opacity-80 transition-transform duration-300"
                      style={{
                        transform: isPhasesCardExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ⌄
                    </div>
                  </div>
                </button>
                {isPhasesCardExpanded && (
                  <div className="px-4 pb-4">
                    <div className="space-y-3 pl-9 leading-relaxed opacity-95">
                      <p>
                        Descoperă cum se dezvoltă corpul tău prin diferitele
                        etape ale pauzei alimentare, de la digestie la autofagie
                        și regenerare celulară.
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const phasesSection = document.getElementById(
                            "mobile-phases-container",
                          );
                          if (phasesSection) {
                            phasesSection.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        }}
                        className="mt-3 rounded-lg border-white/30 bg-white/20 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-white/30"
                      >
                        Vezi fazele →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications Card */}
              {notifications.isSupported && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event bubbling to parent InfoContainer
                    if (notifications.permission === "granted") {
                      notifications.setIsEnabled(!notifications.isEnabled);
                    } else {
                      notifications.requestPermission();
                    }
                  }}
                  className="w-full transform cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 text-left text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-yellow-500 hover:to-yellow-600 dark:from-yellow-500 dark:to-yellow-600 dark:hover:from-yellow-600 dark:hover:to-yellow-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {notifications.isEnabled &&
                      notifications.permission === "granted" ? (
                        <Bell className="h-6 w-6 flex-shrink-0 text-white" />
                      ) : (
                        <BellOff className="h-6 w-6 flex-shrink-0 text-white" />
                      )}
                      <div>
                        <h3 className="text-lg font-bold">Notificări</h3>
                        <p className="text-sm opacity-90">
                          {notifications.isEnabled &&
                          notifications.permission === "granted"
                            ? "Active - Vei primi notificări pentru faze"
                            : "Inactiv - Apasă pentru a activa"}
                        </p>
                      </div>
                    </div>
                    <div className="text-yellow-200">
                      {notifications.isEnabled &&
                      notifications.permission === "granted" ? (
                        <span className="rounded bg-white/20 px-2 py-1 text-sm font-medium">
                          ON
                        </span>
                      ) : (
                        <span className="rounded bg-white/20 px-2 py-1 text-sm font-medium">
                          OFF
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </InfoContainer>
        </div>

        {/* User Switcher */}
        <div className="mx-4 mb-2">
          <UserSwitcher onUserChange={handleUserChange} />
        </div>
        {/* Action Buttons Section - Outside of grid */}
        <div className="mt-6 space-y-4"></div>

        {/* Mobile Phases Section - Only visible on mobile */}
        <div id="mobile-phases-container" className="lg:hidden">
          <MobileFastingPhases
            phases={FASTING_PHASES}
            currentPhaseIndex={FASTING_PHASES.findIndex(
              (phase) => phase.durationHours === currentPhase.durationHours,
            )}
            elapsedHours={elapsedTime / (1000 * 60 * 60)}
          />
        </div>
      </div>

      {/* Test Panels - Development Only */}
      <NotificationTestPanel />
      <PhaseTestPanel onSessionChange={() => window.location.reload()} />
    </div>
  );
}
