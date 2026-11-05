import React from 'react';
import { X, ShieldAlert, BookOpen, AlertTriangle } from 'lucide-react';
import { DGMS_HAZARD_RULES } from '../data/hazardRules';

interface RegulatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegulatoryModal: React.FC<RegulatoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm">CMR 2017 & DGMS Statutory Standards Reference</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Statutory Reporting Forms
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="font-bold text-red-900 font-mono">Form IV-A (High Risk ≥ 70):</span>
                <p className="mt-1 text-slate-700">
                  Notice of dangerous occurrences (Regulation 8 & 166). Required within 24 hours for inflammable gas accumulation exceeding permissible limits, strata collapse, spontaneous combustion, or emergency evacuations.
                </p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="font-bold text-amber-900 font-mono">Form J (Medium Risk 35–69):</span>
                <p className="mt-1 text-slate-700">
                  Register of minor accidents, occupational hazards, equipment safety guarding deficits, or respirable dust violations requiring scheduled remedial action.
                </p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="font-bold text-emerald-900 font-mono">Form K (Low Risk &lt; 35):</span>
                <p className="mt-1 text-slate-700">
                  Statutory record of compliant inspection, standard shift observations, and regular safety committee verification logs.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Threshold Rules & DGMS Directives
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {Object.entries(DGMS_HAZARD_RULES.hazards).map(([category, keywords]) => (
                <div key={category} className="p-3 bg-white">
                  <div className="font-semibold text-slate-900">{category}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Keywords: {keywords.join(', ')}
                  </div>
                  <div className="text-[11px] text-amber-800 mt-1">
                    Directive: {DGMS_HAZARD_RULES.recommendations[category as keyof typeof DGMS_HAZARD_RULES.recommendations]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
