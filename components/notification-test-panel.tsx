'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/use-notifications';
import { getActiveUser } from '@/lib/user-storage';
import { Bell, TestTube, Play, Zap } from 'lucide-react';

export function NotificationTestPanel() {
  const { sendNotification, isEnabled, permission, requestPermission } =
    useNotifications();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testNotifications = [
    {
      id: 'phase-2',
      title: '🍯 Glicogenul se consumă!',
      body: 'Corpul tău folosește rezervele de glicogen. Ești pe drumul cel bun!',
    },
    {
      id: 'phase-3',
      title: '🔥 Arderea grăsimilor a început!',
      body: 'Felicitări! Corpul tău a început să ardă grăsimi pentru energie.',
    },
    {
      id: 'phase-4',
      title: '🧬 Autofagia se activează!',
      body: 'Excelent! Procesul de autofagie și cetoza încep să se activeze.',
    },
    {
      id: 'phase-5',
      title: '⚡ Autofagie profundă!',
      body: 'Incredibil! Ești în autofagie profundă și echilibru metabolic optimal.',
    },
    {
      id: 'phase-6',
      title: '🌟 Regenerare completă!',
      body: 'Uimitor! Corpul tău este în proces de regenerare și resetare metabolică.',
    },
  ];

  const sendTestNotification = (
    notification: (typeof testNotifications)[0]
  ) => {
    if (!isEnabled || permission !== 'granted') {
      alert('Notificările nu sunt activate! Activează-le mai întâi.');
      return;
    }

    const activeUser = getActiveUser();
    const userName = activeUser?.name || 'Utilizator';

    sendNotification({
      title: notification.title,
      body: `${userName}, ${notification.body}`,
      tag: `test-${notification.id}-${activeUser?.id || 'default'}`,
      requireInteraction: true,
    });
  };

  const sendPreNotification = () => {
    if (!isEnabled || permission !== 'granted') {
      alert('Notificările nu sunt activate! Activează-le mai întâi.');
      return;
    }

    const activeUser = getActiveUser();
    const userName = activeUser?.name || 'Utilizator';

    sendNotification({
      title: '⏰ Aproape de următoarea fază!',
      body: `${userName}, în 5 minute vei intra în faza: Arderea Grăsimilor`,
      tag: `test-pre-notification-${activeUser?.id || 'default'}`,
      requireInteraction: false,
    });
  };

  if (!isVisible) {
    return (
      <div className='fixed bottom-4 right-4 z-50'>
        <Button
          onClick={() => setIsVisible(true)}
          size='sm'
          className='bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
        >
          <TestTube className='h-4 w-4 mr-2' />
          Test Notificări
        </Button>
      </div>
    );
  }

  return (
    <div className='fixed bottom-4 right-4 z-50 w-80'>
      <Card className='shadow-xl border-purple-200 bg-white'>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center justify-between text-lg'>
            <div className='flex items-center gap-2'>
              <TestTube className='h-5 w-5 text-purple-600' />
              Test Notificări
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
          {/* Status */}
          <div className='p-2 rounded-lg bg-gray-50 text-sm'>
            <p>
              <strong>Status:</strong> {permission || 'Unknown'}
            </p>
            <p>
              <strong>Enabled:</strong> {isEnabled ? 'Da' : 'Nu'}
            </p>
            <p>
              <strong>Ready:</strong>{' '}
              {isEnabled && permission === 'granted' ? '✅' : '❌'}
            </p>
          </div>

          {/* Request Permission */}
          {permission !== 'granted' && (
            <Button
              onClick={requestPermission}
              className='w-full bg-green-600 hover:bg-green-700'
              size='sm'
            >
              <Bell className='h-4 w-4 mr-2' />
              Cere Permisiune
            </Button>
          )}

          {/* Pre-notification Test */}
          <Button
            onClick={sendPreNotification}
            variant='outline'
            className='w-full'
            size='sm'
            disabled={!isEnabled || permission !== 'granted'}
          >
            <Play className='h-4 w-4 mr-2' />
            Test Pre-Notificare
          </Button>

          {/* Phase Notifications */}
          <div className='space-y-2'>
            <p className='text-sm font-medium'>Test Faze:</p>
            {testNotifications.map((notification, index) => (
              <Button
                key={notification.id}
                onClick={() => sendTestNotification(notification)}
                variant='outline'
                className='w-full justify-start text-xs'
                size='sm'
                disabled={!isEnabled || permission !== 'granted'}
              >
                <Zap className='h-3 w-3 mr-2' />
                {notification.title.replace(/[🍯🔥🧬⚡🌟]/g, '').trim()}
              </Button>
            ))}
          </div>

          {/* Quick Test All */}
          <Button
            onClick={() => {
              testNotifications.forEach((notification, index) => {
                setTimeout(() => {
                  sendTestNotification(notification);
                }, index * 2000); // 2 seconds apart
              });
            }}
            className='w-full bg-purple-600 hover:bg-purple-700'
            size='sm'
            disabled={!isEnabled || permission !== 'granted'}
          >
            <Zap className='h-4 w-4 mr-2' />
            Test Toate (2s interval)
          </Button>

          <div className='text-xs text-gray-500 mt-2'>
            💡 Panelul de test apare doar în dezvoltare
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
