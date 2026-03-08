import { Pill, AlertTriangle, User } from "lucide-react";

const DUMMY_PATIENT = {
  name: "田中 太郎",
  age: 85,
  careLevel: "要介護3",
  medications: ["ワーファリン（朝食後）", "アムロジピン（朝夕）", "メトホルミン（毎食後）"],
  precautions: ["転倒リスク高（右膝に痛み）", "嚥下機能低下 – とろみ付き水分", "血液サラサラの薬服用中 – 出血注意"],
};

const PatientInfoPanel = () => {
  const p = DUMMY_PATIENT;

  return (
    <div className="absolute top-0 right-0 left-0 z-20 pt-[max(1rem,env(safe-area-inset-top))] px-4">
      <div className="rounded-2xl bg-black/50 backdrop-blur-xl border border-white/15 p-3">
        {/* Name row */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
          <User className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-bold text-white">{p.name}</span>
          <span className="text-xs text-white/60">{p.age}歳</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary font-bold">
            {p.careLevel}
          </span>
        </div>

        {/* Medications & Precautions side by side on wider, stacked on narrow */}
        <div className="flex flex-col gap-2 text-[11px]">
          {/* Medications */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill className="w-3 h-3 text-blue-300 flex-shrink-0" />
            {p.medications.map((med, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-blue-400/15 text-blue-200/90 border border-blue-400/20">
                {med}
              </span>
            ))}
          </div>

          {/* Precautions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
            {p.precautions.map((pre, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-200/90 border border-amber-400/20">
                {pre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoPanel;
