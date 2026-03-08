import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, VolumeX, Square, AlertTriangle, WifiOff, RefreshCw, Loader2, Camera, Play, Eye, Activity } from "lucide-react";
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
  const [showInstruction, setShowInstruction] = useState(false);

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
      setShowInstruction(false);
      requestAnimationFrame(() => setShowInstruction(true));
      speech.speak(ai.response.instruction);
      if (mode === "demo") {
        demo.next();
      }
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
          <div className="text-center px-6 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-8 pulse-ring">
              <Camera className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">ガイドを開始</h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              カメラまたはデモ画像で<br />AIガイドを体験できます
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleStartCamera}
                className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-[0.97]"
              >
                <Camera className="w-5 h-5" />
                カメラを起動する
              </button>
              <button
                onClick={handleStartDemo}
                className="px-8 py-4 rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg flex items-center justify-center gap-3 border border-border hover:bg-accent transition-all active:scale-[0.97]"
              >
                <Play className="w-5 h-5" />
                デモモードで体験
              </button>
            </div>
            <button
              onClick={() => navigate("/")}
              className="block mx-auto mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← 戻る
            </button>
          </div>
        </div>
      )}

      {/* Top/bottom gradient */}
      <div className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 60%, rgba(0,0,0,0.75) 100%)' }}
      />

      {/* Scanning overlay */}
      {ai.isAnalyzing && (
        <div className="absolute inset-0 pointer-events-none z-[2]">
          <div className="scanning-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>
      )}

      {/* Demo badge */}
      {mode === "demo" && demo.isActive && (
        <div className="absolute top-4 right-4 z-20">
          <span className="px-4 py-1.5 rounded-full bg-primary/80 text-primary-foreground text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            DEMO
          </span>
        </div>
      )}

      {/* Top bar — scene label */}
      {isActiveMode && (
        <div className="absolute top-0 left-0 right-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Scene</p>
                <p className="text-base font-bold text-white">
                  {ai.response?.scene ?? "検出中..."}
                </p>
              </div>
            </div>
            {ai.isAnalyzing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-300 tracking-wider">LIVE</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initial loading */}
      {showInitialLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-1">AI分析を開始中</p>
              <p className="text-sm text-white/50 font-mono">接続中...</p>
            </div>
          </div>
        </div>
      )}

      {/* AI error banner */}
      {ai.error && (
        <div className="absolute top-20 left-4 right-4 z-10 animate-fade-in">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-500/20 backdrop-blur-xl border border-red-400/30">
            <WifiOff className="w-5 h-5 text-red-300 flex-shrink-0" />
            <span className="text-sm font-semibold text-red-200 flex-1">{ai.error}</span>
            {ai.isPaused && (
              <button onClick={ai.retry} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Instruction panel — the main focus area */}
      {isActiveMode && (
        <div className="absolute bottom-28 left-0 right-0 px-4 z-10">
          <div
            className={`rounded-2xl backdrop-blur-xl border-2 transition-all duration-300 ${
              isWarning
                ? "bg-amber-500/20 border-amber-400/50"
                : "bg-black/60 border-white/15"
            } ${showInstruction ? "animate-scale-in" : ""}`}
          >
            {isWarning && (
              <div className="flex items-center gap-2 px-5 pt-4 pb-1">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">⚠ 注意</span>
              </div>
            )}
            <div className="px-5 py-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isWarning ? "bg-amber-400/20" : "bg-white/10"
              }`}>
                <Activity className={`w-5 h-5 ${isWarning ? "text-amber-300" : "text-primary"}`} />
              </div>
              <p className={`text-xl font-bold leading-relaxed ${
                isWarning ? "text-amber-100" : "text-white"
              }`}>
                {ai.response?.instruction ?? "カメラを現場に向けてください"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      {isActiveMode && (
        <div className="absolute bottom-6 left-0 right-0 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-10 flex items-center justify-center gap-4">
          <button
            onClick={speech.toggle}
            className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
          >
            {speech.isEnabled ? (
              <Volume2 className="w-5 h-5 text-white" />
            ) : (
              <VolumeX className="w-5 h-5 text-white/40" />
            )}
          </button>

          <button
            onClick={() => handleStop(false)}
            className="w-14 h-14 rounded-2xl bg-red-500/20 backdrop-blur-xl border border-red-400/30 flex items-center justify-center hover:bg-red-500/30 transition-all active:scale-95"
          >
            <Square className="w-5 h-5 text-red-300" />
          </button>
        </div>
      )}

      {/* Camera error fallback */}
      {camera.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="p-8 max-w-sm text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-red-300" />
            </div>
            <p className="text-white font-bold text-lg mb-2">カメラエラー</p>
            <p className="text-sm text-white/50 mb-6">{camera.error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
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
