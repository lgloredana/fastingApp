'use client';

import { useState, useEffect, useCallback } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | null;
  requestPermission: () => Promise<boolean>;
  sendNotification: (options: NotificationOptions) => void;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );
  const [isEnabled, setIsEnabledState] = useState(false);

  // Check if notifications are supported
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem(
        'fasting-notifications-enabled'
      );
      setIsEnabledState(savedEnabled === 'true');

      if (isSupported) {
        setPermission(Notification.permission);
      }
    }
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setIsEnabledState(true);
        localStorage.setItem('fasting-notifications-enabled', 'true');
        return true;
      } else {
        setIsEnabledState(false);
        localStorage.setItem('fasting-notifications-enabled', 'false');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  // Send notification
  const sendNotification = useCallback(
    (options: NotificationOptions) => {
      // Enhanced debugging
      console.log('🔔 Notification Debug Info:', {
        isSupported,
        isEnabled,
        permission,
        title: options.title,
        body: options.body,
      });

      if (!isSupported) {
        console.error('❌ Notifications are not supported in this browser');
        alert('Notificările nu sunt suportate în acest browser!');
        return;
      }

      if (!isEnabled) {
        console.error('❌ Notifications are disabled by user');
        alert('Notificările sunt dezactivate! Activează-le din setări.');
        return;
      }

      if (permission !== 'granted') {
        console.error('❌ Notification permission not granted:', permission);
        alert(
          `Permisiunea pentru notificări: ${permission}. Te rog să o accepți!`
        );
        return;
      }

      try {
        console.log('✅ Creating notification...');
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192.png',
          badge: options.badge || '/icon-192.png',
          tag: options.tag || 'fasting-app',
          requireInteraction: options.requireInteraction || false,
          silent: false,
        });

        console.log('✅ Notification created successfully!');

        // Auto-close after 10 seconds if not requiring interaction
        if (!options.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 10000);
        }

        // Handle notification click
        notification.onclick = () => {
          console.log('Notification clicked');
          window.focus();
          notification.close();
        };

        notification.onshow = () => {
          console.log('✅ Notification is showing');
        };

        notification.onerror = (error) => {
          console.error('❌ Notification error:', error);
        };

        console.log('✅ Notification sent:', options.title);
      } catch (error) {
        console.error('❌ Error sending notification:', error);
        alert(`Eroare la trimiterea notificării: ${error}`);
      }
    },
    [isSupported, isEnabled, permission]
  );

  // Update enabled state and save to localStorage
  const setIsEnabled = useCallback((enabled: boolean) => {
    setIsEnabledState(enabled);
    localStorage.setItem('fasting-notifications-enabled', enabled.toString());
  }, []);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    isEnabled,
    setIsEnabled,
  };
}
