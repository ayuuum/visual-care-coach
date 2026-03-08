import { useState, useRef, useCallback } from "react";
import demoTransfer from "@/assets/demo/demo-transfer.jpg";
import demoMeal from "@/assets/demo/demo-meal.jpg";
import demoFace from "@/assets/demo/demo-face.jpg";

const DEMO_IMAGES = [demoTransfer, demoMeal, demoFace];
const CYCLE_INTERVAL = 6000; // switch image every 6s

export function useDemo() {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const base64CacheRef = useRef<Map<string, string>>(new Map());
  const currentIndexRef = useRef(0);

  const loadImageAsBase64 = useCallback(async (src: string): Promise<string> => {
    const cached = base64CacheRef.current.get(src);
    if (cached) return cached;

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, 640, 512);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    base64CacheRef.current.set(src, base64);
    return base64;
  }, []);

  const captureFrame = useCallback((): string | null => {
    // Return cached base64 synchronously; preload ensures it's ready
    const src = DEMO_IMAGES[currentIndexRef.current];
    return base64CacheRef.current.get(src) ?? null;
  }, []);

  const start = useCallback(async () => {
    // Preload all images
    await Promise.all(DEMO_IMAGES.map((src) => loadImageAsBase64(src)));
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setIsActive(true);

    intervalRef.current = setInterval(() => {
      currentIndexRef.current = (currentIndexRef.current + 1) % DEMO_IMAGES.length;
      setCurrentIndex(currentIndexRef.current);
    }, CYCLE_INTERVAL);
  }, [loadImageAsBase64]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  }, []);

  return {
    isActive,
    currentImage: DEMO_IMAGES[currentIndex],
    captureFrame,
    start,
    stop,
  };
}
