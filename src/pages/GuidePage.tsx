import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, VolumeX, Square, Search, AlertTriangle, WifiOff, RefreshCw, Loader2, Camera } from "lucide-react";
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

  const handleStartCamera = async () => {
    await camera.start();
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (camera.isActive && !hasStarted) {
      setHasStarted(true);
      ai.startPolling(camera.captureFrame);
    }
  }, [camera.isActive, hasStarted]);

  useEffect(() => {
    if (ai.response?.instruction) {
      speech.speak(ai.response.instruction);
    }
  }, [ai.response?.instruction]);

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

  // Pre-camera start screen
  if (!camera.isActive && !camera.error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Camera className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">カメラを起動</h2>
          <p className="text-sm text-muted-foreground mb-8">
            現場をカメラで撮影し、AIがリアルタイムでガイドします
          </p>
          <button
            onClick={handleStartCamera}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
          >
            カメラを起動する
          </button>
          <button
            onClick={() => navigate("/")}
            className="block mx-auto mt-4 text-sm text-muted-foreground"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Camera feed */}
      <video
        ref={camera.videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      <canvas ref={camera.canvasRef} className="hidden" />

      {/* Vignette overlay */}
      <div className="absolute inset-0 hud-vignette z-[1]" />

      {/* Scanning overlay */}
      {ai.isAnalyzing && (
        <div className="absolute inset-0 pointer-events-none z-[2]">
          <div className="scanning-line absolute left-0 right-0" />
        </div>
      )}

      {/* Top bar — scene + status */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] z-10">
        <div className="flex items-center justify-between">
          <div className="hud-panel hud-glow-border inline-flex items-center gap-2 px-4 py-2">
            <Search className="w-3.5 h-3.5" style={{ color: 'hsl(175 80% 55%)' }} />
            <span className="text-sm font-mono text-white/80">
              {ai.response?.scene ?? "検出中..."}
            </span>
          </div>
          <div className="hud-panel inline-flex items-center gap-2 px-3 py-2">
            <div className="hud-status-dot" />
            <span className="text-xs font-mono text-white/60 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>

      {/* Initial loading */}
      {showInitialLoading && (
        <div className="absolute top-20 left-0 right-0 px-4 z-10 flex justify-center">
          <div className="hud-panel hud-glow-border inline-flex items-center gap-2 px-4 py-2">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'hsl(175 80% 55%)' }} />
            <span className="text-sm font-mono text-white/70">AI接続中...</span>
          </div>
        </div>
      )}

      {/* AI error banner */}
      {ai.error && (
        <div className="absolute top-20 left-0 right-0 px-4 z-10 flex justify-center">
          <div className="hud-panel inline-flex items-center gap-2 px-4 py-2 border-destructive/40">
            <WifiOff className="w-4 h-4 text-destructive" />
            <span className="text-sm font-mono text-destructive">{ai.error}</span>
            {ai.isPaused && (
              <button onClick={ai.retry} className="ml-2 p-1 rounded hover:bg-white/10">
                <RefreshCw className="w-4 h-4" style={{ color: 'hsl(175 80% 55%)' }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Instruction panel */}
      <div className="absolute bottom-32 left-0 right-0 px-4 z-10">
        <div
          className={`hud-panel hud-glow-border hud-corner-marks hud-accent-line px-6 py-5 ${
            isWarning ? "border-warning/50 !border-l-warning/70" : ""
          }`}
        >
          {/* Extra corners via spans */}
          <span className="hud-corner-tr" />
          <span className="hud-corner-bl" />

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
              isWarning ? "text-warning" : "text-white hud-text-glow"
            }`}
          >
            {ai.response?.instruction ?? "カメラを現場に向けてください"}
          </p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-6 left-0 right-0 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-10 flex items-center justify-center gap-6">
        <button
          onClick={speech.toggle}
          className="hud-panel hud-glow-border flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all hover:shadow-[0_0_20px_hsl(175_80%_55%/0.3)]"
        >
          {speech.isEnabled ? (
            <Volume2 className="w-5 h-5" style={{ color: 'hsl(175 80% 55%)' }} />
          ) : (
            <VolumeX className="w-5 h-5 text-white/40" />
          )}
          <span className="text-[10px] font-mono text-white/50 mt-1">音声</span>
        </button>

        <button
          onClick={() => handleStop(false)}
          className="hud-panel flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-destructive/30 transition-all hover:shadow-[0_0_20px_hsl(0_72%_55%/0.3)]"
        >
          <Square className="w-5 h-5 text-destructive" />
          <span className="text-[10px] font-mono text-white/50 mt-1">停止</span>
        </button>
      </div>

      {/* Camera error fallback */}
      {camera.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="hud-panel hud-glow-border p-8 max-w-sm text-center">
            <p className="text-white font-semibold mb-2">カメラエラー</p>
            <p className="text-sm text-white/60 mb-4">{camera.error}</p>
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
