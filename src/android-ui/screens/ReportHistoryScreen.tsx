import React, { useState, useMemo } from 'react';
import { ReportItem } from '../../data/androidMockData';
import { 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  FileText,
  Trash2,
  RefreshCw,
  PlusCircle
} from 'lucide-react';

interface ReportHistoryScreenProps {
  reports: ReportItem[];
  onSelectReport: (report: ReportItem) => void;
  onDeleteReport?: (reportId: string) => Promise<void>;
  isLoading?: boolean;
  onRefresh?: () => void;
  onNavigateToAnalyse?: () => void;
}

export const ReportHistoryScreen: React.FC<ReportHistoryScreenProps> = ({ 
  reports,
  onSelectReport,
  onDeleteReport,
  isLoading = false,
  onRefresh,
  onNavigateToAnalyse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'SCORE_HIGH' | 'SCORE_LOW'>('NEWEST');
  const [reportToDelete, setReportToDelete] = useState<ReportItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredReports = useMemo(() => {
    let result = [...reports];

    // Filter by risk tier
    if (riskFilter !== 'ALL') {
      if (riskFilter === 'HIGH') {
        result = result.filter((r) => r.riskScore >= 70 || r.safetyStatus?.includes('HIGH'));
      } else if (riskFilter === 'MEDIUM') {
        result = result.filter((r) => (r.riskScore >= 35 && r.riskScore < 70) || r.safetyStatus?.includes('MEDIUM'));
      } else if (riskFilter === 'LOW') {
        result = result.filter((r) => r.riskScore < 35 || r.safetyStatus?.includes('LOW'));
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          (r.mineLocation && r.mineLocation.toLowerCase().includes(q)) ||
          (r.fileName && r.fileName.toLowerCase().includes(q))
      );
    }


    // Sort
    if (sortBy === 'NEWEST') {
      result.sort((a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime());
    } else if (sortBy === 'OLDEST') {
      result.sort((a, b) => new Date(a.timestamp || a.date).getTime() - new Date(b.timestamp || b.date).getTime());
    } else if (sortBy === 'SCORE_HIGH') {
      result.sort((a, b) => b.riskScore - a.riskScore);
    } else if (sortBy === 'SCORE_LOW') {
      result.sort((a, b) => a.riskScore - b.riskScore);
    }

    return result;
  }, [reports, searchQuery, riskFilter, sortBy]);

  const handleDeleteConfirm = async () => {
    if (!reportToDelete || !onDeleteReport) return;
    setIsDeleting(true);
    try {
      await onDeleteReport(reportToDelete.id);
      setReportToDelete(null);
    } catch (err) {
      console.error('Failed to delete report:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 pb-20 select-none">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-5 pt-3 shadow-md shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <span>📜</span> Report Audit History
            </h2>
            <p className="text-[11px] text-slate-400">
              Cloud Firestore Archived Statutory Records
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh Firestore records"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mt-3.5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, seam, report ID..."
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Filter Chips */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setRiskFilter('ALL')}
            className={`text-[11px] px-3 py-1 rounded-full font-bold transition-all shrink-0 ${
              riskFilter === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All ({reports.length})
          </button>
          <button
            onClick={() => setRiskFilter('HIGH')}
            className={`text-[11px] px-3 py-1 rounded-full font-bold transition-all shrink-0 ${
              riskFilter === 'HIGH'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-rose-400 hover:text-rose-300'
            }`}
          >
            High Risk
          </button>
          <button
            onClick={() => setRiskFilter('MEDIUM')}
            className={`text-[11px] px-3 py-1 rounded-full font-bold transition-all shrink-0 ${
              riskFilter === 'MEDIUM'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-amber-400 hover:text-amber-300'
            }`}
          >
            Medium Risk
          </button>
          <button
            onClick={() => setRiskFilter('LOW')}
            className={`text-[11px] px-3 py-1 rounded-full font-bold transition-all shrink-0 ${
              riskFilter === 'LOW'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-emerald-400 hover:text-emerald-300'
            }`}
          >
            Low Risk
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Sort & Result Count Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            {isLoading ? 'Querying Firestore...' : `Showing ${filteredReports.length} records`}
          </span>
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-[11px] bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="SCORE_HIGH">Highest Risk</option>
              <option value="SCORE_LOW">Lowest Risk</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length > 0 ? (
          <div className="space-y-2.5">
            {filteredReports.map((report) => {
              const isHigh = report.riskScore >= 70 || report.safetyStatus?.includes('HIGH');
              const isMed = (report.riskScore >= 35 && report.riskScore < 70) || report.safetyStatus?.includes('MEDIUM');

              return (
                <div
                  key={report.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-400 transition-all flex items-center justify-between group"
                >
                  <div 
                    onClick={() => onSelectReport(report)}
                    className="flex items-start gap-3 min-w-0 pr-2 cursor-pointer flex-1"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 font-semibold truncate max-w-[120px]">
                          {report.id}
                        </span>
                        <span className="text-[9px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded font-bold shrink-0">
                          {report.statutoryForm || (isHigh ? 'Form IV-A' : isMed ? 'Form J' : 'Form K')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                        {report.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {report.mineLocation || 'Underground Seam 3'}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {report.date}
                        </span>
                        <span>•</span>
                        <span>{report.hazardCount} hazards</span>
                      </div>
                    </div>
                  </div>


                  <div className="text-right shrink-0 flex items-center gap-2 pl-2">
                    <div onClick={() => onSelectReport(report)} className="cursor-pointer">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md inline-block ${
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

                    {onDeleteReport && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportToDelete(report);
                        }}
                        title="Delete report"
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button 
                      onClick={() => onSelectReport(report)}
                      className="p-1 text-slate-300 group-hover:text-amber-500 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">
                {reports.length === 0 ? 'No Previous Reports Found' : 'No Reports Matched Filter'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {reports.length === 0
                  ? 'No previous reports found. Analyse your first mining incident to get started.'
                  : 'Try adjusting your search terms or filter selection to view matching evaluations.'}
              </p>
            </div>
            {reports.length === 0 && onNavigateToAnalyse && (
              <button
                onClick={onNavigateToAnalyse}
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Analyse First Mining Incident</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Delete Safety Report</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-800">"{reportToDelete.title}"</strong> ({reportToDelete.id}) from your Cloud Firestore database?
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setReportToDelete(null)}
                disabled={isDeleting}
                className="py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="py-2 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
