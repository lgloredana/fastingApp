'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface VoiceReaderOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export function useVoiceReader(options: VoiceReaderOptions = {}) {
  const [isReading, setIsReading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const defaultOptions = {
    rate: 0.9,
    pitch: 1,
    volume: 0.8,
    lang: 'ro-RO',
    ...options,
  };

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported(
      typeof window !== 'undefined' && 'speechSynthesis' in window
    );

    // Load voices (sometimes they load asynchronously)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        console.log(
          'Available voices:',
          voices.map((v) => `${v.name} (${v.lang})`)
        );

        const romanianVoices = voices.filter(
          (voice) =>
            voice.lang.startsWith('ro') ||
            voice.lang.includes('RO') ||
            voice.name.toLowerCase().includes('romanian')
        );

        if (romanianVoices.length > 0) {
          console.log(
            'Romanian voices found:',
            romanianVoices.map((v) => `${v.name} (${v.lang})`)
          );
        } else {
          console.log(
            'No Romanian voices available. The system will try to use ro-RO language setting.'
          );
        }
      };

      // Load voices immediately if available
      loadVoices();

      // Also load voices when they become available (some browsers load them asynchronously)
      speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text) return;

      // Stop any current speech
      stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = defaultOptions.rate;
      utterance.pitch = defaultOptions.pitch;
      utterance.volume = defaultOptions.volume;
      utterance.lang = defaultOptions.lang;

      // Try to find a Romanian voice
      const voices = speechSynthesis.getVoices();
      const romanianVoice = voices.find(
        (voice) =>
          voice.lang.startsWith('ro') ||
          voice.lang.includes('RO') ||
          voice.name.toLowerCase().includes('romanian') ||
          voice.name.toLowerCase().includes('romania')
      );

      if (romanianVoice) {
        utterance.voice = romanianVoice;
        console.log(
          'Using Romanian voice:',
          romanianVoice.name,
          romanianVoice.lang
        );
      } else {
        console.log('No Romanian voice found, using default with ro-RO lang');
        // Force Romanian language even without specific voice
        utterance.lang = 'ro-RO';
      }

      utterance.onstart = () => {
        setIsReading(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsReading(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsReading(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [isSupported, defaultOptions]
  );

  const pause = useCallback(() => {
    if (isSupported && isReading && !isPaused) {
      speechSynthesis.pause();
      // Force state update in case onpause event doesn't fire
      setTimeout(() => setIsPaused(true), 100);
    }
  }, [isSupported, isReading, isPaused]);

  const resume = useCallback(() => {
    if (isSupported && isReading && isPaused) {
      speechSynthesis.resume();
      // Force state update in case onresume event doesn't fire
      setTimeout(() => setIsPaused(false), 100);
    }
  }, [isSupported, isReading, isPaused]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsReading(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  }, [isSupported]);

  const toggle = useCallback(
    (text: string) => {
      if (isReading) {
        // Instead of pause/resume, use stop for more reliable state management
        stop();
      } else {
        speak(text);
      }
    },
    [isReading, speak, stop]
  );

  return {
    speak,
    pause,
    resume,
    stop,
    toggle,
    isReading,
    isPaused,
    isSupported,
  };
}
