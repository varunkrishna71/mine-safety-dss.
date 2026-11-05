import React, { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

interface SplashScreenProps {
  onFinishSplash: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinishSplash }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinishSplash();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onFinishSplash]);

  return (
    <div
      onClick={onFinishSplash}
      className="h-full w-full bg-slate-900 text-white flex flex-col items-center justify-between p-8 select-none cursor-pointer relative overflow-hidden"
    >
      {/* Background industrial graphic grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top spacer */}
      <div className="w-full flex justify-end">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
          DGMS · CMR 2017
        </span>
      </div>

      {/* Main Logo & Identity */}
      <div className="flex flex-col items-center text-center space-y-4 my-auto">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 flex items-center justify-center shadow-2xl shadow-amber-500/20 animate-pulse">
            <span className="text-5xl">⛏️</span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 border-2 border-slate-900 shadow-md">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
            MINE SAFETY DSS
          </h1>
          <p className="text-xs font-semibold text-sky-400 tracking-wider uppercase">
            Mine Safety Decision Support System
          </p>
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 font-medium">
          Directorate General of Mines Safety
        </div>
      </div>

      {/* Bottom Loading Indicator */}
      <div className="w-full flex flex-col items-center space-y-3 pb-4">
        <div className="w-44 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-amber-500 to-sky-400 rounded-full animate-[shimmer_1.5s_infinite] w-3/4" />
        </div>
        <p className="text-[11px] text-slate-400 font-mono">
          Initializing Safety Engine...
        </p>
        <span className="text-[10px] text-slate-400">
          Tap anywhere to skip
        </span>
      </div>
    </div>
  );
};
