import { Pill, AlertTriangle, User } from "lucide-react";

const DUMMY_PATIENT = {
  name: "Taro Tanaka",
  age: 85,
  careLevel: "Care Level 3",
  medications: ["Warfarin (after breakfast)", "Amlodipine (morning & evening)", "Metformin (after each meal)"],
  precautions: ["High fall risk (right knee pain)", "Swallowing difficulty – thickened fluids", "On blood thinners – watch for bleeding"],
};

const PatientInfoPanel = () => {
  const p = DUMMY_PATIENT;

  return (
    <div className="absolute top-0 left-0 bottom-0 z-20 pt-[max(0.75rem,env(safe-area-inset-top))] pb-28 pl-2 flex">
      <div className="rounded-2xl bg-black/50 backdrop-blur-xl border border-white/15 p-3 w-[120px] flex flex-col gap-3 overflow-y-auto scrollbar-hide">
        {/* Name & basic info */}
        <div className="flex flex-col items-center gap-1.5 pb-2.5 border-b border-white/10">
          <div className="w-11 h-11 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-bold text-white text-center leading-tight">{p.name}</span>
          <span className="text-xs text-white/60">{p.age}歳</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary font-bold">
            {p.careLevel}
          </span>
        </div>

        {/* Medications */}
        <div className="flex flex-col items-center gap-1.5">
          <Pill className="w-4 h-4 text-blue-300" />
          {p.medications.map((med, i) => (
            <span
              key={i}
              className="text-[10px] leading-snug px-2 py-1 rounded bg-blue-400/15 text-blue-200/90 border border-blue-400/20 text-center w-full"
            >
              {med}
            </span>
          ))}
        </div>

        {/* Precautions */}
        <div className="flex flex-col items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          {p.precautions.map((pre, i) => (
            <span
              key={i}
              className="text-[10px] leading-snug px-2 py-1 rounded bg-amber-400/15 text-amber-200/90 border border-amber-400/20 text-center w-full"
            >
              {pre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientInfoPanel;
