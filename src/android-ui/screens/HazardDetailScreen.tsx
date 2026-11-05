import React, { useState } from 'react';
import { HazardDetail } from '../../data/androidMockData';
import { 
  ArrowLeft, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  BookOpen, 
  Sparkles,
  X,
  Copy,
  Check,
  MessageSquare,
  Bot
} from 'lucide-react';
import { explainHazardWithAi } from '../../services/apiClient';

interface HazardDetailScreenProps {
  hazard: HazardDetail;
  onBack: () => void;
  onAskAiAboutHazard?: (hazardName: string) => void;
}

export const HazardDetailScreen: React.FC<HazardDetailScreenProps> = ({ 
  hazard, 
  onBack,
  onAskAiAboutHazard 
}) => {
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExplainWithGemini = async () => {
    setErrorMsg(null);
    setIsExplaining(true);
    try {
      const res = await explainHazardWithAi(hazard.name);
      setAiExplanation(res.explanation);
      setShowAiModal(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch Gemini hazard explanation.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleCopyExplanation = () => {
    if (aiExplanation) {
      navigator.clipboard.writeText(aiExplanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 pb-20 relative">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white p-4 shadow-md shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-black tracking-tight text-white leading-tight">
              Hazard Technical Profile
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              {hazard.categoryCode} • DGMS & CMR 2017
            </p>
          </div>
        </div>

        <button
          onClick={handleExplainWithGemini}
          disabled={isExplaining}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-[11px] font-bold shadow-sm transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" />
          <span>{isExplaining ? 'Analyzing...' : 'Gemini AI'}</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Header Hero Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shrink-0 border border-slate-200">
            {hazard.icon}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-md inline-block mb-1">
              {hazard.severity} Severity
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              {hazard.name}
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Statutory Code: {hazard.categoryCode}
            </p>
          </div>
        </div>

        {/* Phase 7: Gemini AI Technical Explanation Callout */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/80 shadow-md text-white space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Gemini 3.8 Flash Hazard Intelligence</span>
            </div>
            <span className="text-[9px] font-mono text-indigo-300">DGMS Guardrails</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Obtain statutory technical definitions, catastrophic risk mechanics, and CMR 2017 compliance mandates for {hazard.name}.
          </p>
          {errorMsg && (
            <p className="text-[10px] text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-800">
              ⚠️ {errorMsg}
            </p>
          )}
          <button
            onClick={handleExplainWithGemini}
            disabled={isExplaining}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isExplaining ? 'Querying Gemini Safety Models...' : `Explain "${hazard.name}" with Gemini`}</span>
          </button>
        </div>

        {/* Description Section */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Statutory Hazard Definition</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {hazard.shortDescription}
          </p>
        </div>

        {/* Potential Consequences Section */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Potential Consequences</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {hazard.consequences.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Safety Precautions Section */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Mandatory Safety Precautions</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {hazard.safetyPrecautions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations Section */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <span className="text-base">💡</span>
            <span>DGMS Prescribed Recommendations</span>
          </div>
          <div className="space-y-2">
            {hazard.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl text-xs text-amber-950 font-medium"
              >
                {rec}
              </div>
            ))}
          </div>
        </div>

        {/* Ask Assistant Option */}
        {onAskAiAboutHazard && (
          <button
            onClick={() => onAskAiAboutHazard(hazard.name)}
            className="w-full py-3 px-4 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-indigo-100 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Ask AI Assistant About {hazard.name}</span>
          </button>
        )}

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer"
        >
          Back to Results
        </button>
      </div>

      {/* ================= MODAL: GEMINI HAZARD EXPLANATION ================= */}
      {showAiModal && aiExplanation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden text-slate-100 shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{hazard.name}</h3>
                  <p className="text-[10px] text-slate-400">Gemini 3.8 Technical Analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyExplanation}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 flex items-center gap-1 text-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 whitespace-pre-wrap font-sans text-slate-200">
                {aiExplanation}
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[10px] text-amber-300 text-center">
                AI explanation grounded in DGMS & CMR 2017. Intended for decision support only.
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              {onAskAiAboutHazard && (
                <button
                  onClick={() => {
                    setShowAiModal(false);
                    onAskAiAboutHazard(hazard.name);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat in Assistant
                </button>
              )}
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
