import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSpeechSynthesis hook
 * Auto-selects a pleasant, soothing voice and provides speaking state & completion callbacks.
 */
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pleasantVoice, setPleasantVoice] = useState(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const selectPleasantVoice = useCallback(() => {
    if (!synthRef.current) return;
    const voices = synthRef.current.getVoices();
    if (!voices || voices.length === 0) return;

    // Preference list for pleasant, natural voices across macOS, Windows, Chrome & iOS
    const preferred = [
      'Samantha',
      'Google UK English Female',
      'Google US English',
      'Microsoft Jenny Online (Natural) - English (United States)',
      'Microsoft Aria Online (Natural) - English (United States)',
      'Microsoft Zira - English (United States)',
      'Karen',
      'Victoria'
    ];

    let found = null;
    for (const name of preferred) {
      found = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
      if (found) break;
    }

    if (!found) {
      found = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Natural')));
    }

    if (!found) {
      found = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    setPleasantVoice(found || null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    selectPleasantVoice();
    window.speechSynthesis.onvoiceschanged = selectPleasantVoice;
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectPleasantVoice]);

  const speak = useCallback((text, onEnd) => {
    if (!synthRef.current || !text) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any active speech to avoid queuing delays
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (pleasantVoice) utterance.voice = pleasantVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.05; // Slightly warmer/kinder tone

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    synthRef.current.speak(utterance);
  }, [pleasantVoice]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { isSpeaking, speak, stop, pleasantVoice };
}
