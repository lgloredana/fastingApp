'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from './use-notifications';
import { FastingPhase } from '@/lib/fasting-phases';
import { getActiveUser } from '@/lib/user-storage';

interface UsePhaseNotificationsProps {
  currentPhase: FastingPhase | null;
  fastingStartTime: number | null;
  isActive: boolean;
}

export function usePhaseNotifications({
  currentPhase,
  fastingStartTime,
  isActive,
}: UsePhaseNotificationsProps) {
  const { sendNotification, isEnabled } = useNotifications();
  const lastNotifiedPhaseRef = useRef<string | null>(null);
  const notificationTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Clear all timeouts on cleanup
  useEffect(() => {
    return () => {
      notificationTimeoutsRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      notificationTimeoutsRef.current.clear();
    };
  }, []);

  // Monitor phase changes and send notifications
  useEffect(() => {
    console.log('🔔 Phase Notification Debug:', {
      isActive,
      currentPhase: currentPhase?.id,
      fastingStartTime: fastingStartTime
        ? new Date(fastingStartTime).toLocaleString()
        : null,
      isEnabled,
      lastNotifiedPhase: lastNotifiedPhaseRef.current,
    });

    if (!isActive) {
      console.log('❌ Fasting is not active - no notifications');
      return;
    }

    if (!currentPhase) {
      console.log('❌ No current phase - no notifications');
      return;
    }

    if (!fastingStartTime) {
      console.log('❌ No fasting start time - no notifications');
      return;
    }

    if (!isEnabled) {
      console.log('❌ Notifications disabled - no notifications');
      return;
    }

    // If this is a new phase and we haven't notified about it yet
    if (currentPhase.id && currentPhase.id !== lastNotifiedPhaseRef.current) {
      console.log(
        `🔔 Phase changed from ${lastNotifiedPhaseRef.current} to ${currentPhase.id}`
      );

      // Don't notify for the first phase (0-4 hours) immediately
      if (currentPhase.id !== 'phase-1') {
        console.log('✅ Sending phase notification...');
        sendPhaseNotification(currentPhase);
      } else {
        console.log('⏭️ Skipping first phase notification');
      }

      lastNotifiedPhaseRef.current = currentPhase.id;
    } else if (!currentPhase.id) {
      console.log('❌ Current phase has no ID - cannot send notification');
    }

    // Schedule upcoming phase notifications
    scheduleUpcomingNotifications(fastingStartTime);
  }, [currentPhase, fastingStartTime, isActive, isEnabled, sendNotification]);

  const sendPhaseNotification = (phase: FastingPhase) => {
    if (!phase || !phase.id) {
      console.error('❌ Cannot send notification: Invalid phase', phase);
      return;
    }

    console.log('🔔 Sending notification for phase:', phase.id);
    const activeUser = getActiveUser();
    const userName = activeUser?.name || 'Utilizator';

    const phaseMessages = {
      'phase-2': {
        title: '🍯 Tranziția energetică!',
        body: `${userName}: Corpul tău începe să scoată energie din depozite. Ține direcția!`,
      },
      'phase-3': {
        title: '🔥 Schimbarea combustibilului!',
        body: `${userName}: Motorul începe să schimbe combustibilul. Respira și continuă!`,
      },
      'phase-4': {
        title: '🔥 Arderea grăsimilor a început!',
        body: `${userName}: Primul prag important! Ești mai puternic/ă decât crezi!`,
      },
      'phase-5': {
        title: '🧬 Grăsimea ca sursă principală!',
        body: `${userName}: Motorul tău merge pe mod eficient. Bravo!`,
      },
      'phase-6': {
        title: '⚡ Autofagia debutează!',
        body: `${userName}: Curățarea internă a început. Menține ritmul!`,
      },
      'phase-7': {
        title: '🌟 Autofagie intensă!',
        body: `${userName}: Claritate și energie. Bucură-te de moment!`,
      },
      'phase-8': {
        title: '✨ Echilibru profund!',
        body: `${userName}: Echilibru profund. Corpul îți mulțumește!`,
      },
      'phase-9': {
        title: '🌟 Regenerare completă!',
        body: `${userName}: Regenerare completă. Inspiri putere și disciplină!`,
      },
    };

    const message = phaseMessages[phase.id as keyof typeof phaseMessages];
    if (message) {
      sendNotification({
        title: message.title,
        body: message.body,
        tag: `fasting-phase-${phase.id}-${activeUser?.id || 'default'}`,
        requireInteraction: true,
      });
    }
  };

  const scheduleUpcomingNotifications = (startTime: number) => {
    // Clear existing timeouts
    notificationTimeoutsRef.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    notificationTimeoutsRef.current.clear();

    const now = Date.now();
    const elapsed = now - startTime;

    // Define phase transition times in milliseconds
    const phaseTransitions = [
      { hours: 4, phaseId: 'phase-2', name: 'Consumul Glicogenului' },
      { hours: 12, phaseId: 'phase-3', name: 'Arderea Grăsimilor' },
      { hours: 16, phaseId: 'phase-4', name: 'Autofagia Inițială' },
      { hours: 24, phaseId: 'phase-5', name: 'Autofagia Profundă' },
      { hours: 36, phaseId: 'phase-6', name: 'Regenerarea Completă' },
    ];

    phaseTransitions.forEach(({ hours, phaseId, name }) => {
      const transitionTime = hours * 60 * 60 * 1000; // Convert to milliseconds
      const timeUntilTransition = transitionTime - elapsed;

      // Only schedule if the transition is in the future
      if (timeUntilTransition > 0) {
        const timeout = setTimeout(() => {
          // Send motivational notification 5 minutes before phase change
          const preNotificationTime = timeUntilTransition - 5 * 60 * 1000;
          if (preNotificationTime > 0) {
            setTimeout(() => {
              const activeUser = getActiveUser();
              const userName = activeUser?.name || 'Utilizator';

              sendNotification({
                title: '⏰ Aproape de următoarea fază!',
                body: `${userName}: În 5 minute vei intra în faza: ${name}`,
                tag: `pre-phase-${phaseId}-${activeUser?.id || 'default'}`,
                requireInteraction: false,
              });
            }, preNotificationTime);
          }

          // Send main phase notification
          setTimeout(() => {
            const phases: FastingPhase[] = [
              {
                id: 'phase-2',
                title: 'Consumul Glicogenului',
                description: '',
                color: '#FDD835',
                hours: '4-12',
              },
              {
                id: 'phase-3',
                title: 'Arderea Grăsimilor',
                description: '',
                color: '#FB8C00',
                hours: '12-16',
              },
              {
                id: 'phase-4',
                title: 'Autofagia Inițială',
                description: '',
                color: '#42A5F5',
                hours: '16-24',
              },
              {
                id: 'phase-5',
                title: 'Autofagia Profundă',
                description: '',
                color: '#3949AB',
                hours: '24-36',
              },
              {
                id: 'phase-6',
                title: 'Regenerarea Completă',
                description: '',
                color: '#7E57C2',
                hours: '36+',
              },
            ];

            const phase = phases.find((p) => p.id === phaseId);
            if (phase) {
              sendPhaseNotification(phase);
            }
          }, timeUntilTransition);
        }, 100); // Small delay to ensure proper scheduling

        notificationTimeoutsRef.current.add(timeout);
      }
    });
  };

  // Reset last notified phase when fasting stops
  useEffect(() => {
    if (!isActive) {
      lastNotifiedPhaseRef.current = null;
      // Clear all scheduled notifications
      notificationTimeoutsRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      notificationTimeoutsRef.current.clear();
    }
  }, [isActive]);
}
