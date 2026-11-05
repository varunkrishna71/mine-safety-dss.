import React from 'react';
import { RiskLevel } from '../types';

interface MetricsRowProps {
  score: number;
  level: RiskLevel;
  icon: string;
  form: string;
  hazardCount: number;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({
  score,
  level,
  icon,
  form,
  hazardCount,
}) => {
  const getScoreColor = () => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 35) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const getStatusColor = () => {
    if (level === 'HIGH') return 'text-red-700 bg-red-100 border-red-300';
    if (level === 'MEDIUM') return 'text-amber-700 bg-amber-100 border-amber-300';
    return 'text-emerald-700 bg-emerald-100 border-emerald-300';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Metric 1: Risk Score */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Risk Score
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {score}<span className="text-base font-normal text-slate-500">/100</span>
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getScoreColor()}`}>
            {score >= 70 ? 'CRITICAL' : score >= 35 ? 'ELEVATED' : 'NOMINAL'}
          </span>
        </div>
        {/* Visual score bar */}
        <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              score >= 70 ? 'bg-red-500' : score >= 35 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
          />
        </div>
      </div>

      {/* Metric 2: Safety Status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Safety Status
        </span>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            {level}
          </span>
        </div>
        <div className="mt-3">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border inline-block ${getStatusColor()}`}>
            {level === 'HIGH' ? 'Immediate Action Required' : level === 'MEDIUM' ? 'Corrective Action Required' : 'Permissible Standard'}
          </span>
        </div>
      </div>

      {/* Metric 3: Statutory Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Statutory Form
        </span>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-blue-700 tracking-tight font-mono">
            {form}
          </span>
        </div>
        <div className="mt-3">
          <span className="text-[11px] font-medium text-slate-500 truncate block">
            CMR 2017 Requirement
          </span>
        </div>
      </div>

      {/* Metric 4: Hazards Found */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Hazards Found
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-slate-900">
            {hazardCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Categories
          </span>
        </div>
        <div className="mt-3">
          <span className="text-[11px] font-medium text-slate-500">
            {hazardCount === 0 ? 'Compliant conditions' : `${hazardCount} triggered rules`}
          </span>
        </div>
      </div>
    </div>
  );
};
