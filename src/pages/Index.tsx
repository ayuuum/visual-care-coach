import { useNavigate } from "react-router-dom";
import { Glasses, Sparkles, Shield, Mic } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Glasses className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              CareGlass
            </h1>
            <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
              AR Glass AI Assistant
            </p>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center text-muted-foreground mb-10 leading-relaxed">
          ARグラス対応のリアルタイム介護AIアシスタント。
          <br />
          カメラ映像からAIが介助場面を自動認識し、
          <br />
          音声とHUDで次の行動を指示します。
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-10 w-full">
          {[
            { icon: Sparkles, label: "AI認識" },
            { icon: Mic, label: "音声ガイド" },
            { icon: Shield, label: "安全警告" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl bg-secondary border border-border"
            >
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={() => navigate("/guide")}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg tracking-wide hover:brightness-110 transition-all active:scale-[0.98]"
        >
          ガイドを開始する
        </button>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          ※ MVPではスマートフォンカメラを使用します
        </p>
      </div>
    </div>
  );
};

export default Index;
