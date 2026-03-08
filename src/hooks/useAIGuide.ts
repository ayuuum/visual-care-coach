import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AIResponse {
  scene: string;
  instruction: string;
  isWarning: boolean;
  isComplete: boolean;
}

export function useAIGuide() {
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);

  const analyzeFrame = useCallback(async (frameBase64: string) => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setIsAnalyzing(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-frame", {
        body: { frame: frameBase64 },
      });

      if (fnError) throw fnError;
      if (data) setResponse(data as AIResponse);
      setError(null);
    } catch (err) {
      console.error("AI analysis error:", err);
      setError("AI分析に失敗しました");
    } finally {
      setIsAnalyzing(false);
      isRunningRef.current = false;
    }
  }, []);

  const startPolling = useCallback(
    (captureFrame: () => string | null) => {
      if (intervalRef.current) return;
      // Initial capture
      const frame = captureFrame();
      if (frame) analyzeFrame(frame);

      intervalRef.current = setInterval(() => {
        const f = captureFrame();
        if (f) analyzeFrame(f);
      }, 3000);
    },
    [analyzeFrame]
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { response, isAnalyzing, error, startPolling, stopPolling, analyzeFrame };
}
