'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Plus, UserCheck, Baby, Users } from 'lucide-react';
import {
  getAllUsers,
  getActiveUser,
  setActiveUser,
  createUser,
  type User as UserType,
} from '@/lib/user-storage';

interface UserSwitcherProps {
  onUserChange?: () => void;
}

export function UserSwitcher({ onUserChange }: UserSwitcherProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [activeUser, setActiveUserState] = useState<UserType | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  const loadUsers = () => {
    const allUsers = getAllUsers();
    const currentActiveUser = getActiveUser();
    setUsers(allUsers);
    setActiveUserState(currentActiveUser);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = () => {
    if (newUserName.trim()) {
      createUser(newUserName.trim());
      setNewUserName('');
      setIsAddDialogOpen(false);
      loadUsers();
      onUserChange?.();
    }
  };

  const handleSwitchUser = (userId: string) => {
    if (setActiveUser(userId)) {
      loadUsers();
      onUserChange?.();
    }
  };

  const getUserIcon = (userName: string) => {
    const lowerName = userName.toLowerCase();
    if (
      lowerName.includes('copil') ||
      lowerName.includes('fiu') ||
      lowerName.includes('fiica') ||
      lowerName.includes('child') ||
      lowerName.includes('kid')
    ) {
      return <Baby className='h-4 w-4' />;
    }
    return <User className='h-4 w-4' />;
  };

  return (
    <div className='flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm'>
      <div className='flex items-center gap-2'>
        <Users className='h-5 w-5 text-primary' />
        <span className='font-medium text-sm'>Urmăresc pentru:</span>
      </div>

      <Select value={activeUser?.id || ''} onValueChange={handleSwitchUser}>
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='Selectează' />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className='flex items-center gap-2'>
                {getUserIcon(user.name)}
                {user.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            data-testid='add-user'
            size='sm'
            variant='outline'
            className='gap-2'
          >
            <Plus className='h-4 w-4' />
            <span className='hidden sm:inline'>Adaugă Persoană</span>
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[400px]'>
          <DialogHeader>
            <DialogTitle>Adaugă o Nouă Persoană</DialogTitle>
            <DialogDescription>
              Adaugă o persoană pentru care vrei să urmărești sesiunile de post
              (ex: copilul tău).
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Nume *</Label>
              <Input
                id='name'
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder='ex: Copilul meu, Maria, Alex...'
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newUserName.trim()) {
                    handleAddUser();
                  }
                }}
              />
            </div>
            <div className='text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg'>
              <div className='flex items-start gap-2'>
                <Baby className='h-4 w-4 mt-0.5 text-blue-600' />
                <div>
                  <p className='font-medium text-blue-900 dark:text-blue-100'>
                    Sfat:
                  </p>
                  <p className='text-blue-800 dark:text-blue-200'>
                    Poți urmări sesiunile de post pentru copilul tău direct de
                    pe telefonul tău. Schimbă pur și simplu între profiluri când
                    începi sau oprești o sesiune.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsAddDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleAddUser} disabled={!newUserName.trim()}>
              <Plus className='h-4 w-4 mr-2' />
              Adaugă Persoana
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
