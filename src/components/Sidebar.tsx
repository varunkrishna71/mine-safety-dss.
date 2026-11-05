import React, { useRef, useState } from 'react';
import { SAMPLE_REPORTS } from '../data/hazardRules';
import { extractTextFromFile } from '../utils/textPreprocessor';
import { Upload, FileText, Trash2, Search, BookOpen, FileCheck } from 'lucide-react';

interface SidebarProps {
  inputMode: 'Manual Entry' | 'Upload Document';
  setInputMode: (mode: 'Manual Entry' | 'Upload Document') => void;
  reportText: string;
  setReportText: (text: string) => void;
  reportName: string;
  setReportName: (name: string) => void;
  onRunAnalysis: () => void;
  onReset: () => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  inputMode,
  setInputMode,
  reportText,
  setReportText,
  reportName,
  setReportName,
  onRunAnalysis,
  onReset,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    try {
      setReportName(file.name);
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length === 0) {
        setUploadError('The file appears to be empty or could not be parsed.');
      } else {
        setReportText(text);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to extract text from document.');
    }
  };

  const loadSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const sample = SAMPLE_REPORTS.find((s) => s.id === sampleId);
    if (sample) {
      setReportText(sample.text);
      setReportName(`${sample.title}.txt`);
      if (inputMode !== 'Manual Entry') {
        setInputMode('Manual Entry');
      }
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 shrink-0 flex flex-col h-full shadow-xs">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-900 text-white">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">⛏️</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              DGMS Safety Portal
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Coal Mines Regulations (CMR 2017)
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        {/* Input Method Selector (st.sidebar.radio) */}
        <div>
          <label className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5 mb-2.5">
            <span>📁</span> Select Input Method
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setInputMode('Manual Entry');
                if (!reportName || reportName.endsWith('.pdf') || reportName.endsWith('.docx')) {
                  setReportName('Manual_Report');
                }
              }}
              className={`text-xs py-2 px-3 rounded-md font-semibold transition-all flex items-center justify-center gap-1.5 ${
                inputMode === 'Manual Entry'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Manual Entry
            </button>
            <button
              type="button"
              onClick={() => setInputMode('Upload Document')}
              className={`text-xs py-2 px-3 rounded-md font-semibold transition-all flex items-center justify-center gap-1.5 ${
                inputMode === 'Upload Document'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Doc
            </button>
          </div>
        </div>

        {/* Input Method: Manual Entry */}
        {inputMode === 'Manual Entry' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="manual_in" className="text-xs font-semibold text-slate-700">
                Paste Inspection Report:
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {reportText.length} chars
              </span>
            </div>
            <textarea
              id="manual_in"
              value={reportText}
              onChange={(e) => {
                setReportText(e.target.value);
                if (!reportName) setReportName('Manual_Report');
              }}
              rows={11}
              placeholder="Paste underground or opencast shift inspection narrative, methanometer readings, strata observations, dust measurements, ventilation logs..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 leading-relaxed text-slate-800 transition-all resize-y"
            />
          </div>
        ) : (
          /* Input Method: Upload Document */
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 block">
              Upload PDF or DOCX:
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/30 p-6 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center text-slate-600 group-hover:text-amber-600 mb-2 transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Click to browse files
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports PDF, DOCX, and TXT files
              </p>
            </div>

            {reportName && reportName !== 'Manual_Report' && (
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold truncate">{reportName}</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                  Loaded
                </span>
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {uploadError}
              </p>
            )}

            {reportText && (
              <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 font-mono truncate">
                Preview: {reportText.substring(0, 100)}...
              </div>
            )}
          </div>
        )}

        {/* Quick Sample Presets */}
        <div className="pt-2 border-t border-slate-200">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            Quick Load Sample Reports:
          </label>
          <div className="space-y-1.5">
            {SAMPLE_REPORTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSample(sample.id)}
                className={`w-full text-left p-2 rounded-lg text-xs transition-all border flex items-center justify-between ${
                  selectedSampleId === sample.id
                    ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="truncate mr-2">
                  <span className="block truncate font-medium">{sample.title}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {sample.category}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    sample.riskExpectation === 'HIGH'
                      ? 'bg-red-100 text-red-700'
                      : sample.riskExpectation === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {sample.riskExpectation}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons (st.sidebar.columns(2)) */}
        <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-2.5 px-3 rounded-lg text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            Run Analysis
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedSampleId('');
              onReset();
            }}
            className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold py-2.5 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            Reset App
          </button>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Directorate General of Mines Safety</span>
        <span className="font-mono text-slate-400">CMR 2017</span>
      </div>
    </aside>
  );
};
