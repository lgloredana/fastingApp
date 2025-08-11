'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackMobilePhaseExpand } from '@/lib/analytics';

interface FastingPhase {
  title: string;
  description: string;
  durationHours: number;
  color: string;
}

interface MobileFastingPhasesProps {
  phases: FastingPhase[];
  currentPhaseIndex: number;
  elapsedHours: number;
}

export function MobileFastingPhases({
  phases,
  currentPhaseIndex,
  elapsedHours,
}: MobileFastingPhasesProps) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(
    currentPhaseIndex
  );

  // Update expanded phase when current phase changes
  useEffect(() => {
    setExpandedPhase(currentPhaseIndex);
  }, [currentPhaseIndex]);

  const togglePhase = (index: number) => {
    const isExpanding = expandedPhase !== index;
    setExpandedPhase(expandedPhase === index ? null : index);

    // Track analytics only when expanding (not collapsing)
    if (isExpanding) {
      trackMobilePhaseExpand(phases[index].title);
    }
  };

  const getPhaseStatus = (index: number, phase: FastingPhase) => {
    if (index === currentPhaseIndex) {
      return 'current';
    } else if (elapsedHours >= phase.durationHours) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'current':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'current':
        return '🎉';
      default:
        return '⏳';
    }
  };

  return (
    <Card
      data-testid='mobile-fasting-phases'
      className='lg:hidden pt-0 bg-orange-100'
    >
      {' '}
      {/* Only show on mobile */}
      <CardHeader className='py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-t-xl'>
        <CardTitle className='lg:text-lg font-semibold flex items-center gap-2 text-base text-white'>
          <Clock className='h-6 w-6 text-white' />
          Fazele Pauzei Alimentare
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {phases.map((phase, index) => {
          const status = getPhaseStatus(index, phase);
          const isExpanded = expandedPhase === index;

          return (
            <div
              key={index}
              className={cn(
                'relative rounded-lg border-2 transition-all duration-200 overflow-hidden',
                getStatusColor(status)
              )}
            >
              <div
                className='absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300'
                style={{ backgroundColor: phase.color }}
              />
              <Button
                variant='ghost'
                className='w-full p-3 h-auto justify-between hover:bg-transparent'
                onClick={() => togglePhase(index)}
              >
                <div className='flex items-start gap-3 text-left flex-1 min-w-0'>
                  <span className='text-base flex-shrink-0'>
                    {getStatusIcon(status)}
                  </span>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <Clock className='h-4 w-4 opacity-60 flex-shrink-0' />
                      <span className='text-xl font-semibold text-muted-foreground'>
                        {phase.durationHours}h
                      </span>
                    </div>
                    {/* Show title only when NOT expanded */}
                    {!isExpanded && (
                      <h3
                        className={cn(
                          'font-semibold text-sm leading-tight text-left truncate',
                          status === 'current' &&
                            'text-green-700 dark:text-green-300',
                          status === 'completed' &&
                            'text-green-600 dark:text-green-400',
                          status === 'upcoming' &&
                            'text-gray-600 dark:text-gray-400'
                        )}
                      >
                        {phase.title}
                      </h3>
                    )}
                  </div>
                </div>
                <div className='flex-shrink-0 ml-2'>
                  {isExpanded ? (
                    <ChevronUp className='h-4 w-4 opacity-60' />
                  ) : (
                    <ChevronDown className='h-4 w-4 opacity-60' />
                  )}
                </div>
              </Button>

              {isExpanded && (
                <div className='px-3 pb-3'>
                  <div className='mt-2 pt-2 border-t border-gray-200 dark:border-gray-600'>
                    {/* Full title when expanded */}
                    <h4
                      className={cn(
                        'font-semibold text-xl mb-3 pl-2 ',
                        status === 'current' &&
                          'text-green-700 dark:text-green-300',
                        status === 'completed' &&
                          'text-green-600 dark:text-green-400',
                        status === 'upcoming' &&
                          'text-[#4CBA98] dark:text-[#4CBA98]'
                      )}
                    >
                      {phase.title}
                    </h4>
                    <div className='text-xl font-semibold text-gray-700 dark:text-gray-300 space-y-1.5 pl-4'>
                      {phase.description.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className='leading-relaxed'>
                          {line}
                        </p>
                      ))}
                    </div>

                    {status === 'completed' && (
                      <div className='mt-2 p-1.5 bg-green-100 dark:bg-green-900/30 rounded text-center'>
                        <p className='text-sm font-semibold text-green-800 dark:text-green-200 font-medium'>
                          <span className='text-green-500 mr-1'>✅</span>{' '}
                          Completă
                        </p>
                      </div>
                    )}

                    {status === 'current' && (
                      <div className='mt-2 p-1.5 bg-green-100 dark:bg-green-900/30 rounded text-center'>
                        <p className='text-sm font-semibold text-green-800 dark:text-green-200 font-medium'>
                          <span className='text-green-500 mr-1'>🎉</span> În
                          Progres
                        </p>
                      </div>
                    )}

                    {status === 'upcoming' && (
                      <div className='mt-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded text-center'>
                        <p className='text-sm font-semibold text-gray-600 dark:text-gray-400 font-medium'>
                          ⏳ În{' '}
                          {(phase.durationHours - elapsedHours).toFixed(1)}h
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
