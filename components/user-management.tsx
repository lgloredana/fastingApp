'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Plus,
  UserCheck,
  Clock,
  Calendar,
  Trash2,
  Edit3,
} from 'lucide-react';
import {
  getAllUsers,
  getActiveUser,
  setActiveUser,
  createUser,
  updateUser,
  deleteUser,
  type User as UserType,
} from '@/lib/user-storage';
import { getAllUsersWithData } from '@/lib/client-storage';

interface UserWithData extends UserType {
  totalSessions: number;
  totalFastingTime: number;
  hasActiveSession: boolean;
}

interface UserManagementProps {
  onUserChange?: () => void;
}

export function UserManagement({ onUserChange }: UserManagementProps) {
  const [users, setUsers] = useState<UserWithData[]>([]);
  const [activeUser, setActiveUserState] = useState<UserType | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  const loadUsers = () => {
    const usersWithData = getAllUsersWithData();
    const currentActiveUser = getActiveUser();
    setUsers(usersWithData);
    setActiveUserState(currentActiveUser);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = () => {
    if (newUserName.trim()) {
      createUser(newUserName.trim(), newUserEmail.trim() || undefined);
      setNewUserName('');
      setNewUserEmail('');
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

  const handleEditUser = () => {
    if (editingUser && newUserName.trim()) {
      updateUser(editingUser.id, {
        name: newUserName.trim(),
        email: newUserEmail.trim() || undefined,
      });
      setNewUserName('');
      setNewUserEmail('');
      setIsEditDialogOpen(false);
      setEditingUser(null);
      loadUsers();
      onUserChange?.();
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
      alert('Nu poți șterge ultimul utilizator!');
      return;
    }

    if (
      confirm(
        'Ești sigur că vrei să ștergi acest utilizator? Toate datele sale vor fi pierdute.'
      )
    ) {
      deleteUser(userId);
      loadUsers();
      onUserChange?.();
    }
  };

  const openEditDialog = (user: UserType) => {
    setEditingUser(user);
    setNewUserName(user.name);
    setNewUserEmail(user.email || '');
    setIsEditDialogOpen(true);
  };

  const formatTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    return `${hours}h`;
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            Gestionare Utilizatori
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size='sm' className='gap-2'>
                <Plus className='h-4 w-4' />
                Adaugă Utilizator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adaugă Utilizator Nou</DialogTitle>
                <DialogDescription>
                  Creează un nou profil pentru urmărirea postului.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>Nume *</Label>
                  <Input
                    id='name'
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder='Numele utilizatorului'
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>Email (opțional)</Label>
                  <Input
                    id='email'
                    type='email'
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder='email@exemplu.com'
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Anulează
                </Button>
                <Button onClick={handleAddUser} disabled={!newUserName.trim()}>
                  Adaugă Utilizator
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Active User Selection */}
          <div>
            <Label className='text-sm font-medium'>Utilizator Activ</Label>
            <Select
              value={activeUser?.id || ''}
              onValueChange={handleSwitchUser}
            >
              <SelectTrigger className='w-full mt-1'>
                <SelectValue placeholder='Selectează utilizatorul' />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className='flex items-center gap-2'>
                      <UserCheck className='h-4 w-4' />
                      {user.name}
                      {user.hasActiveSession && (
                        <span className='text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full'>
                          Activ
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Users List */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Toți Utilizatorii</Label>
            <div className='grid gap-2'>
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    activeUser?.id === user.id
                      ? 'bg-primary/5 border-primary'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <h4 className='font-medium'>{user.name}</h4>
                      {activeUser?.id === user.id && (
                        <span className='text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full'>
                          Activ
                        </span>
                      )}
                      {user.hasActiveSession && (
                        <span className='text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full'>
                          Post în desfășurare
                        </span>
                      )}
                    </div>
                    {user.email && (
                      <p className='text-sm text-muted-foreground'>
                        {user.email}
                      </p>
                    )}
                    <div className='flex items-center gap-4 mt-1 text-xs text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        {user.totalSessions} sesiuni
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {formatTime(user.totalFastingTime)}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => openEditDialog(user)}
                      className='h-8 w-8 p-0'
                    >
                      <Edit3 className='h-3 w-3' />
                    </Button>
                    {users.length > 1 && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteUser(user.id)}
                        className='h-8 w-8 p-0 text-red-500 hover:text-red-700'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editează Utilizator</DialogTitle>
              <DialogDescription>
                Modifică informațiile utilizatorului.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='edit-name'>Nume *</Label>
                <Input
                  id='edit-name'
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder='Numele utilizatorului'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='edit-email'>Email (opțional)</Label>
                <Input
                  id='edit-email'
                  type='email'
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder='email@exemplu.com'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsEditDialogOpen(false)}
              >
                Anulează
              </Button>
              <Button onClick={handleEditUser} disabled={!newUserName.trim()}>
                Salvează Modificările
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
