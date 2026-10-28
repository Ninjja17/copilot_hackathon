import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useHandsFreeMic hook
 * Provides hands-free, continuous speech-to-text recognition with automatic loop resumption.
 */
export function useHandsFreeMic({ onTranscriptReady, isAgentSpeaking }) {
  const [isListening, setIsListening] = useState(false);
  const [handsFree, setHandsFree] = useState(true);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const activeRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      activeRef.current = true;
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      setInterimText(interim);

      if (finalTranscript.trim()) {
        const textToSend = finalTranscript.trim();
        setInterimText('');
        if (onTranscriptReady) {
          onTranscriptReady(textToSend);
        }
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition status:', event.error);
      if (event.error === 'not-allowed') {
        activeRef.current = false;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if handsFree is active and agent isn't currently speaking
      if (handsFree && activeRef.current && !isAgentSpeaking) {
        try {
          recognition.start();
        } catch (e) {
          // ignore already started
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      activeRef.current = false;
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [handsFree, isAgentSpeaking, onTranscriptReady]);

  // Pause mic while agent speaks to prevent audio feedback
  useEffect(() => {
    if (!recognitionRef.current) return;
    if (isAgentSpeaking) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    } else if (handsFree && activeRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  }, [isAgentSpeaking, handsFree]);

  const toggleHandsFree = useCallback(() => {
    setHandsFree(prev => {
      const next = !prev;
      if (!next && recognitionRef.current) {
        activeRef.current = false;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      } else if (next && recognitionRef.current) {
        activeRef.current = true;
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
      return next;
    });
  }, []);

  const manualStart = useCallback(() => {
    if (recognitionRef.current) {
      activeRef.current = true;
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  }, []);

  const manualStop = useCallback(() => {
    if (recognitionRef.current) {
      activeRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, []);

  return {
    isListening,
    handsFree,
    interimText,
    toggleHandsFree,
    manualStart,
    manualStop
  };
}
