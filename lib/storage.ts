// Local file storage utilities for fasting data
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

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

// Get the path to store data in user's home directory
const getDataFilePath = () => {
  const homeDir = os.homedir();
  const dataDir = path.join(homeDir, '.fasting-app');
  const dataFile = path.join(dataDir, 'fasting-data.json');
  return { dataDir, dataFile };
};

// Ensure data directory exists
const ensureDataDir = async () => {
  const { dataDir } = getDataFilePath();
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Default data structure
const getDefaultData = (): FastingData => ({
  currentSession: null,
  sessions: [],
  totalSessions: 0,
  totalFastingTime: 0,
});

// Read fasting data from file
export const readFastingData = async (): Promise<FastingData> => {
  const { dataFile } = getDataFilePath();

  try {
    await ensureDataDir();
    const data = await fs.readFile(dataFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is corrupted, return default data
    const defaultData = getDefaultData();
    await saveFastingData(defaultData);
    return defaultData;
  }
};

// Save fasting data to file
export const saveFastingData = async (data: FastingData): Promise<void> => {
  const { dataFile } = getDataFilePath();

  try {
    await ensureDataDir();
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
};

// Start a new fasting session
export const startFastingSession = async (): Promise<FastingSession> => {
  const data = await readFastingData();

  const newSession: FastingSession = {
    id: `session-${Date.now()}`,
    startTime: Date.now(),
    createdAt: Date.now(),
  };

  data.currentSession = newSession;
  await saveFastingData(data);

  return newSession;
};

// End the current fasting session
export const endFastingSession = async (
  notes?: string
): Promise<FastingSession | null> => {
  const data = await readFastingData();

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

  await saveFastingData(data);

  return completedSession;
};

// Get current session
export const getCurrentSession = async (): Promise<FastingSession | null> => {
  const data = await readFastingData();
  return data.currentSession;
};

// Update current session start time
export const updateSessionStartTime = async (
  newStartTime: number
): Promise<FastingSession | null> => {
  const data = await readFastingData();

  if (!data.currentSession) {
    return null;
  }

  const updatedSession: FastingSession = {
    ...data.currentSession,
    startTime: newStartTime,
  };

  data.currentSession = updatedSession;
  await saveFastingData(data);

  return updatedSession;
};

// Get fasting history
export const getFastingHistory = async (): Promise<FastingSession[]> => {
  const data = await readFastingData();
  return data.sessions;
};

// Get fasting statistics
export const getFastingStats = async () => {
  const data = await readFastingData();

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

// Export data for backup
export const exportFastingData = async (): Promise<string> => {
  const data = await readFastingData();
  return JSON.stringify(data, null, 2);
};

// Import data from backup
export const importFastingData = async (jsonData: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonData);
    await saveFastingData(data);
  } catch (error) {
    throw new Error('Invalid data format');
  }
};
