import { useRef, useState, useCallback, useEffect } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error("VIDEO_ELEMENT_NOT_READY");

      video.srcObject = stream;
      video.muted = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");

      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error("VIDEO_INIT_TIMEOUT")), 5000);
        const onReady = () => {
          window.clearTimeout(timeout);
          resolve();
        };
        video.onloadedmetadata = onReady;
        video.oncanplay = onReady;
      });

      await video.play();
      setIsActive(true);
      setError(null);
    } catch (err) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setIsActive(false);
      setError("カメラ映像を取得できません。権限とブラウザ設定を確認してください");
      console.error("Camera error:", err);
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsActive(false);
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    if (video.readyState < video.HAVE_CURRENT_DATA) return null;

    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, 640, 480);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    // Strip data URL prefix, return pure base64
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    return base64;
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, canvasRef, isActive, error, start, stop, captureFrame };
}
