import { useRef, useState, useCallback } from "react";

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const lastSpoken = useRef("");

  const speak = useCallback(
    (text: string) => {
      if (!isEnabled || !text || text === lastSpoken.current) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      lastSpoken.current = text;
    },
    [isEnabled]
  );

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      if (prev) window.speechSynthesis.cancel();
      return !prev;
    });
  }, []);

  return { isSpeaking, isEnabled, speak, toggle };
}
