import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, VolumeX, Square, Search, AlertTriangle, WifiOff, RefreshCw, Loader2, Camera, Play } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { useSpeech } from "@/hooks/useSpeech";
import { useAIGuide } from "@/hooks/useAIGuide";
import { useDemo } from "@/hooks/useDemo";

const GuidePage = () => {
  const navigate = useNavigate();
  const camera = useCamera();
  const demo = useDemo();
  const speech = useSpeech();
  const ai = useAIGuide();
  const startTimeRef = useRef<number>(Date.now());
  const [hasStarted, setHasStarted] = useState(false);
  const [mode, setMode] = useState<"none" | "camera" | "demo">("none");

  const handleStartCamera = async () => {
    setMode("camera");
    await camera.start();
    startTimeRef.current = Date.now();
  };

  const handleStartDemo = async () => {
    setMode("demo");
    await demo.start();
    startTimeRef.current = Date.now();
  };

  const isActiveMode = mode === "camera" ? camera.isActive : mode === "demo" ? demo.isActive : false;

  useEffect(() => {
    if (isActiveMode && !hasStarted) {
      setHasStarted(true);
      const captureFn = mode === "demo" ? demo.captureFrame : camera.captureFrame;
      ai.startPolling(captureFn);
    }
  }, [isActiveMode, hasStarted]);

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
    demo.stop();
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    navigate("/complete", { state: { elapsed, completed } });
  };

  const isWarning = ai.response?.isWarning ?? false;
  const showInitialLoading = hasStarted && !ai.response && !ai.error;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Camera feed */}
      <video
        ref={camera.videoRef}
        className={`absolute inset-0 w-full h-full object-cover ${mode !== "camera" || !camera.isActive ? 'hidden' : ''}`}
        autoPlay
        playsInline
        muted
      />
      <canvas ref={camera.canvasRef} className="hidden" />

      {/* Demo image feed */}
      {mode === "demo" && demo.isActive && (
        <img
          src={demo.currentImage}
          alt="デモ画像"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Pre-start screen */}
      {mode === "none" && !camera.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-30">
          <div className="text-center px-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">ガイドを開始</h2>
            <p className="text-sm text-muted-foreground mb-8">
              カメラまたはデモ画像でAIガイドを体験できます
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleStartCamera}
                className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base"
              >
                カメラを起動する
              </button>
              <button
                onClick={handleStartDemo}
                className="px-8 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-base flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                デモモードで体験
              </button>
            </div>
            <button
              onClick={() => navigate("/")}
              className="block mx-auto mt-4 text-sm text-muted-foreground"
            >
              戻る
            </button>
          </div>
        </div>
      )}

      {/* Top/bottom gradient */}
      <div className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 70%, rgba(0,0,0,0.6) 100%)' }}
      />

      {/* Scanning overlay */}
      {ai.isAnalyzing && (
        <div className="absolute inset-0 pointer-events-none z-[2]">
          <div className="scanning-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      )}

      {/* Demo badge */}
      {mode === "demo" && demo.isActive && (
        <div className="absolute top-4 right-4 z-20">
          <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider">
            DEMO
          </span>
        </div>
      )}

      {/* Top bar — scene */}
      {isActiveMode && (
        <div className="absolute top-0 left-0 right-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] z-10">
          <div className="flex items-center justify-between">
            <div className="hud-panel inline-flex items-center gap-2 px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-white/60" />
              <span className="text-sm font-mono text-white/80">
                {ai.response?.scene ?? "検出中..."}
              </span>
            </div>
            {ai.isAnalyzing && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-white/50">LIVE</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initial loading */}
      {showInitialLoading && (
        <div className="absolute top-16 left-0 right-0 px-4 z-10 flex justify-center">
          <div className="hud-panel inline-flex items-center gap-2 px-4 py-2">
            <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
            <span className="text-sm font-mono text-white/70">AI接続中...</span>
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
                <RefreshCw className="w-4 h-4 text-white/60" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Instruction panel */}
      {isActiveMode && (
        <div className="absolute bottom-28 left-0 right-0 px-4 z-10">
          <div className={`hud-panel px-5 py-4 ${isWarning ? "border-warning/50" : ""}`}>
            {isWarning && (
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-xs font-mono text-warning uppercase tracking-wider">注意</span>
              </div>
            )}
            <p className={`text-xl font-bold leading-snug ${isWarning ? "text-warning" : "text-white"}`}>
              {ai.response?.instruction ?? "カメラを現場に向けてください"}
            </p>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      {isActiveMode && (
        <div className="absolute bottom-6 left-0 right-0 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-10 flex items-center justify-center gap-4">
          <button
            onClick={speech.toggle}
            className="hud-panel w-14 h-14 flex items-center justify-center"
          >
            {speech.isEnabled ? (
              <Volume2 className="w-5 h-5 text-white/80" />
            ) : (
              <VolumeX className="w-5 h-5 text-white/40" />
            )}
          </button>

          <button
            onClick={() => handleStop(false)}
            className="hud-panel w-14 h-14 flex items-center justify-center border-destructive/40"
          >
            <Square className="w-5 h-5 text-destructive" />
          </button>
        </div>
      )}

      {/* Camera error fallback */}
      {camera.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="hud-panel p-8 max-w-sm text-center">
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
