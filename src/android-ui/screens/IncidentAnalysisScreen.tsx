import React, { useState, useRef } from 'react';
import { SAMPLE_REPORTS } from '../../data/hazardRules';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  FileUp, 
  X,
  FileCheck2
} from 'lucide-react';

interface IncidentAnalysisScreenProps {
  initialMode?: 'Manual' | 'Upload';
  onStartAnalysis: (payload: { title: string; location: string; text: string; fileName?: string; rawFile?: File }) => void;
}

export const IncidentAnalysisScreen: React.FC<IncidentAnalysisScreenProps> = ({
  initialMode = 'Manual',
  onStartAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'Manual' | 'Upload'>(initialMode);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Underground District 4B (Panel C)');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  // Document Upload State
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    sizeFormatted: string;
    type: string;
    rawText: string;
    file?: File;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateManualForm = (): boolean => {
    const errs: { title?: string; description?: string } = {};
    if (!title.trim()) {
      errs.title = 'Incident title is required.';
    }
    if (!description.trim()) {
      errs.description = 'Incident description text is required.';
    } else if (description.trim().length < 15) {
      errs.description = 'Please provide at least 15 characters describing conditions.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleManualSubmit = () => {
    if (validateManualForm()) {
      onStartAnalysis({
        title: title.trim(),
        location: location.trim() || 'Unspecified District',
        text: description.trim(),
      });
    }
  };

  const handleClearManual = () => {
    setTitle('');
    setDescription('');
    setErrors({});
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const sizeKb = (file.size / 1024).toFixed(1);
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

    try {
      const text = await file.text();
      setSelectedFile({
        name: file.name,
        sizeFormatted: `${sizeKb} KB`,
        type: ext,
        rawText: text.length > 20 ? text : SAMPLE_REPORTS[0].text,
        file: file,
      });
    } catch {
      setUploadError('Unable to read file content in mobile emulator.');
    }
  };

  const handleUploadSubmit = () => {
    if (!selectedFile) {
      setUploadError('Please select a PDF, DOCX, or TXT file first.');
      return;
    }

    onStartAnalysis({
      title: selectedFile.name.replace(/\.[^/.]+$/, ''),
      location: 'Uploaded Document Dossier',
      text: selectedFile.rawText,
      fileName: selectedFile.name,
      rawFile: selectedFile.file,
    });
  };

  const loadSample = (sample: typeof SAMPLE_REPORTS[0]) => {
    setTitle(sample.title);
    setLocation(sample.category);
    setDescription(sample.text);
    setErrors({});
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 pb-20">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-5 pt-3 shadow-md shrink-0">
        <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
          <span>🛡️</span> New Incident Analysis
        </h2>
        <p className="text-[11px] text-slate-400">
          NLP-Based Assessment for CMR 2017 Compliance
        </p>

        {/* Tab Toggle */}
        <div className="mt-3.5 bg-slate-800 p-1 rounded-xl grid grid-cols-2 gap-1">
          <button
            onClick={() => setActiveTab('Manual')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'Manual'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('Upload')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'Upload'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Document
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* OPTION A: MANUAL INCIDENT ENTRY */}
        {activeTab === 'Manual' ? (
          <div className="space-y-4">
            {/* Incident Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Incident / Shift Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                placeholder="e.g. District 4B Gas Influx & Strata Observation"
                className={`w-full text-xs p-3 rounded-xl bg-white border ${
                  errors.title ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 transition-all`}
              />
              {errors.title && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
            </div>

            {/* Mine Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mine / Working District
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Seam III Continuous Miner Heading"
                className="w-full text-xs p-3 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900"
              />
            </div>

            {/* Description Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Incident Narrative <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {description.length} chars
                </span>
              </div>
              <textarea
                rows={7}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: undefined });
                }}
                placeholder="Describe the mining incident, hazardous conditions, equipment failures or safety observations..."
                className={`w-full text-xs font-mono p-3 rounded-xl bg-white border ${
                  errors.description ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 leading-relaxed`}
              />
              {errors.description && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.description}
                </p>
              )}
            </div>

            {/* Quick Sample Presets */}
            <div className="bg-slate-100/90 p-3 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 block mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Fill with Test Scenario:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_REPORTS.slice(0, 3).map((sample, idx) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => loadSample(sample)}
                    className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors font-medium flex items-center gap-1"
                  >
                    <span>{idx === 0 ? '🔴 High Risk' : idx === 1 ? '🟡 Med Risk' : '🟢 Safe'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleManualSubmit}
                className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🔍</span> Analyse Incident
              </button>
              <button
                type="button"
                onClick={handleClearManual}
                className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-500" /> Clear Input
              </button>
            </div>
          </div>
        ) : (
          /* OPTION B: DOCUMENT UPLOAD */
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Document Upload Interface
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Supports statutory inspection reports in PDF, DOCX, or TXT
                  </p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/20 p-6 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFilePicked}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Tap to Choose File
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Android Storage Access Framework (SAF)
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span className="bg-slate-200 px-1.5 py-0.5 rounded">.PDF</span>
                  <span className="bg-slate-200 px-1.5 py-0.5 rounded">.DOCX</span>
                  <span className="bg-slate-200 px-1.5 py-0.5 rounded">.TXT</span>
                </div>
              </div>

              {/* Selected File Card */}
              {selectedFile ? (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <FileCheck2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {selectedFile.type} • {selectedFile.sizeFormatted} • Ready for audit
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null}

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Quick Demo Pre-fill for Upload */}
            {!selectedFile && (
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 space-y-1.5">
                <span className="font-semibold text-slate-700 text-[11px] block">
                  Quick Load Demo Document:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile({
                      name: 'DGMS_District4B_Shift2_Audit.pdf',
                      sizeFormatted: '184 KB',
                      type: 'PDF',
                      rawText: SAMPLE_REPORTS[0].text,
                    });
                  }}
                  className="w-full text-left p-2 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-800 flex items-center justify-between"
                >
                  <span className="truncate">DGMS_District4B_Shift2_Audit.pdf</span>
                  <span className="text-[10px] text-blue-600 font-mono">184 KB</span>
                </button>
              </div>
            )}

            {/* Upload Action Button */}
            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={!selectedFile}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🚀</span> Upload and Analyse Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
