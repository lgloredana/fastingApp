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
import { AlertTriangle, User, Baby } from 'lucide-react';
import { type User as UserType } from '@/lib/user-storage';

interface DeleteUserConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserType | null;
}

export function DeleteUserConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  user,
}: DeleteUserConfirmationDialogProps) {
  if (!user) return null;

  const getUserIcon = (userName: string) => {
    const lowerName = userName.toLowerCase();
    if (
      lowerName.includes('copil') ||
      lowerName.includes('child') ||
      lowerName.includes('kid') ||
      lowerName.includes('baby') ||
      lowerName.includes('bebe')
    ) {
      return <Baby className='h-5 w-5 text-blue-500' />;
    }
    return <User className='h-5 w-5 text-gray-500' />;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className='sm:max-w-md'>
        <AlertDialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
              <AlertTriangle className='h-5 w-5 text-red-600 dark:text-red-400' />
            </div>
            <AlertDialogTitle className='text-lg font-semibold'>
              Șterge Utilizatorul
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                Ești sigur că vrei să ștergi utilizatorul:
              </p>

              <div className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border'>
                {getUserIcon(user.name)}
                <div>
                  <p className='font-medium text-sm'>{user.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    Creat la:{' '}
                    {new Date(user.createdAt).toLocaleDateString('ro-RO')}
                  </p>
                </div>
              </div>

              <div className='p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800'>
                <p className='text-sm text-red-800 dark:text-red-200 font-medium mb-1'>
                  ⚠️ Atenție!
                </p>
                <p className='text-sm text-red-700 dark:text-red-300'>
                  Toate datele de post ale acestui utilizator vor fi șterse
                  permanent. Această acțiune nu poate fi anulată.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-2'>
          <AlertDialogCancel onClick={onClose} className='w-full sm:w-auto'>
            Anulează
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className='w-full sm:w-auto bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
          >
            Șterge Utilizatorul
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
