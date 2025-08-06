import { sendGAEvent } from '@next/third-parties/google';

// Tipuri pentru evenimentele de analytics
export interface FastingEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// Funcție generică pentru trimiterea evenimentelor
export const trackEvent = ({
  action,
  category,
  label,
  value,
}: FastingEvent) => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
    sendGAEvent({
      event: action,
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Evenimente specifice pentru aplicația de fasting
export const trackFastingStart = () => {
  trackEvent({
    action: 'start_fasting',
    category: 'Fasting',
    label: 'User started a fasting session',
  });
};

export const trackFastingStop = (duration: number) => {
  trackEvent({
    action: 'stop_fasting',
    category: 'Fasting',
    label: 'User stopped a fasting session',
    value: Math.round(duration / (1000 * 60 * 60)), // durată în ore
  });
};

export const trackPhaseView = (phaseTitle: string, hours: number) => {
  trackEvent({
    action: 'view_phase',
    category: 'Fasting Phases',
    label: phaseTitle,
    value: hours,
  });
};

export const trackHistoryView = () => {
  trackEvent({
    action: 'view_history',
    category: 'Navigation',
    label: 'User viewed fasting history',
  });
};

export const trackUpdateStartTime = () => {
  trackEvent({
    action: 'update_start_time',
    category: 'Fasting',
    label: 'User updated fasting start time',
  });
};

export const trackDataExport = () => {
  trackEvent({
    action: 'export_data',
    category: 'Data Management',
    label: 'User exported fasting data',
  });
};

export const trackDataClear = () => {
  trackEvent({
    action: 'clear_data',
    category: 'Data Management',
    label: 'User cleared all fasting data',
  });
};

export const trackMobilePhaseExpand = (phaseTitle: string) => {
  trackEvent({
    action: 'expand_mobile_phase',
    category: 'Mobile Interaction',
    label: phaseTitle,
  });
};
