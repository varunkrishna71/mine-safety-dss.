import React, { useState } from 'react';
import { DGMS_HAZARD_RULES } from '../data/hazardRules';
import { RiskLevel } from '../types';
import { AlertTriangle, AlertOctagon, Info, CheckCircle2, Copy, Check } from 'lucide-react';

interface RecommendationsProps {
  alerts: string[];
  hazards: Record<string, string>;
  reportName: string;
  level: RiskLevel;
  form: string;
  score: number;
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  alerts,
  hazards,
  reportName,
  level,
  form,
  score,
}) => {
  const [copied, setCopied] = useState(false);
  const hazardKeys = Object.keys(hazards);

  const copySummary = () => {
    const summaryText = `MINE SAFETY DSS - AUDIT SUMMARY
Report: ${reportName}
Safety Status: ${level} (Risk Score: ${score}/100)
Recommended Statutory Action: File ${form} under CMR 2017

CRITICAL ALERTS:
${alerts.length > 0 ? alerts.map((a) => `- ${a}`).join('\n') : 'None'}

IDENTIFIED HAZARDS & DGMS DIRECTIVES:
${
  hazardKeys.length > 0
    ? hazardKeys
        .map(
          (h) =>
            `- ${h}: ${
              DGMS_HAZARD_RULES.recommendations[h as keyof typeof DGMS_HAZARD_RULES.recommendations] ||
              'Follow Standard Safety Procedures.'
            }`
        )
        .join('\n')
    : 'All parameters within standard safety limits.'
}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800 text-base flex items-center gap-2">
            <span>💡</span> Recommendations
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescribed actions under DGMS circulars and Coal Mines Regulations 2017
          </p>
        </div>
        <button
          onClick={copySummary}
          title="Copy compliance dossier to clipboard"
          className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* 1. Critical Threshold Alerts (st.error) */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alertText, idx) => {
            const isCritical = alertText.includes('CRITICAL');
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                  isCritical
                    ? 'bg-red-50 border-red-300 text-red-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                {isCritical ? (
                  <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs leading-relaxed font-medium">
                  <span className="font-bold">{alertText.split(':')[0]}:</span>
                  {alertText.substring(alertText.indexOf(':') + 1)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Detected Hazards Recommendations (st.warning) */}
      {hazardKeys.length > 0 ? (
        <div className="space-y-2.5">
          {hazardKeys.map((hazard) => {
            const recommendation =
              DGMS_HAZARD_RULES.recommendations[hazard as keyof typeof DGMS_HAZARD_RULES.recommendations] ||
              'Follow Standard Safety Procedures.';

            return (
              <div
                key={hazard}
                className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-lg text-amber-950 flex items-start gap-2.5"
              >
                <span className="text-amber-600 shrink-0 text-base mt-0.5">⚠️</span>
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-amber-900">{hazard}:</span>{' '}
                  <span className="text-slate-700">{recommendation}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg text-emerald-900 flex items-center gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>No specific hazard interventions triggered. Continue statutory shift logs.</span>
        </div>
      )}

      {/* 3. Statutory Form Summary Info Box (st.info) */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-3.5 text-sky-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold">Summary:</span> Analysis of{' '}
          <span className="font-semibold text-slate-800 underline decoration-sky-300">
            {reportName || 'Manual_Report'}
          </span>{' '}
          indicates <strong className="text-sky-950">{level}</strong> risk. Filing{' '}
          <strong className="text-blue-700 font-mono px-1.5 py-0.5 bg-blue-100 rounded text-[11px]">
            {form}
          </strong>{' '}
          is recommended.
        </div>
      </div>
    </div>
  );
};
