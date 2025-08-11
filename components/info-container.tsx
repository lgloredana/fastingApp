'use client';

import { ReactNode, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  Volume2,
  VolumeX,
  Pause,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceReader } from '@/hooks/use-voice-reader';
import { Button } from '@/components/ui/button';

interface InfoContainerProps {
  title: string;
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  icon?: ReactNode;
  className?: string;
  variant?:
    | 'default'
    | 'warning'
    | 'info'
    | 'success'
    | 'emerald'
    | 'purple'
    | 'notification';
  enableVoiceReading?: boolean;
  voiceText?: string;
}

const variantStyles = {
  default: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100',
  warning:
    'bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white',
  info: 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white',
  success:
    'bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white',
  emerald:
    'bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white',
  purple:
    'bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white',
  notification:
    'bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 text-white',
};

export function InfoContainer({
  title,
  children,
  isExpanded,
  onToggle,
  icon,
  className,
  variant = 'warning',
  enableVoiceReading = false,
  voiceText,
}: InfoContainerProps) {
  const defaultIcon = <AlertTriangle className='h-6 w-6 flex-shrink-0' />;
  const displayIcon = icon || defaultIcon;

  // Extract text content for voice reading
  const textToRead = useMemo(() => {
    if (voiceText) return voiceText;

    // Extract text from children if no custom text provided
    const extractTextFromReactNode = (node: ReactNode): string => {
      if (typeof node === 'string') return node;
      if (typeof node === 'number') return node.toString();
      if (!node) return '';

      if (Array.isArray(node)) {
        return node.map(extractTextFromReactNode).join(' ');
      }

      if (typeof node === 'object' && 'props' in node) {
        return extractTextFromReactNode((node as any).props.children);
      }

      return '';
    };

    return `${title}. ${extractTextFromReactNode(children)}`;
  }, [title, children, voiceText]);

  const { toggle, isReading, isPaused, isSupported, stop } = useVoiceReader({
    rate: 0.8,
    lang: 'ro-RO',
  });

  // Cleanup voice reading when component unmounts
  useEffect(() => {
    return () => {
      if (isReading) {
        stop();
      }
    };
  }, [isReading, stop]);

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        variantStyles[variant],
        className
      )}
    >
      <button
        onClick={onToggle}
        className='w-full text-left p-4 hover:bg-white/5 transition-colors'
        aria-label={
          isExpanded ? 'Compactează secțiunea' : 'Expandează secțiunea'
        }
      >
        <div
          data-testid='info-container'
          className='flex items-center justify-between'
        >
          <div className='flex items-center gap-3'>
            {displayIcon}
            <h3 className='text-lg font-bold'>{title}</h3>
          </div>
          <div className='flex items-center gap-2'>
            {enableVoiceReading && isSupported && (
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(textToRead);
                }}
                className='h-8 w-8 p-0 hover:bg-white/10 text-white/80 hover:text-white'
                aria-label={isReading ? 'Oprește citirea' : 'Citește cu vocea'}
              >
                {isReading ? (
                  <Pause className='h-4 w-4' />
                ) : (
                  <Volume2 className='h-4 w-4' />
                )}
              </Button>
            )}
            <ChevronDown
              className={`h-5 w-5 opacity-80 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className='px-4 pb-4 animate-in slide-in-from-top-2 duration-300'>
          <div className='space-y-3 leading-relaxed pl-9 opacity-95'>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
