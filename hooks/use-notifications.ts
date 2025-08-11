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
    async (options: NotificationOptions) => {
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

        // Try different notification approaches based on device capabilities
        let notificationSent = false;

        // First, try the standard Notification API (works on many mobile browsers now)
        try {
          console.log('🔔 Trying standard Notification API...');
          const notification = new Notification(options.title, {
            body: options.body,
            icon: options.icon || '/icon-192.png',
            badge: options.badge || '/icon-192.png',
            tag: options.tag || 'fasting-app',
            requireInteraction: options.requireInteraction || false,
            silent: false,
          });

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

          console.log('✅ Standard notification sent!');
          notificationSent = true;
        } catch (standardError) {
          console.log(
            '⚠️ Standard Notification failed, trying alternatives...',
            standardError
          );

          // If standard fails, try service worker approach (if available)
          if (
            'serviceWorker' in navigator &&
            'showNotification' in ServiceWorkerRegistration.prototype
          ) {
            try {
              console.log('📱 Trying Service Worker notifications...');

              // Try to get existing registration first
              let registration =
                await navigator.serviceWorker.getRegistration();

              if (registration && registration.active) {
                console.log('📱 Using existing service worker');
                await registration.showNotification(options.title, {
                  body: options.body,
                  icon: options.icon || '/icon-192.png',
                  badge: options.badge || '/icon-192.png',
                  tag: options.tag || 'fasting-app',
                  requireInteraction: options.requireInteraction || false,
                  silent: false,
                });
                console.log('✅ Service Worker notification sent!');
                notificationSent = true;
              }
            } catch (swError) {
              console.log(
                '⚠️ Service Worker notification also failed:',
                swError
              );
            }
          }
        }

        // If all notification methods fail, show a visual alert instead
        if (!notificationSent) {
          console.log('📢 Showing visual alert as fallback');

          // Create a custom visual notification
          const visualNotification = document.createElement('div');
          visualNotification.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            width: 100%;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            animation: slideDown 0.3s ease-out;
          `;

          // Add animation styles
          if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
              @keyframes slideDown {
                from {
                  transform: translateY(-100%);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
            `;
            document.head.appendChild(styles);
          }

          visualNotification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${options.title}</div>
            <div>${options.body}</div>
          `;

          document.body.appendChild(visualNotification);

          // Auto-remove after 8 seconds
          setTimeout(() => {
            if (visualNotification.parentNode) {
              visualNotification.parentNode.removeChild(visualNotification);
            }
          }, 8000);

          // Make it clickable to dismiss
          visualNotification.onclick = () => {
            if (visualNotification.parentNode) {
              visualNotification.parentNode.removeChild(visualNotification);
            }
          };

          console.log('✅ Visual notification shown!');
        }

        console.log('✅ Notification sent:', options.title);
      } catch (error) {
        console.error('❌ Error sending notification:', error);

        // More user-friendly error message
        if (error.message && error.message.includes('Illegal constructor')) {
          alert(
            'Notificările mobile necesită o configurație specială. Încearcă să adaugi aplicația pe ecranul principal!'
          );
        } else {
          alert(`Eroare la trimiterea notificării: ${error.message}`);
        }
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
