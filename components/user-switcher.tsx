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
import {
  User,
  Plus,
  UserCheck,
  Baby,
  Users,
  Trash2,
  MoreVertical,
  Edit3,
} from 'lucide-react';
import {
  getAllUsers,
  getActiveUser,
  setActiveUser,
  createUser,
  deleteUser,
  updateUser,
  type User as UserType,
} from '@/lib/user-storage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteUserConfirmationDialog } from '@/components/delete-user-confirmation-dialog';

interface UserSwitcherProps {
  onUserChange?: () => void;
}

export function UserSwitcher({ onUserChange }: UserSwitcherProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [activeUser, setActiveUserState] = useState<UserType | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

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

  const handleDeleteUser = (user: UserType) => {
    if (users.length <= 1) {
      alert('Nu poți șterge ultimul utilizator!');
      return;
    }

    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;

    const success = deleteUser(userToDelete.id);
    if (success) {
      loadUsers();
      onUserChange?.();
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser || !editUserName.trim()) return;

    const updatedUser = updateUser(editingUser.id, {
      name: editUserName.trim(),
    });
    if (updatedUser) {
      loadUsers();
      onUserChange?.();
      setIsEditDialogOpen(false);
      setEditingUser(null);
      setEditUserName('');
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

      <div className='flex items-center gap-1'>
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

        {/* User Management Dropdown */}
        {users.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-9 w-9 p-0'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {users.map((user) => (
                <div key={user.id}>
                  <DropdownMenuItem
                    onClick={() => handleEditUser(user)}
                    className='text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  >
                    <Edit3 className='h-4 w-4 mr-2' />
                    Editează "{user.name}"
                  </DropdownMenuItem>
                  {users.length > 1 && (
                    <DropdownMenuItem
                      onClick={() => handleDeleteUser(user)}
                      className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                    >
                      <Trash2 className='h-4 w-4 mr-2' />
                      Șterge "{user.name}"
                    </DropdownMenuItem>
                  )}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Editează Numele Utilizatorului</DialogTitle>
            <DialogDescription>
              Modifică numele pentru "{editingUser?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='edit-name' className='text-right'>
                Nume
              </Label>
              <Input
                id='edit-name'
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
                className='col-span-3'
                placeholder='Introdu numele nou...'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateUser();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsEditDialogOpen(false)}
            >
              Anulează
            </Button>
            <Button
              type='button'
              onClick={handleUpdateUser}
              disabled={!editUserName.trim()}
            >
              <UserCheck className='h-4 w-4 mr-2' />
              Salvează Modificările
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <DeleteUserConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        user={userToDelete}
      />
    </div>
  );
}
