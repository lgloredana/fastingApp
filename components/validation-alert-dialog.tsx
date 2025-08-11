'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';

interface ValidationAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void; // For old-time confirmation
  type: 'future-time' | 'invalid-format' | 'old-time';
  selectedDateTime?: string;
}

export function ValidationAlertDialog({
  isOpen,
  onClose,
  onConfirm,
  type,
  selectedDateTime,
}: ValidationAlertDialogProps) {
  const getDialogContent = () => {
    switch (type) {
      case 'future-time':
        return {
          icon: (
            <Clock className='h-5 w-5 text-orange-600 dark:text-orange-400' />
          ),
          title: 'Ora de Start Nu Poate Fi în Viitor',
          description:
            'Nu poți începe postul în viitor. Te rog selectează o dată și oră din trecut sau prezent.',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          textColor: 'text-orange-800 dark:text-orange-200',
          detailColor: 'text-orange-700 dark:text-orange-300',
        };
      case 'invalid-format':
        return {
          icon: (
            <AlertTriangle className='h-5 w-5 text-red-600 dark:text-red-400' />
          ),
          title: 'Format de Dată/Oră Invalid',
          description:
            'Formatul datei sau orei selectate nu este valid. Te rog verifică și încearcă din nou.',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          detailColor: 'text-red-700 dark:text-red-300',
        };
      case 'old-time':
        return {
          icon: (
            <Calendar className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
          ),
          title: 'Dată Foarte Veche',
          description:
            'Ora de start selectată este cu mai mult de 7 zile în urmă. Ești sigur că este corectă?',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          detailColor: 'text-yellow-700 dark:text-yellow-300',
        };
      default:
        return {
          icon: (
            <AlertTriangle className='h-5 w-5 text-gray-600 dark:text-gray-400' />
          ),
          title: 'Eroare de Validare',
          description: 'A apărut o eroare la validarea datelor introduse.',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          textColor: 'text-gray-800 dark:text-gray-200',
          detailColor: 'text-gray-700 dark:text-gray-300',
        };
    }
  };

  const content = getDialogContent();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className='sm:max-w-md'>
        <AlertDialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${content.bgColor}`}
            >
              {content.icon}
            </div>
            <AlertDialogTitle className='text-lg font-semibold'>
              {content.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                {content.description}
              </p>

              {selectedDateTime && (
                <div
                  className={`p-3 rounded-lg border ${content.bgColor} ${content.borderColor}`}
                >
                  <p
                    className={`text-sm font-medium mb-1 ${content.textColor}`}
                  >
                    🕐 Ora selectată:
                  </p>
                  <p className={`text-sm ${content.detailColor}`}>
                    {selectedDateTime}
                  </p>
                </div>
              )}

              {type === 'future-time' && (
                <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                  <p className='text-sm text-blue-800 dark:text-blue-200 font-medium mb-1'>
                    💡 Sugestie:
                  </p>
                  <p className='text-sm text-blue-700 dark:text-blue-300'>
                    Selectează momentul când ai început de fapt postul sau ora
                    curentă pentru a începe acum.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-2'>
          {type === 'old-time' && onConfirm ? (
            <>
              <AlertDialogAction
                onClick={onClose}
                variant='outline'
                className='w-full sm:w-auto'
              >
                Anulează
              </AlertDialogAction>
              <AlertDialogAction
                onClick={onConfirm}
                className='w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700'
              >
                Da, Sunt Sigur
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction onClick={onClose} className='w-full sm:w-auto'>
              Am Înțeles
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
