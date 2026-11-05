import React from 'react';

interface HazardChartProps {
  hazards: Record<string, string>;
}

const CATEGORY_COLORS: Record<string, { bg: string; bar: string; text: string; border: string }> = {
  'Methane Accumulation': {
    bg: 'bg-red-50',
    bar: 'bg-red-500',
    text: 'text-red-700',
    border: 'border-red-200'
  },
  'Roof/Strata Instability': {
    bg: 'bg-amber-50',
    bar: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  'Ventilation Failure': {
    bg: 'bg-orange-50',
    bar: 'bg-orange-500',
    text: 'text-orange-700',
    border: 'border-orange-200'
  },
  'Respirable Dust': {
    bg: 'bg-yellow-50',
    bar: 'bg-yellow-500',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  'Water Inrush': {
    bg: 'bg-blue-50',
    bar: 'bg-blue-500',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  'Machinery Accident': {
    bg: 'bg-purple-50',
    bar: 'bg-purple-500',
    text: 'text-purple-700',
    border: 'border-purple-200'
  }
};

const DEFAULT_COLOR = {
  bg: 'bg-slate-50',
  bar: 'bg-slate-500',
  text: 'text-slate-700',
  border: 'border-slate-200'
};

export const HazardChart: React.FC<HazardChartProps> = ({ hazards }) => {
  const hazardEntries = Object.entries(hazards);

  if (hazardEntries.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3">
        <span className="text-xl">✅</span>
        <div>
          <h4 className="font-semibold text-sm">No major hazards detected.</h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            Report text complies with standard statutory safety limits and baseline guidelines.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800 text-base flex items-center gap-2">
            <span>📊</span> Hazard Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Identified statutory danger categories under DGMS & CMR 2017
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-700 rounded-full">
          {hazardEntries.length} Active {hazardEntries.length === 1 ? 'Hazard' : 'Hazards'}
        </span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="space-y-3.5 mt-2">
        {hazardEntries.map(([category, matchedKeyword]) => {
          const style = CATEGORY_COLORS[category] || DEFAULT_COLOR;

          return (
            <div key={category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${style.bar}`} />
                  {category}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  Trigger: <span className="font-semibold text-slate-700">"{matchedKeyword}"</span>
                </span>
              </div>

              {/* Progress bar representing count = 1.0 (100% severity presence in this inspection) */}
              <div className="h-5 w-full bg-slate-100 rounded-md overflow-hidden relative border border-slate-200/60">
                <div
                  className={`h-full ${style.bar} transition-all duration-500 flex items-center justify-end px-2 text-[10px] font-bold text-white shadow-xs`}
                  style={{ width: '100%' }}
                >
                  Detected (Count: 1)
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Plotly White distribution equivalent</span>
        <span className="font-mono">Total Category Occurrences: {hazardEntries.length}</span>
      </div>
    </div>
  );
};
