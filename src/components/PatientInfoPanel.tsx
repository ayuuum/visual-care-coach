import { useState } from "react";
import { ChevronDown, ChevronUp, Pill, AlertTriangle, User } from "lucide-react";

const DUMMY_PATIENT = {
  name: "田中 太郎",
  age: 85,
  careLevel: "要介護3",
  medications: ["ワーファリン（朝食後）", "アムロジピン（朝夕）", "メトホルミン（毎食後）"],
  precautions: ["転倒リスク高（右膝に痛み）", "嚥下機能低下 – とろみ付き水分", "血液サラサラの薬服用中 – 出血注意"],
};

const PatientInfoPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const p = DUMMY_PATIENT;

  return (
    <div className="absolute top-0 right-0 z-20 pt-[max(1rem,env(safe-area-inset-top))] pr-4 pl-4 max-w-[280px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-xl border border-white/15 hover:bg-black/60 transition-all"
      >
        <User className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-white truncate">{p.name}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-white/50" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/50" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 p-4 animate-fade-in">
          {/* Basic info */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
            <span className="text-sm text-white/70">{p.age}歳</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary font-bold">
              {p.careLevel}
            </span>
          </div>

          {/* Medications */}
          <div className="mb-3">
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">服薬情報</p>
            <div className="space-y-1">
              {p.medications.map((med, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-blue-300 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-white/80">{med}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Precautions */}
          <div>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">注意事項</p>
            <div className="space-y-1">
              {p.precautions.map((pre, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-amber-200/90">{pre}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInfoPanel;
