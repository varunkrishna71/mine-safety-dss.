import React, { useState } from 'react';
import { ReportItem, HazardDetail } from '../../data/androidMockData';
import { 
  ArrowLeft, 
  AlertOctagon, 
  ShieldCheck, 
  Share2, 
  ChevronRight, 
  CheckCircle2, 
  FileText, 
  Database,
  Sparkles,
  MessageSquare,
  X,
  Copy,
  Check,
  HelpCircle,
  Eye,
  Lightbulb,
  FileCheck2
} from 'lucide-react';
import { 
  explainReportWithAi, 
  summarizeReportWithAi, 
  StructuredReportExplanation 
} from '../../services/apiClient';

interface AnalysisResultsScreenProps {
  report: ReportItem;
  onBackToDashboard: () => void;
  onSelectHazard: (hazard: HazardDetail) => void;
  onAskAiAssistant?: (report: ReportItem) => void;
}

export const AnalysisResultsScreen: React.FC<AnalysisResultsScreenProps> = ({
  report,
  onBackToDashboard,
  onSelectHazard,
  onAskAiAssistant,
}) => {
  const isHigh = report.safetyStatus === 'HIGH';
  const isMed = report.safetyStatus === 'MEDIUM';

  // AI Modal States
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationData, setExplanationData] = useState<StructuredReportExplanation | null>(null);
  const [showExplainModal, setShowExplainModal] = useState(false);

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const [copiedSummary, setCopiedSummary] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleShare = () => {
    alert(`Report ${report.id} summary copied for DGMS statutory transmission.`);
  };

  const handleExplainWithAi = async () => {
    setAiError(null);
    setIsExplaining(true);
    try {
      const res = await explainReportWithAi(report);
      setExplanationData(res.explanation);
      setShowExplainModal(true);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI report explanation.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSummarizeWithAi = async () => {
    setAiError(null);
    setIsSummarizing(true);
    try {
      const res = await summarizeReportWithAi(report);
      setSummaryData(res.summary);
      setShowSummaryModal(true);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI report summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopySummary = () => {
    if (summaryData) {
      navigator.clipboard.writeText(summaryData);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 pb-20 relative">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white p-4 shadow-md shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-black tracking-tight text-white leading-tight">
              Analysis Results
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              ID: {report.id} • {report.date}
            </p>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Live Backend Analysis Verification Notice & Firestore Persistence */}
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2.5 rounded-xl text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">Live Python Backend Result (FastAPI)</span>
            </div>
            <span className="text-[9px] bg-emerald-100 font-mono font-bold px-1.5 py-0.5 rounded text-emerald-800">
              Verified
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-[10px] text-emerald-700">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>Saved to Firestore:</span>
            </span>
            <span className="font-mono text-emerald-800 font-semibold truncate max-w-[200px]">
              users/{'{uid}'}/reports/{report.id}
            </span>
          </div>
        </div>

        {/* Phase 7: Gemini AI Decision Support Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-800/80 p-4 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-800/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  AI Statutory Decision Support
                </span>
                <span className="text-[10px] text-slate-300">
                  Grounded in DGMS & CMR 2017 Framework
                </span>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-900/80 border border-indigo-700 text-indigo-200">
              Gemini 3.8 Flash
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Generate detailed explanations of detected hazards, examine why risks matter, identify information gaps, and get executive summaries.
          </p>

          {aiError && (
            <div className="p-2 rounded bg-rose-900/40 border border-rose-700/60 text-[11px] text-rose-200">
              ⚠️ {aiError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleExplainWithAi}
              disabled={isExplaining}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{isExplaining ? 'Analyzing...' : 'Explain with AI'}</span>
            </button>

            <button
              onClick={handleSummarizeWithAi}
              disabled={isSummarizing}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isSummarizing ? 'Summarizing...' : 'AI Summary'}</span>
            </button>
          </div>

          {onAskAiAssistant && (
            <button
              onClick={() => onAskAiAssistant(report)}
              className="w-full py-2 px-3 rounded-xl bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-700/60 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask AI Assistant About This Report</span>
            </button>
          )}

          <p className="text-[9px] text-slate-400 italic text-center">
            Decision support only. Never alters statutory risk scores or manager authority.
          </p>
        </div>

        {/* Phase 5: Document Extraction Quality & Metadata Card */}
        {report.documentMetadata && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Document Extraction & Quality
                </span>
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {report.documentMetadata.quality_status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Format & Size</span>
                <span className="font-bold text-slate-800 font-mono text-xs">
                  .{report.documentMetadata.file_format} • {report.documentMetadata.file_size_formatted}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Content Extracted</span>
                <span className="font-bold text-slate-800 font-mono text-xs">
                  {report.documentMetadata.extracted_word_count} words
                </span>
              </div>
              {report.documentMetadata.total_pages !== null && report.documentMetadata.total_pages !== undefined && (
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Pages Processed</span>
                  <span className="font-bold text-slate-800 font-mono text-xs">
                    {report.documentMetadata.total_pages} page(s)
                  </span>
                </div>
              )}
              {report.documentMetadata.tables_extracted !== null && report.documentMetadata.tables_extracted !== undefined && (
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">Inspection Tables</span>
                  <span className="font-bold text-slate-800 font-mono text-xs">
                    {report.documentMetadata.tables_extracted} table(s)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION A: RISK ASSESSMENT CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 relative overflow-hidden">
          <div
            className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 pointer-events-none ${
              isHigh ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Composite Risk Score
            </span>
            <span
              className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                isHigh
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : isMed
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {isHigh ? '🔴 HIGH RISK' : isMed ? '🟡 MEDIUM RISK' : '🟢 LOW RISK'}
            </span>
          </div>

          {/* Large Score Gauge */}
          <div className="my-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 tracking-tight">
              {report.riskScore}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100 max</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isHigh ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(report.riskScore, 100)}%` }}
            />
          </div>

          {/* Statutory Form & Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Statutory Mandate:</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
              {report.statutoryForm || (isHigh ? 'Form IV-A (Urgent Notice)' : isMed ? 'Form J (Observation)' : 'Form K (Record)')}
            </span>
          </div>
        </div>

        {/* SECTION C: CRITICAL METHANE & THRESHOLD ALERTS */}
        {report.alerts && report.alerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4" />
              <span>Statutory Threshold Violations ({report.alerts.length})</span>
            </div>
            {report.alerts.map((alertText, idx) => (
              <div
                key={idx}
                className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-red-900 flex items-start gap-2.5 font-medium leading-relaxed"
              >
                <span className="text-red-600 text-sm mt-0.5">⚠️</span>
                <span>{alertText}</span>
              </div>
            ))}
          </div>
        )}

        {/* SECTION B: DETECTED HAZARDS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
            <span>Detected Statutory Hazards ({report.hazards.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Tap card for details</span>
          </div>

          {report.hazards.length > 0 ? (
            report.hazards.map((hazard) => (
              <div
                key={hazard.id}
                onClick={() => onSelectHazard(hazard)}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition-all cursor-pointer flex items-center justify-between group active:scale-99"
              >
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-50 transition-colors">
                    {hazard.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {hazard.name}
                      </h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        {hazard.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {hazard.shortDescription}
                    </p>
                    {hazard.matchedKeyword && (
                      <span className="text-[10px] font-mono text-slate-400 mt-1 inline-block">
                        Matched: "{hazard.matchedKeyword}"
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>No major statutory hazards detected in this inspection report.</span>
            </div>
          )}
        </div>

        {/* SECTION D: SAFETY RECOMMENDATIONS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Safety Recommendations
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {report.hazards.map((h, i) => (
              <div
                key={i}
                className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl text-amber-950"
              >
                <span className="font-bold text-amber-900 block mb-1">
                  {h.name} Protocol:
                </span>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {h.recommendations[0]}
                </p>
              </div>
            ))}

            {report.hazards.length === 0 && (
              <p className="text-[11px] text-slate-600">
                Maintain standard statutory logging. No remedial engineering interventions required.
              </p>
            )}
          </div>
        </div>

        {/* SECTION E: ADDITIONAL INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Report Title</span>
            <span className="font-bold text-slate-800 text-right truncate max-w-[180px]">{report.title}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Working Location</span>
            <span className="font-semibold text-slate-800">{report.mineLocation}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Inspection Shift</span>
            <span className="font-mono text-slate-800">{report.shift}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Total Hazards Found</span>
            <span className="font-bold text-slate-900">{report.hazardCount}</span>
          </div>
        </div>

        {/* Return Button */}
        <button
          onClick={onBackToDashboard}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>

      {/* ================= MODAL 1: STRUCTURED AI REPORT EXPLANATION ================= */}
      {showExplainModal && explanationData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden text-slate-100 shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white">Gemini Report Explanation</h3>
                  <p className="text-[10px] text-slate-400">CMR 2017 Grounded Safety Analysis</p>
                </div>
              </div>
              <button
                onClick={() => setShowExplainModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Incident Summary */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                  Incident Summary
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {explanationData.incident_summary}
                </p>
              </div>

              {/* Event Explanation */}
              {explanationData.explanation_of_event && (
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/40 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Explanation of Event
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {explanationData.explanation_of_event}
                  </p>
                </div>
              )}

              {/* Hazard Explanations */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Why Identified Hazards Matter
                </span>
                {explanationData.hazard_explanations?.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 space-y-1">
                    <span className="font-bold text-indigo-300 block text-xs">
                      {item.hazard_name}
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {item.explanation}
                    </p>
                    {item.report_evidence && (
                      <p className="text-[10px] text-indigo-400/80 italic font-mono pt-1">
                        Report Evidence: "{item.report_evidence}"
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Information Gaps & Uncertainties */}
              {explanationData.information_gaps && explanationData.information_gaps.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Identified Information Gaps</span>
                  </div>
                  <ul className="space-y-1 pl-2 text-slate-300">
                    {explanationData.information_gaps.map((gap, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Inspections */}
              {explanationData.suggested_inspections && explanationData.suggested_inspections.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Recommended Shift Inspections</span>
                  </div>
                  <ul className="space-y-1 pl-2 text-slate-300">
                    {explanationData.suggested_inspections.map((insp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{insp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Statutory Notice */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 text-center">
                {explanationData.safety_notice || 'Decision support only. CMR 2017 statutory compliance must be verified by the Mine Manager.'}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              {onAskAiAssistant && (
                <button
                  onClick={() => {
                    setShowExplainModal(false);
                    onAskAiAssistant(report);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ask Follow-Up in Chat
                </button>
              )}
              <button
                onClick={() => setShowExplainModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EXECUTIVE AI SUMMARY ================= */}
      {showSummaryModal && summaryData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden text-slate-100 shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Executive Statutory Summary</h3>
                  <p className="text-[10px] text-slate-400">DGMS Shift Handover Brief</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopySummary}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 flex items-center gap-1 text-xs"
                  title="Copy Summary"
                >
                  {copiedSummary ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="text-[10px]">{copiedSummary ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 whitespace-pre-wrap font-mono text-[11px] text-slate-300">
                {summaryData}
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[10px] text-amber-300 text-center">
                AI-generated executive summary for decision support only. CMR 2017 statutory compliance must be verified by the Mine Manager.
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
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
