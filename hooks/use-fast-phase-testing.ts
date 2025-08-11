'use client';

import { useState, useCallback } from 'react';

interface UseFastPhaseTestingReturn {
  isTestMode: boolean;
  enableTestMode: () => void;
  disableTestMode: () => void;
  simulatePhaseChange: (phaseId: string) => void;
  getTestStartTime: (targetPhaseHours: number) => number;
}

export function useFastPhaseTesting(): UseFastPhaseTestingReturn {
  const [isTestMode, setIsTestMode] = useState(false);

  const enableTestMode = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsTestMode(true);
      console.log('🧪 Fast Phase Testing Mode ENABLED');
    }
  }, []);

  const disableTestMode = useCallback(() => {
    setIsTestMode(false);
    console.log('🧪 Fast Phase Testing Mode DISABLED');
  }, []);

  const simulatePhaseChange = useCallback(
    (phaseId: string) => {
      if (!isTestMode) return;

      console.log(`🧪 Simulating phase change to: ${phaseId}`);

      // Trigger a custom event that the notification hook can listen to
      window.dispatchEvent(
        new CustomEvent('test-phase-change', {
          detail: { phaseId },
        })
      );
    },
    [isTestMode]
  );

  const getTestStartTime = useCallback((targetPhaseHours: number) => {
    // Calculate a start time that would put us exactly at the target phase
    const now = Date.now();
    const hoursInMs = targetPhaseHours * 60 * 60 * 1000;
    return now - hoursInMs;
  }, []);

  return {
    isTestMode,
    enableTestMode,
    disableTestMode,
    simulatePhaseChange,
    getTestStartTime,
  };
}
