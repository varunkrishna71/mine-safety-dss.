import React from 'react';
import { ReportItem } from '../../data/androidMockData';
import { UserProfile } from '../../services/firebase';
import { 
  User, 
  FileSearch, 
  Upload, 
  History, 
  ChevronRight, 
  TrendingUp, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2,
  HardHat,
  Database,
  PlusCircle,
  FileText,
  Sparkles
} from 'lucide-react';

interface DashboardScreenProps {
  userProfile: UserProfile | null;
  userReports: ReportItem[];
  onNavigateToAnalyse: (mode?: 'Manual' | 'Upload') => void;
  onNavigateToHistory: () => void;
  onNavigateToProfile: () => void;
  onSelectReport: (report: ReportItem) => void;
  onNavigateToAiAssistant?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userProfile,
  userReports,
  onNavigateToAnalyse,
  onNavigateToHistory,
  onNavigateToProfile,
  onSelectReport,
  onNavigateToAiAssistant,
}) => {
  // Live statistics calculated from actual Firestore user reports
  const totalAnalyzed = userReports.length;
  const highRiskCount = userReports.filter((r) => r.riskScore >= 70 || r.safetyStatus?.includes('HIGH')).length;
  const mediumRiskCount = userReports.filter((r) => (r.riskScore >= 35 && r.riskScore < 70) || r.safetyStatus?.includes('MEDIUM')).length;
  const lowRiskCount = userReports.filter((r) => r.riskScore < 35 || r.safetyStatus?.includes('LOW')).length;


  const highPct = totalAnalyzed > 0 ? Math.round((highRiskCount / totalAnalyzed) * 100) : 0;
  const medPct = totalAnalyzed > 0 ? Math.round((mediumRiskCount / totalAnalyzed) * 100) : 0;
  const lowPct = totalAnalyzed > 0 ? Math.round((lowRiskCount / totalAnalyzed) * 100) : 0;

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 pb-20 select-none">
      {/* Header Section */}
      <div className="bg-slate-900 text-white p-5 pt-3 shadow-md shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg text-amber-400">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white leading-tight">
                MINE SAFETY DSS
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                DGMS Compliance & Decision Support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToProfile}
              className="p-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-baseline justify-between">
          <div>
            <p className="text-xs text-slate-400">Authenticated Safety Officer</p>
            <p className="text-sm font-bold text-white truncate max-w-[200px]">
              {userProfile?.fullName || 'Er. Mining Safety Officer'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-400" />
              Firestore Synced
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Statistics Cards (Real Stored Statistics) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Surveillance Summary ({userReports.length} Reports)
            </h3>
            <span className="text-[10px] text-slate-400">Cloud Stored</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Total Analysed */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500">
                Total Analysed
              </span>
              <div className="my-1.5 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">
                  {totalAnalyzed}
                </span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> Reports
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Underground & Opencast
              </span>
            </div>

            {/* High-Risk Reports */}
            <div className="bg-white p-3.5 rounded-2xl border border-rose-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-rose-500/10 rounded-bl-xl flex items-center justify-center text-rose-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-rose-700">
                High Risk (Form IV-A)
              </span>
              <div className="my-1.5 flex items-baseline justify-between">
                <span className="text-2xl font-black text-rose-600">
                  {highRiskCount}
                </span>
                <span className="text-[10px] text-rose-700 bg-rose-100 font-bold px-1.5 py-0.5 rounded">
                  {highPct}%
                </span>
              </div>
              <span className="text-[10px] text-rose-600/80 font-medium">
                Immediate Action Required
              </span>
            </div>

            {/* Medium-Risk Reports */}
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-amber-700">
                Medium Risk (Form J)
              </span>
              <div className="my-1.5 flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-600">
                  {mediumRiskCount}
                </span>
                <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-1.5 py-0.5 rounded">
                  {medPct}%
                </span>
              </div>
              <span className="text-[10px] text-amber-700/80 font-medium">
                Observations Logged
              </span>
            </div>

            {/* Low-Risk Reports */}
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-emerald-700">
                Low Risk (Form K)
              </span>
              <div className="my-1.5 flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-600">
                  {lowRiskCount}
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.5 rounded">
                  {lowPct}%
                </span>
              </div>
              <span className="text-[10px] text-emerald-700/80 font-medium">
                Standard Operations
              </span>
            </div>
          </div>
        </div>

        {/* AI Safety Assistant Feature Banner */}
        {onNavigateToAiAssistant && (
          <div
            onClick={onNavigateToAiAssistant}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/60 shadow-md cursor-pointer hover:border-amber-500/70 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">
                      AI Mine Safety Assistant
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-semibold">
                      Gemini 3.8
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    Instant DGMS & CMR 2017 hazard explanations, report summaries & statutory Q&A.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onNavigateToAnalyse('Manual')}
              className="bg-white hover:bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shadow-xs text-left transition-all active:scale-98 flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileSearch className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  Analyse Incident
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                  Manual description
                </span>
              </div>
            </button>

            <button
              onClick={() => onNavigateToAnalyse('Upload')}
              className="bg-white hover:bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shadow-xs text-left transition-all active:scale-98 flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  Upload Report
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                  PDF, DOCX, TXT files
                </span>
              </div>
            </button>

            <button
              onClick={onNavigateToHistory}
              className="bg-white hover:bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shadow-xs text-left transition-all active:scale-98 flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <History className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  Report History
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                  {userReports.length} saved records
                </span>
              </div>
            </button>

            <button
              onClick={onNavigateToProfile}
              className="bg-white hover:bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shadow-xs text-left transition-all active:scale-98 flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  Officer Profile
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                  Firestore & Security
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        {totalAnalyzed > 0 ? (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Risk Distribution
              </h3>
              <span className="text-[11px] font-mono text-slate-400">CMR 2017 Basis</span>
            </div>

            {/* Stacked Visual Bar */}
            <div className="h-4 w-full rounded-full overflow-hidden flex gap-0.5 bg-slate-100 p-0.5 border border-slate-200">
              {highPct > 0 && (
                <div
                  style={{ width: `${highPct}%` }}
                  className="bg-rose-500 rounded-l-full h-full"
                  title={`High Risk: ${highPct}%`}
                />
              )}
              {medPct > 0 && (
                <div
                  style={{ width: `${medPct}%` }}
                  className="bg-amber-500 h-full"
                  title={`Medium Risk: ${medPct}%`}
                />
              )}
              {lowPct > 0 && (
                <div
                  style={{ width: `${lowPct}%` }}
                  className="bg-emerald-500 rounded-r-full h-full"
                  title={`Low Risk: ${lowPct}%`}
                />
              )}
            </div>

            {/* Legend Items */}
            <div className="mt-3.5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                <span className="block text-[10px] font-semibold text-rose-700">High Risk</span>
                <span className="font-extrabold text-rose-900 text-sm">{highPct}%</span>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                <span className="block text-[10px] font-semibold text-amber-700">Medium Risk</span>
                <span className="font-extrabold text-amber-900 text-sm">{medPct}%</span>
              </div>
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="block text-[10px] font-semibold text-emerald-700">Low Risk</span>
                <span className="font-extrabold text-emerald-900 text-sm">{lowPct}%</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Recent Analysis List */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recent Evaluations
            </h3>
            {userReports.length > 0 && (
              <button
                onClick={onNavigateToHistory}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center"
              >
                See all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {userReports.length > 0 ? (
              userReports.slice(0, 4).map((report) => {
                const isHigh = report.riskScore >= 70 || report.safetyStatus?.includes('HIGH');
                const isMed = (report.riskScore >= 35 && report.riskScore < 70) || report.safetyStatus?.includes('MEDIUM');


                return (
                  <div
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 cursor-pointer transition-all active:scale-99 flex items-center justify-between"
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base font-bold ${
                          isHigh
                            ? 'bg-rose-50 text-rose-600'
                            : isMed
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {isHigh ? (
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                        ) : isMed ? (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {report.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                          <span>{report.date}</span>
                          <span>•</span>
                          <span>{report.statutoryForm || (isHigh ? 'Form IV-A' : isMed ? 'Form J' : 'Form K')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          isHigh
                            ? 'bg-rose-100 text-rose-700'
                            : isMed
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {report.riskScore}/100
                      </span>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                        {isHigh ? 'HIGH' : isMed ? 'MEDIUM' : 'LOW'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2.5">
                <FileText className="w-7 h-7 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">
                  No previous reports found
                </h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Analyse your first mining incident to calculate statutory risk scores and store them in Firestore.
                </p>
                <button
                  onClick={() => onNavigateToAnalyse('Manual')}
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Start Incident Analysis</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
