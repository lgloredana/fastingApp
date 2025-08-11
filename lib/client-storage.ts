// Client-side storage utilities for fasting data (browser-compatible)
import { getActiveUser, initializeDefaultUser, getAllUsers } from './user-storage';

export interface FastingSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  notes?: string;
  createdAt: number;
  userId: string; // Added userId to sessions
}

export interface FastingData {
  currentSession: FastingSession | null;
  sessions: FastingSession[];
  totalSessions: number;
  totalFastingTime: number;
}

export interface UserFastingData {
  [userId: string]: FastingData;
}

const STORAGE_KEY = 'fasting-app-data';

// Get storage key for specific user
const getUserStorageKey = (userId: string): string => {
  return `${STORAGE_KEY}-${userId}`;
};

// Default data structure
const getDefaultData = (): FastingData => ({
  currentSession: null,
  sessions: [],
  totalSessions: 0,
  totalFastingTime: 0,
});

// Get current active user or initialize default
const getCurrentUser = () => {
  let user = getActiveUser();
  if (!user) {
    user = initializeDefaultUser();
  }
  return user;
};

// Read fasting data from localStorage for current user
export const readFastingData = (): FastingData => {
  if (typeof window === 'undefined') {
    return getDefaultData();
  }

  try {
    const user = getCurrentUser();
    const data = localStorage.getItem(getUserStorageKey(user.id));
    if (!data) {
      return getDefaultData();
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading fasting data:', error);
    return getDefaultData();
  }
};

// Read fasting data for specific user
export const readFastingDataForUser = (userId: string): FastingData => {
  if (typeof window === 'undefined') {
    return getDefaultData();
  }

  try {
    const data = localStorage.getItem(getUserStorageKey(userId));
    if (!data) {
      return getDefaultData();
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading fasting data for user:', error);
    return getDefaultData();
  }
};

// Save fasting data to localStorage for current user
export const saveFastingData = (data: FastingData): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const user = getCurrentUser();
    localStorage.setItem(getUserStorageKey(user.id), JSON.stringify(data));
  } catch (error) {
    console.error('Error saving fasting data:', error);
    throw error;
  }
};

// Save fasting data for specific user
export const saveFastingDataForUser = (userId: string, data: FastingData): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(data));
  } catch (error) {
    console.error('Error saving fasting data for user:', error);
    throw error;
  }
};

// Start a new fasting session
export const startFastingSession = (): FastingSession => {
  const data = readFastingData();
  const user = getCurrentUser();

  const newSession: FastingSession = {
    id: `session-${Date.now()}`,
    startTime: Date.now(),
    createdAt: Date.now(),
    userId: user.id,
  };

  data.currentSession = newSession;
  saveFastingData(data);

  return newSession;
};

// End the current fasting session
export const endFastingSession = (
  customEndTime?: number,
  notes?: string
): FastingSession | null => {
  const data = readFastingData();
  const user = getCurrentUser();

  if (!data.currentSession) {
    return null;
  }

  const endTime = customEndTime || Date.now();
  const duration = endTime - data.currentSession.startTime;

  const completedSession: FastingSession = {
    ...data.currentSession,
    endTime,
    duration,
    notes,
    userId: user.id, // Ensure userId is set
  };

  // Add to sessions history
  data.sessions.unshift(completedSession); // Add to beginning for recent-first order
  data.totalSessions += 1;
  data.totalFastingTime += duration;
  data.currentSession = null;

  saveFastingData(data);

  return completedSession;
};

// Get current session
export const getCurrentSession = (): FastingSession | null => {
  const data = readFastingData();
  return data.currentSession;
};

// Update current session start time
export const updateSessionStartTime = (
  newStartTime: number
): FastingSession | null => {
  const data = readFastingData();
  const user = getCurrentUser();

  if (!data.currentSession) {
    return null;
  }

  const updatedSession: FastingSession = {
    ...data.currentSession,
    startTime: newStartTime,
    userId: user.id, // Ensure userId is set
  };

  data.currentSession = updatedSession;
  saveFastingData(data);

  return updatedSession;
};

// Get fasting history
export const getFastingHistory = (): FastingSession[] => {
  const data = readFastingData();
  return data.sessions;
};

// Get fasting statistics
export const getFastingStats = () => {
  const data = readFastingData();

  const avgFastingTime =
    data.totalSessions > 0 ? data.totalFastingTime / data.totalSessions : 0;
  const longestFast = data.sessions.reduce((longest, session) => {
    return (session.duration || 0) > longest ? session.duration || 0 : longest;
  }, 0);

  return {
    totalSessions: data.totalSessions,
    totalFastingTime: data.totalFastingTime,
    averageFastingTime: avgFastingTime,
    longestFast,
  };
};

// Export data for backup (download as JSON file)
export const exportFastingDataAsFile = () => {
  const data = readFastingData();
  const jsonString = JSON.stringify(data, null, 2);

  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `fasting-data-backup-${
    new Date().toISOString().split('T')[0]
  }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};

// Import data from file
export const importFastingDataFromFile = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const data = JSON.parse(jsonString);
        saveFastingData(data);
        resolve();
      } catch (error) {
        reject(new Error('Invalid file format'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsText(file);
  });
};

// Delete a specific session
export const deleteFastingSession = (sessionId: string): boolean => {
  const data = readFastingData();

  const sessionIndex = data.sessions.findIndex(
    (session) => session.id === sessionId
  );

  if (sessionIndex === -1) {
    return false; // Session not found
  }

  const sessionToDelete = data.sessions[sessionIndex];

  // Remove session from array
  data.sessions.splice(sessionIndex, 1);

  // Update statistics
  data.totalSessions -= 1;
  if (sessionToDelete.duration) {
    data.totalFastingTime -= sessionToDelete.duration;
  }

  saveFastingData(data);
  return true;
};

// Clear all data for current user
export const clearAllData = (): void => {
  if (typeof window !== 'undefined') {
    const user = getCurrentUser();
    localStorage.removeItem(getUserStorageKey(user.id));
  }
};

// Clear all data for specific user
export const clearAllDataForUser = (userId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(getUserStorageKey(userId));
  }
};

// Get all users with their fasting data summary
export const getAllUsersWithData = () => {
  const users = getAllUsers();
  return users.map(user => {
    const data = readFastingDataForUser(user.id);
    return {
      ...user,
      totalSessions: data.totalSessions,
      totalFastingTime: data.totalFastingTime,
      hasActiveSession: !!data.currentSession,
    };
  });
};
