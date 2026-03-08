import { useNavigate } from "react-router-dom";
import { Glasses, Sparkles, Shield, Mic, ArrowRight, Eye } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full animate-fade-in">
        <div className="mb-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-5 pulse-ring">
            <Glasses className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-1">
            CareGlass
          </h1>
          <p className="text-xs text-muted-foreground font-mono tracking-[0.25em] uppercase">
            AR Care Assistant
          </p>
        </div>

        <p className="text-center text-muted-foreground mb-10 leading-relaxed text-lg">
          Real-time AI care assistant for AR glasses.
          <br />
          AI automatically recognizes care scenes from
          <br />
          camera feed and guides your next action.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-10 w-full">
          {[
            { icon: Eye, label: "Recognition", desc: "Auto scene detection" },
            { icon: Mic, label: "Voice Guide", desc: "Real-time narration" },
            { icon: Shield, label: "Safety Alerts", desc: "Instant warnings" },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 py-5 px-3 rounded-2xl bg-secondary/80 border border-border hover-scale"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-base font-semibold text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground text-center leading-tight">{desc}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/guide")}
          className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-bold text-xl tracking-wide hover:brightness-110 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
        >
          Start Guide
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="mt-5 text-sm text-muted-foreground text-center">
          ※ MVP uses smartphone camera
        </p>
      </div>
    </div>
  );
};

export default Index;
