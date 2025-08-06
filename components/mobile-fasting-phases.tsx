'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FastingPhase {
  title: string;
  description: string;
  durationHours: number;
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

  const togglePhase = (index: number) => {
    setExpandedPhase(expandedPhase === index ? null : index);
  };

  const getPhaseStatus = (index: number, phase: FastingPhase) => {
    if (elapsedHours >= phase.durationHours) {
      return 'completed';
    } else if (index === currentPhaseIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'current':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'current':
        return '🔄';
      default:
        return '⏳';
    }
  };

  return (
    <Card className='lg:hidden'>
      {' '}
      {/* Only show on mobile */}
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Info className='h-5 w-5' />
          Fazele Fastingului
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {phases.map((phase, index) => {
          const status = getPhaseStatus(index, phase);
          const isExpanded = expandedPhase === index;

          return (
            <div
              key={index}
              className={cn(
                'rounded-lg border-2 transition-all duration-200',
                getStatusColor(status)
              )}
            >
              <Button
                variant='ghost'
                className='w-full p-4 h-auto justify-between hover:bg-transparent'
                onClick={() => togglePhase(index)}
              >
                <div className='flex items-center gap-3 text-left'>
                  <span className='text-lg'>{getStatusIcon(status)}</span>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 opacity-60' />
                      <span className='font-medium text-sm'>
                        {phase.durationHours}h
                      </span>
                    </div>
                    <h3 className='font-semibold text-sm leading-tight mt-1'>
                      {phase.title}
                    </h3>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className='h-4 w-4 opacity-60' />
                ) : (
                  <ChevronDown className='h-4 w-4 opacity-60' />
                )}
              </Button>

              {isExpanded && (
                <div className='px-4 pb-4'>
                  <div className='mt-2 pt-3 border-t border-gray-200 dark:border-gray-600'>
                    <div className='text-sm text-gray-700 dark:text-gray-300 space-y-2'>
                      {phase.description.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className='leading-relaxed'>
                          {line}
                        </p>
                      ))}
                    </div>

                    {status === 'current' && (
                      <div className='mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md'>
                        <p className='text-xs text-blue-800 dark:text-blue-200 font-medium'>
                          🔄 Faza curentă - {elapsedHours.toFixed(1)}h din{' '}
                          {phase.durationHours}h
                        </p>
                      </div>
                    )}

                    {status === 'completed' && (
                      <div className='mt-3 p-2 bg-green-100 dark:bg-green-900/30 rounded-md'>
                        <p className='text-xs text-green-800 dark:text-green-200 font-medium'>
                          ✅ Fază completată
                        </p>
                      </div>
                    )}

                    {status === 'upcoming' && (
                      <div className='mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-md'>
                        <p className='text-xs text-gray-600 dark:text-gray-400 font-medium'>
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

        <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
          <p className='text-xs text-blue-700 dark:text-blue-300 text-center'>
            💡 Apasă pe fiecare fază pentru a vedea detalii complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
