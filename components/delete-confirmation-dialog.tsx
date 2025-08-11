'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sessionDate?: string;
  sessionDuration?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  sessionDate,
  sessionDuration,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className='sm:max-w-[425px]'>
        <AlertDialogHeader>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
              <AlertTriangle className='h-6 w-6 text-red-600 dark:text-red-400' />
            </div>
            <div>
              <AlertDialogTitle className='text-lg font-semibold'>
                Șterge Sesiunea de Post
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className='text-base leading-relaxed'>
          Ești sigur că vrei să ștergi această sesiune de post?
          {sessionDate && sessionDuration && (
            <div className='mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <div className='text-sm'>
                <div className='font-medium text-gray-900 dark:text-gray-100'>
                  📅 {sessionDate}
                </div>
                <div className='text-gray-600 dark:text-gray-400 mt-1'>
                  ⏱️ Durată: {sessionDuration}
                </div>
              </div>
            </div>
          )}
          <div className='mt-3 text-sm text-red-600 dark:text-red-400 font-medium'>
            ⚠️ Această acțiune nu poate fi anulată.
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter className='gap-2 sm:gap-2'>
          <AlertDialogCancel onClick={onClose} className='sm:w-auto w-full'>
            Anulează
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className='sm:w-auto w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
          >
            <Trash2 className='h-4 w-4 mr-2' />
            Șterge Sesiunea
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
