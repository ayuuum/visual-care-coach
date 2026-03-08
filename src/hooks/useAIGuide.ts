import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AIResponse {
  scene: string;
  instruction: string;
  isWarning: boolean;
  isComplete: boolean;
  illustrationUrl?: string;
}

const BASE_INTERVAL = 3000;
const MAX_INTERVAL = 30000;
const MAX_CONSECUTIVE_ERRORS = 3;

export function useAIGuide() {
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const lastImageInstructionRef = useRef<string>("");

  const generateIllustration = useCallback(async (instruction: string, scene: string) => {
    if (lastImageInstructionRef.current === instruction) return;
    lastImageInstructionRef.current = instruction;
    setIsGeneratingImage(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-instruction-image", {
        body: { instruction, scene },
      });
      if (fnError) throw fnError;
      if (data?.imageUrl) {
        setResponse(prev => prev ? { ...prev, illustrationUrl: data.imageUrl } : prev);
      }
    } catch (err) {
      console.error("Illustration generation error:", err);
    } finally {
      setIsGeneratingImage(false);
    }
  }, []);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);
  const errorCountRef = useRef(0);
  const currentIntervalRef = useRef(BASE_INTERVAL);
  const captureFrameRef = useRef<(() => string | null) | null>(null);

  const scheduleNext = useCallback(() => {
    if (intervalRef.current) clearTimeout(intervalRef.current);
    if (!captureFrameRef.current) return;

    intervalRef.current = setTimeout(() => {
      const f = captureFrameRef.current?.();
      if (f) analyzeFrame(f);
    }, currentIntervalRef.current);
  }, []);

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
      errorCountRef.current = 0;
      currentIntervalRef.current = BASE_INTERVAL;
      setIsPaused(false);
    } catch (err) {
      console.error("AI analysis error:", err);
      errorCountRef.current += 1;
      currentIntervalRef.current = Math.min(
        BASE_INTERVAL * Math.pow(2, errorCountRef.current),
        MAX_INTERVAL
      );

      if (errorCountRef.current >= MAX_CONSECUTIVE_ERRORS) {
        setError("AI分析に接続できません。再試行中...");
        setIsPaused(true);
      } else {
        setError("AI分析に失敗しました");
      }
    } finally {
      setIsAnalyzing(false);
      isRunningRef.current = false;
      scheduleNext();
    }
  }, [scheduleNext]);

  const startPolling = useCallback(
    (captureFrame: () => string | null) => {
      if (intervalRef.current) return;
      captureFrameRef.current = captureFrame;

      let attempts = 0;
      const tryCapture = () => {
        const frame = captureFrame();
        if (frame) {
          analyzeFrame(frame);
          return;
        }

        attempts += 1;
        if (attempts >= 20) {
          setError("カメラ映像が取得できません。再起動してください");
          setIsPaused(true);
          return;
        }

        // Video not ready — retry quickly
        intervalRef.current = setTimeout(tryCapture, 500);
      };
      tryCapture();
    },
    [analyzeFrame, setError, setIsPaused]
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    captureFrameRef.current = null;
    errorCountRef.current = 0;
    currentIntervalRef.current = BASE_INTERVAL;
  }, []);

  const retry = useCallback(() => {
    errorCountRef.current = 0;
    currentIntervalRef.current = BASE_INTERVAL;
    setIsPaused(false);
    setError(null);
    const f = captureFrameRef.current?.();
    if (f) analyzeFrame(f);
  }, [analyzeFrame]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  return { response, isAnalyzing, error, isPaused, startPolling, stopPolling, analyzeFrame, retry };
}
