import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, VolumeX, Square, Search, AlertTriangle, WifiOff, RefreshCw, Loader2 } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { useSpeech } from "@/hooks/useSpeech";
import { useAIGuide } from "@/hooks/useAIGuide";

const GuidePage = () => {
  const navigate = useNavigate();
  const camera = useCamera();
  const speech = useSpeech();
  const ai = useAIGuide();
  const startTimeRef = useRef<number>(Date.now());
  const [hasStarted, setHasStarted] = useState(false);

  // Start camera on mount
  useEffect(() => {
    camera.start();
    startTimeRef.current = Date.now();
  }, []);

  // Start AI polling when camera is active
  useEffect(() => {
    if (camera.isActive && !hasStarted) {
      setHasStarted(true);
      ai.startPolling(camera.captureFrame);
    }
  }, [camera.isActive, hasStarted]);

  // Speak instruction when it changes
  useEffect(() => {
    if (ai.response?.instruction) {
      speech.speak(ai.response.instruction);
    }
  }, [ai.response?.instruction]);

  // Navigate to complete when done
  useEffect(() => {
    if (ai.response?.isComplete) {
      handleStop(true);
    }
  }, [ai.response?.isComplete]);

  const handleStop = (completed = false) => {
    ai.stopPolling();
    camera.stop();
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    navigate("/complete", { state: { elapsed, completed } });
  };

  const isWarning = ai.response?.isWarning ?? false;
  const showInitialLoading = hasStarted && !ai.response && !ai.error;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Camera feed — full screen */}
      <video
        ref={camera.videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      <canvas ref={camera.canvasRef} className="hidden" />

      {/* Scanning overlay */}
      {ai.isAnalyzing && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="scanning-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
        </div>
      )}

      {/* Top bar — scene recognition */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="hud-panel inline-flex items-center gap-2 px-4 py-2">
          <Search className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono text-foreground">
            {ai.response?.scene ?? "シーンを検出中..."}
          </span>
          {ai.isAnalyzing && (
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>
      </div>

      {/* Center — instruction HUD */}
      <div className="absolute bottom-28 left-0 right-0 px-4 z-10">
        <div
          className={`hud-panel px-6 py-5 ${
            isWarning ? "border-warning/50 bg-warning/10" : ""
          }`}
        >
          {isWarning && (
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-xs font-mono text-warning uppercase tracking-wider">
                注意
              </span>
            </div>
          )}
          <p
            className={`text-2xl font-bold leading-snug ${
              isWarning ? "text-warning" : "text-foreground hud-text-glow"
            }`}
          >
            {ai.response?.instruction ?? "カメラを現場に向けてください"}
          </p>
        </div>
      </div>

      {/* Initial loading state */}
      {showInitialLoading && (
        <div className="absolute top-16 left-0 right-0 px-4 z-10 flex justify-center">
          <div className="hud-panel inline-flex items-center gap-2 px-4 py-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm font-mono text-muted-foreground">AI接続中...</span>
          </div>
        </div>
      )}

      {/* AI error banner */}
      {ai.error && (
        <div className="absolute top-16 left-0 right-0 px-4 z-10 flex justify-center">
          <div className="hud-panel inline-flex items-center gap-2 px-4 py-2 border-destructive/40">
            <WifiOff className="w-4 h-4 text-destructive" />
            <span className="text-sm font-mono text-destructive">{ai.error}</span>
            {ai.isPaused && (
              <button onClick={ai.retry} className="ml-2 p-1 rounded hover:bg-white/10">
                <RefreshCw className="w-4 h-4 text-primary" />
              </button>
            )}
          </div>
        </div>
      )}
      {/* Bottom controls */}
      <div className="absolute bottom-6 left-0 right-0 px-4 z-10 flex items-center justify-center gap-4">
        <button
          onClick={speech.toggle}
          className="hud-panel w-14 h-14 flex items-center justify-center"
        >
          {speech.isEnabled ? (
            <Volume2 className="w-5 h-5 text-primary" />
          ) : (
            <VolumeX className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        <button
          onClick={() => handleStop(false)}
          className="hud-panel w-14 h-14 flex items-center justify-center border-destructive/40"
        >
          <Square className="w-5 h-5 text-destructive" />
        </button>
      </div>

      {/* Camera error fallback */}
      {camera.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-20">
          <div className="hud-panel p-8 max-w-sm text-center">
            <p className="text-foreground font-semibold mb-2">カメラエラー</p>
            <p className="text-sm text-muted-foreground mb-4">{camera.error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidePage;
