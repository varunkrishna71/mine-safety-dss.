import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

interface AnalysisLoadingScreenProps {
  onComplete: () => void;
}

const STATUS_STEPS = [
  { progress: 20, text: 'Processing incident description & normalizing text...' },
  { progress: 45, text: 'Scanning for DGMS statutory hazards...' },
  { progress: 70, text: 'Evaluating CMR 2017 methane threshold limits...' },
  { progress: 88, text: 'Calculating composite risk score...' },
  { progress: 100, text: 'Preparing safety assessment & recommendations...' }
];

export const AnalysisLoadingScreen: React.FC<AnalysisLoadingScreenProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STATUS_STEPS.length - 1) {
          const next = prev + 1;
          setProgress(STATUS_STEPS[next].progress);
          return next;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 450);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="h-full w-full bg-slate-900 text-white flex flex-col items-center justify-between p-8 select-none">
      {/* Top Header */}
      <div className="text-center space-y-1">
        <span className="text-[10px] uppercase font-mono tracking-widest text-sky-400">
          MINE SAFETY DSS ENGINE
        </span>
        <h2 className="text-lg font-bold text-white">
          Incident Evaluation
        </h2>
      </div>

      {/* Center Radar / Pulse Animation */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Outer Pulsing Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-sky-500/30 animate-ping" />
          <div className="absolute inset-4 rounded-full border border-amber-500/40 animate-pulse" />
          <div className="absolute inset-8 rounded-full border border-blue-500/60" />

          {/* Center Core */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center shadow-xl shadow-sky-500/30">
            <Cpu className="w-8 h-8 text-white animate-spin [animation-duration:6s]" />
          </div>
        </div>

        {/* Text Title */}
        <h3 className="text-base font-black text-white mt-6 tracking-tight">
          Analysing Mining Incident...
        </h3>

        {/* Dynamic Status message */}
        <p className="text-xs text-sky-300 font-medium mt-2 text-center max-w-xs h-8">
          {STATUS_STEPS[currentStepIndex].text}
        </p>
      </div>

      {/* Bottom Progress Bar & Disclaimer */}
      <div className="w-full max-w-xs space-y-3 pb-6">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>PROGRESS</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulated Phase 2 Frontend Verification</span>
        </div>
      </div>
    </div>
  );
};
