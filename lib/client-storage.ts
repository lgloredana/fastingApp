// Client-side storage utilities for fasting data (browser-compatible)

export interface FastingSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  notes?: string;
  createdAt: number;
}

export interface FastingData {
  currentSession: FastingSession | null;
  sessions: FastingSession[];
  totalSessions: number;
  totalFastingTime: number;
}

const STORAGE_KEY = 'fasting-app-data';

// Default data structure
const getDefaultData = (): FastingData => ({
  currentSession: null,
  sessions: [],
  totalSessions: 0,
  totalFastingTime: 0,
});

// Read fasting data from localStorage
export const readFastingData = (): FastingData => {
  if (typeof window === 'undefined') {
    return getDefaultData();
  }
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return getDefaultData();
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading fasting data:', error);
    return getDefaultData();
  }
};

// Save fasting data to localStorage
export const saveFastingData = (data: FastingData): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving fasting data:', error);
    throw error;
  }
};

// Start a new fasting session
export const startFastingSession = (): FastingSession => {
  const data = readFastingData();
  
  const newSession: FastingSession = {
    id: `session-${Date.now()}`,
    startTime: Date.now(),
    createdAt: Date.now(),
  };
  
  data.currentSession = newSession;
  saveFastingData(data);
  
  return newSession;
};

// End the current fasting session
export const endFastingSession = (notes?: string): FastingSession | null => {
  const data = readFastingData();
  
  if (!data.currentSession) {
    return null;
  }
  
  const endTime = Date.now();
  const duration = endTime - data.currentSession.startTime;
  
  const completedSession: FastingSession = {
    ...data.currentSession,
    endTime,
    duration,
    notes,
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

// Get fasting history
export const getFastingHistory = (): FastingSession[] => {
  const data = readFastingData();
  return data.sessions;
};

// Get fasting statistics
export const getFastingStats = () => {
  const data = readFastingData();
  
  const avgFastingTime = data.totalSessions > 0 ? data.totalFastingTime / data.totalSessions : 0;
  const longestFast = data.sessions.reduce((longest, session) => {
    return (session.duration || 0) > longest ? (session.duration || 0) : longest;
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
  a.download = `fasting-data-backup-${new Date().toISOString().split('T')[0]}.json`;
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

// Clear all data
export const clearAllData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
};