'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFastPhaseTesting } from '@/hooks/use-fast-phase-testing';
import {
  startFastingSession,
  endFastingSession,
  getCurrentSession,
} from '@/lib/client-storage';
import { TestTube, Play, Square, RotateCcw, Clock, Zap } from 'lucide-react';

interface PhaseTestPanelProps {
  onSessionChange?: () => void;
}

export function PhaseTestPanel({ onSessionChange }: PhaseTestPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { isTestMode, enableTestMode, disableTestMode, getTestStartTime } =
    useFastPhaseTesting();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testPhases = [
    { id: 'phase-1', name: 'Digestie (0-4h)', hours: 2 },
    { id: 'phase-2', name: 'Glicogen (4-12h)', hours: 6 },
    { id: 'phase-3', name: 'Grăsimi (12-16h)', hours: 14 },
    { id: 'phase-4', name: 'Autofagie (16-24h)', hours: 20 },
    { id: 'phase-5', name: 'Profund (24-36h)', hours: 30 },
    { id: 'phase-6', name: 'Regenerare (36h+)', hours: 40 },
  ];

  const simulatePhase = (hours: number, phaseName: string) => {
    // End current session if exists
    const currentSession = getCurrentSession();
    if (currentSession) {
      endFastingSession();
    }

    // Start a new session with backdated time
    const testStartTime = getTestStartTime(hours);
    startFastingSession(testStartTime);

    console.log(`🧪 Simulat faza: ${phaseName} (${hours}h în urmă)`);
    console.log(`🧪 Start time: ${new Date(testStartTime).toLocaleString()}`);

    // Notify parent component
    onSessionChange?.();
  };

  const stopTesting = () => {
    const currentSession = getCurrentSession();
    if (currentSession) {
      endFastingSession();
      onSessionChange?.();
    }
    disableTestMode();
  };

  if (!isVisible) {
    return (
      <div className='fixed bottom-16 right-4 z-50'>
        <Button
          onClick={() => setIsVisible(true)}
          size='sm'
          className='bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
        >
          <Clock className='h-4 w-4 mr-2' />
          Test Faze
        </Button>
      </div>
    );
  }

  return (
    <div className='fixed bottom-16 right-4 z-50 w-80'>
      <Card className='shadow-xl border-indigo-200 bg-white'>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center justify-between text-lg'>
            <div className='flex items-center gap-2'>
              <Clock className='h-5 w-5 text-indigo-600' />
              Test Faze Post
              {isTestMode && (
                <Badge variant='secondary' className='text-xs'>
                  ACTIV
                </Badge>
              )}
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsVisible(false)}
              className='h-6 w-6 p-0'
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {/* Enable Test Mode */}
          {!isTestMode && (
            <Button
              onClick={enableTestMode}
              className='w-full bg-indigo-600 hover:bg-indigo-700'
              size='sm'
            >
              <TestTube className='h-4 w-4 mr-2' />
              Activează Modul Test
            </Button>
          )}

          {/* Test Controls */}
          {isTestMode && (
            <>
              <div className='p-2 rounded-lg bg-indigo-50 text-sm'>
                <p className='text-indigo-800 font-medium'>🧪 Mod Test Activ</p>
                <p className='text-indigo-600 text-xs'>
                  Poți simula orice fază de post
                </p>
              </div>

              {/* Phase Simulation Buttons */}
              <div className='space-y-2'>
                <p className='text-sm font-medium'>Simulează Faza:</p>
                <div className='grid grid-cols-1 gap-1'>
                  {testPhases.map((phase) => (
                    <Button
                      key={phase.id}
                      onClick={() => simulatePhase(phase.hours, phase.name)}
                      variant='outline'
                      className='justify-start text-xs h-8'
                      size='sm'
                    >
                      <Zap className='h-3 w-3 mr-2' />
                      {phase.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Control Buttons */}
              <div className='flex gap-2'>
                <Button
                  onClick={stopTesting}
                  variant='destructive'
                  className='flex-1'
                  size='sm'
                >
                  <Square className='h-4 w-4 mr-2' />
                  Stop & Exit
                </Button>
                <Button
                  onClick={() => {
                    const currentSession = getCurrentSession();
                    if (currentSession) {
                      endFastingSession();
                      onSessionChange?.();
                    }
                  }}
                  variant='outline'
                  size='sm'
                >
                  <RotateCcw className='h-4 w-4' />
                </Button>
              </div>
            </>
          )}

          <div className='text-xs text-gray-500 mt-2'>
            💡 Doar în dezvoltare - simulează rapid fazele pentru testare
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
