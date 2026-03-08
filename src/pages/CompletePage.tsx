import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, RotateCcw, Home, Clock } from "lucide-react";

const CompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { elapsed = 0, completed = false } = (location.state as { elapsed?: number; completed?: boolean }) ?? {};

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center mb-8 pulse-ring">
          <CheckCircle className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-2">
          {completed ? "ガイド完了" : "お疲れ様でした"}
        </h1>

        <p className="text-base text-muted-foreground mb-10">
          {completed ? "介助が正しく完了しました" : "ガイドを終了しました"}
        </p>

        {/* Timer card */}
        <div className="w-full px-8 py-6 mb-10 text-center rounded-2xl bg-secondary border border-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
              所要時間
            </p>
          </div>
          <p className="text-5xl font-bold font-mono text-foreground">
            {String(minutes).padStart(2, "0")}
            <span className="text-primary mx-1">:</span>
            {String(seconds).padStart(2, "0")}
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => navigate("/guide")}
            className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.97]"
          >
            <RotateCcw className="w-5 h-5" />
            もう一度
          </button>
          <button
            onClick={() => navigate("/")}
            className="py-4 px-6 rounded-2xl border-2 border-border text-foreground font-semibold flex items-center justify-center gap-2 hover:bg-secondary transition-all active:scale-[0.97]"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletePage;
