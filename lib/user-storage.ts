// User management utilities for multi-user fasting tracking

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  createdAt: number;
  isActive: boolean;
}

export interface UserData {
  users: User[];
  activeUserId: string | null;
}

const USER_STORAGE_KEY = 'fasting-app-users';

// Default user data structure
const getDefaultUserData = (): UserData => ({
  users: [],
  activeUserId: null,
});

// Read user data from localStorage
export const readUserData = (): UserData => {
  if (typeof window === 'undefined') {
    return getDefaultUserData();
  }

  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    if (!data) {
      return getDefaultUserData();
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading user data:', error);
    return getDefaultUserData();
  }
};

// Save user data to localStorage
export const saveUserData = (data: UserData): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

// Create a new user
export const createUser = (name: string, email?: string): User => {
  const userData = readUserData();
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email?.trim(),
    createdAt: Date.now(),
    isActive: true,
  };

  // Add the new user
  userData.users.push(newUser);
  
  // If this is the first user, make them active
  if (userData.users.length === 1) {
    userData.activeUserId = newUser.id;
  }

  saveUserData(userData);
  return newUser;
};

// Get all users
export const getAllUsers = (): User[] => {
  const userData = readUserData();
  return userData.users;
};

// Get active user
export const getActiveUser = (): User | null => {
  const userData = readUserData();
  if (!userData.activeUserId) {
    return null;
  }
  
  return userData.users.find(user => user.id === userData.activeUserId) || null;
};

// Set active user
export const setActiveUser = (userId: string): boolean => {
  const userData = readUserData();
  const user = userData.users.find(u => u.id === userId);
  
  if (!user) {
    return false;
  }

  userData.activeUserId = userId;
  saveUserData(userData);
  return true;
};

// Update user
export const updateUser = (userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null => {
  const userData = readUserData();
  const userIndex = userData.users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return null;
  }

  userData.users[userIndex] = {
    ...userData.users[userIndex],
    ...updates,
  };

  saveUserData(userData);
  return userData.users[userIndex];
};

// Delete user
export const deleteUser = (userId: string): boolean => {
  const userData = readUserData();
  const userIndex = userData.users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return false;
  }

  // Remove user
  userData.users.splice(userIndex, 1);
  
  // If this was the active user, set a new active user or null
  if (userData.activeUserId === userId) {
    userData.activeUserId = userData.users.length > 0 ? userData.users[0].id : null;
  }

  saveUserData(userData);
  return true;
};

// Initialize default user if none exists
export const initializeDefaultUser = (): User => {
  const userData = readUserData();
  
  if (userData.users.length === 0) {
    return createUser('Utilizator Principal');
  }
  
  return userData.users[0];
};
