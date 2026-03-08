import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, RotateCcw, Home } from "lucide-react";

const CompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { elapsed = 0, completed = false } = (location.state as { elapsed?: number; completed?: boolean }) ?? {};

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        <div className="w-20 h-20 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-6 pulse-ring">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          {completed ? "ガイドが完了しました" : "ガイドを終了しました"}
        </h1>

        <p className="text-muted-foreground mb-8">お疲れ様でした</p>

        {/* Timer */}
        <div className="px-8 py-4 mb-10 text-center rounded-xl bg-secondary border border-border">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
            所要時間
          </p>
          <p className="text-3xl font-bold font-mono text-foreground">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => navigate("/guide")}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            もう一度
          </button>
          <button
            onClick={() => navigate("/")}
            className="py-3 px-5 rounded-xl border border-border text-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary transition-all"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletePage;
