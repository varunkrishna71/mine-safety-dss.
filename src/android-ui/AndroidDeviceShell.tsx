import React, { useState, useEffect } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { ForgotPasswordModal } from './screens/ForgotPasswordModal';
import { DashboardScreen } from './screens/DashboardScreen';
import { IncidentAnalysisScreen } from './screens/IncidentAnalysisScreen';
import { AnalysisLoadingScreen } from './screens/AnalysisLoadingScreen';
import { AnalysisResultsScreen } from './screens/AnalysisResultsScreen';
import { HazardDetailScreen } from './screens/HazardDetailScreen';
import { ReportHistoryScreen } from './screens/ReportHistoryScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AiAssistantScreen } from './screens/AiAssistantScreen';
import { MOCK_REPORTS, SIX_HAZARDS, ReportItem, HazardDetail } from '../data/androidMockData';
import { 
  checkBackendHealth, 
  analyzeIncidentText, 
  analyzeIncidentDocument,
  BackendAnalysisResponse
} from '../services/apiClient';
import { 
  auth, 
  UserProfile, 
  fetchUserProfile, 
  getUserReports, 
  saveUserReport, 
  deleteUserReport, 
  logoutUser 
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Home, 
  FileSearch, 
  History, 
  User, 
  Wifi, 
  Signal, 
  BatteryMedium, 
  Code2, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  AlertCircle,
  Database,
  Sparkles
} from 'lucide-react';

interface AndroidDeviceShellProps {
  onOpenCodeInspector: () => void;
}

type ScreenType =
  | 'SPLASH'
  | 'LOGIN'
  | 'REGISTER'
  | 'DASHBOARD'
  | 'ANALYSE'
  | 'LOADING'
  | 'RESULTS'
  | 'HAZARD_DETAIL'
  | 'HISTORY'
  | 'PROFILE'
  | 'AI_ASSISTANT';

export const AndroidDeviceShell: React.FC<AndroidDeviceShellProps> = ({ onOpenCodeInspector }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('SPLASH');
  const [activeTab, setActiveTab] = useState<'home' | 'analyse' | 'ai' | 'history' | 'profile'>('home');
  const [selectedReport, setSelectedReport] = useState<ReportItem>(MOCK_REPORTS[0]);
  const [selectedHazard, setSelectedHazard] = useState<HazardDetail>(SIX_HAZARDS[0]);
  const [activeReportForAi, setActiveReportForAi] = useState<ReportItem | null>(null);
  const [analyseInitialMode, setAnalyseInitialMode] = useState<'Manual' | 'Upload'>('Manual');
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(true);

  // Authentication & User Management State (Phase 6)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userReports, setUserReports] = useState<ReportItem[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState<boolean>(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);

  // Backend Connectivity State
  const [backendStatus, setBackendStatus] = useState<{
    connected: boolean;
    version: string;
    checking: boolean;
    error?: string;
  }>({
    connected: false,
    version: '1.0.0',
    checking: true,
  });

  const [apiError, setApiError] = useState<string | null>(null);


  // Poll / Check backend health
  const verifyBackend = async () => {
    setBackendStatus((prev) => ({ ...prev, checking: true }));
    const result = await checkBackendHealth();
    if (result.ok && result.data) {
      setBackendStatus({
        connected: true,
        version: result.data.version || '1.0.0',
        checking: false,
      });
    } else {
      setBackendStatus({
        connected: false,
        version: '1.0.0',
        checking: false,
        error: result.error || 'Server offline',
      });
    }
  };

  // Load User Reports from Firestore
  const loadUserReports = async (uid: string) => {
    setIsReportsLoading(true);
    try {
      const records = await getUserReports(uid);
      setUserReports(records);
      if (records.length > 0) {
        setSelectedReport(records[0]);
      }
    } catch (err) {
      console.error('Error fetching user reports from Firestore:', err);
    } finally {
      setIsReportsLoading(false);
    }
  };

  // Firebase Auth State Listener
  useEffect(() => {
    verifyBackend();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await fetchUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
            loadUserReports(fbUser.uid);
          } else {
            const fallback: UserProfile = {
              uid: fbUser.uid,
              fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Safety Officer',
              email: fbUser.email || 'officer@dgms.gov.in',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              emailVerified: fbUser.emailVerified,
              role: 'Safety Officer',
              miningZone: 'Eastern Coalfields / DGMS Zone 1'
            };
            setCurrentUser(fallback);
            loadUserReports(fbUser.uid);
          }
        } catch (e) {
          console.error('Failed to load user profile on auth change:', e);
        }
      } else {
        setCurrentUser(null);
        setUserReports([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real API Navigation & Analysis Execution with Firestore persistence
  const handleStartAnalysis = async (payload: {
    title: string;
    location: string;
    text: string;
    fileName?: string;
    rawFile?: File;
  }) => {
    setApiError(null);
    setCurrentScreen('LOADING');


    try {
      let apiResult: BackendAnalysisResponse;

      if (payload.rawFile) {
        // Real document upload call to POST /api/v1/analyze-file (with Bearer token)
        apiResult = await analyzeIncidentDocument(payload.rawFile);
      } else {
        // Real manual text analysis call to POST /api/v1/analyze (with Bearer token)
        apiResult = await analyzeIncidentText(payload.text, payload.title);
      }

      // Map real backend response to UI ReportItem
      const mappedHazards: HazardDetail[] = apiResult.detected_hazards.map((dh) => {
        const found = SIX_HAZARDS.find((sh) => sh.name.toLowerCase() === dh.category.toLowerCase());
        if (found) {
          return {
            ...found,
            matchedKeyword: dh.matched_keyword,
            recommendations: [dh.recommendation, ...found.recommendations.slice(1)],
          };
        }
        return {
          id: dh.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: dh.category,
          categoryCode: 'CMR-2017',
          icon: '⚠️',
          shortDescription: `Detected hazard category: ${dh.category}`,
          severity: 'HIGH',
          consequences: ['Potential violation of statutory safety threshold.'],
          safetyPrecautions: ['Adhere strictly to DGMS guidelines and circulars.'],
          recommendations: [dh.recommendation],
          matchedKeyword: dh.matched_keyword,
        };
      });

      const nowIso = new Date().toISOString();
      const realReport: ReportItem = {
        id: apiResult.request_id.substring(0, 12).toUpperCase(),
        title: apiResult.report_name || payload.title || 'Shift Incident Audit',
        mineLocation: payload.location || 'Central Underground Colliery',
        shift: 'Active Surveillance Shift',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        timestamp: nowIso,
        riskScore: apiResult.risk_assessment.risk_score,
        safetyStatus: apiResult.risk_assessment.safety_status,
        statutoryForm: apiResult.risk_assessment.statutory_form as any,
        hazardCount: apiResult.hazard_count,
        hazards: mappedHazards,
        alerts: apiResult.alerts,
        summary: apiResult.summary,
        reportText: payload.text,
        documentMetadata: apiResult.document_metadata,
        sourceType: payload.rawFile ? 'file_upload' : 'manual_text',
        fileName: payload.fileName || payload.rawFile?.name,
        recommendations: apiResult.recommendations
      };


      // Persist analysis record into Firestore if authenticated
      if (currentUser?.uid) {
        try {
          await saveUserReport(currentUser.uid, realReport);
          setUserReports((prev) => [realReport, ...prev.filter((r) => r.id !== realReport.id)]);
        } catch (dbErr) {
          console.error('Failed to save report to Firestore:', dbErr);
        }
      }

      setSelectedReport(realReport);
      setTimeout(() => {
        setCurrentScreen('RESULTS');
      }, 700);

    } catch (err: any) {
      console.error('Backend analysis call failed:', err);
      setApiError(err.message || 'Cannot complete analysis with Python backend.');
      setCurrentScreen('ANALYSE');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!currentUser?.uid) return;
    await deleteUserReport(currentUser.uid, reportId);
    setUserReports((prev) => prev.filter((r) => r.id !== reportId));
    if (selectedReport.id === reportId && userReports.length > 1) {
      setSelectedReport(userReports.find((r) => r.id !== reportId) || MOCK_REPORTS[0]);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserReports([]);
    setCurrentScreen('LOGIN');
    setActiveTab('home');
  };

  const navigateToTab = (tab: 'home' | 'analyse' | 'ai' | 'history' | 'profile') => {
    if (!currentUser && currentScreen !== 'LOGIN' && currentScreen !== 'REGISTER') {
      setCurrentScreen('LOGIN');
      return;
    }

    setActiveTab(tab);
    setApiError(null);
    if (tab === 'home') setCurrentScreen('DASHBOARD');
    if (tab === 'analyse') {
      setAnalyseInitialMode('Manual');
      setCurrentScreen('ANALYSE');
    }
    if (tab === 'ai') setCurrentScreen('AI_ASSISTANT');
    if (tab === 'history') setCurrentScreen('HISTORY');
    if (tab === 'profile') setCurrentScreen('PROFILE');
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900 min-h-screen">
      {/* Top Controls Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 text-white text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                backendStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            <span className="font-bold tracking-wide">
              MINE SAFETY DSS · Android Client (Phase 7 Gemini AI Integrated)
            </span>
          </div>

          {/* Backend Connection Indicator Pill */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
              backendStatus.connected
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-red-950/80 text-red-300 border-red-700/60'
            }`}
          >
            <span>{backendStatus.connected ? `FastAPI v${backendStatus.version}` : 'Backend Offline'}</span>
            <button
              onClick={verifyBackend}
              title="Refresh connection to Python backend"
              className="hover:rotate-180 transition-transform p-0.5"
            >
              <RefreshCw className={`w-3 h-3 ${backendStatus.checking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Gemini AI Capability Pill */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Gemini 3.8 Flash</span>
          </div>

          {/* Firestore Sync Pill */}
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-blue-950/80 text-blue-300 border border-blue-700/60">
            <Database className="w-3 h-3 text-blue-400" />
            <span>Firestore ABAC</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDeviceFrame(!isDeviceFrame)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
          >
            {isDeviceFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span>{isDeviceFrame ? 'Full Width' : 'Phone Frame'}</span>
          </button>

          <button
            onClick={onOpenCodeInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Architecture (Kotlin & FastAPI)</span>
          </button>
        </div>
      </div>

      {/* Android Device Mockup Frame */}
      <div
        className={`bg-slate-950 text-slate-900 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col relative ${
          isDeviceFrame
            ? 'w-full max-w-[412px] h-[860px] rounded-[48px] border-[12px] border-slate-800 ring-1 ring-slate-700'
            : 'w-full max-w-4xl h-[860px] rounded-2xl border-4 border-slate-800'
        }`}
      >
        {/* Device Hardware Top Elements (Camera punch-hole, speaker) */}
        {isDeviceFrame && (
          <div className="h-7 w-full bg-slate-900 flex items-center justify-between px-6 pt-1 select-none z-50 shrink-0">
            <span className="text-[11px] font-semibold text-slate-300 font-mono">10:42</span>
            {/* Front Camera cutout */}
            <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
            </div>
            {/* Status Icons */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Screen Viewport Container */}
        <div className="flex-1 w-full overflow-hidden flex flex-col relative bg-slate-900">
          {/* Active Screen Transition */}
          {currentScreen === 'SPLASH' && (
            <SplashScreen
              onFinishSplash={() => {
                if (auth.currentUser) {
                  setCurrentScreen('DASHBOARD');
                } else {
                  setCurrentScreen('LOGIN');
                }
              }}
            />
          )}

          {currentScreen === 'LOGIN' && (
            <LoginScreen
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                loadUserReports(user.uid);
                setActiveTab('home');
                setCurrentScreen('DASHBOARD');
              }}
              onNavigateToRegister={() => setCurrentScreen('REGISTER')}
              onForgotPassword={() => setIsForgotPasswordOpen(true)}
            />
          )}

          {currentScreen === 'REGISTER' && (
            <RegisterScreen
              onRegisterSuccess={(user) => {
                setCurrentUser(user);
                loadUserReports(user.uid);
                setActiveTab('home');
                setCurrentScreen('DASHBOARD');
              }}
              onNavigateToLogin={() => setCurrentScreen('LOGIN')}
            />
          )}

          {currentScreen === 'DASHBOARD' && (
            <DashboardScreen
              userProfile={currentUser}
              userReports={userReports}
              onNavigateToAnalyse={(mode) => {
                if (mode) setAnalyseInitialMode(mode);
                setActiveTab('analyse');
                setCurrentScreen('ANALYSE');
              }}
              onNavigateToHistory={() => {
                setActiveTab('history');
                setCurrentScreen('HISTORY');
              }}
              onNavigateToProfile={() => {
                setActiveTab('profile');
                setCurrentScreen('PROFILE');
              }}
              onSelectReport={(rep) => {
                setSelectedReport(rep);
                setCurrentScreen('RESULTS');
              }}
              onNavigateToAiAssistant={() => {
                setActiveReportForAi(null);
                setActiveTab('ai');
                setCurrentScreen('AI_ASSISTANT');
              }}
            />
          )}

          {currentScreen === 'ANALYSE' && (
            <div className="h-full flex flex-col overflow-hidden">
              {apiError && (
                <div className="p-3 bg-rose-500/10 border-b border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}
              <IncidentAnalysisScreen
                initialMode={analyseInitialMode}
                onStartAnalysis={handleStartAnalysis}
              />
            </div>
          )}

          {currentScreen === 'LOADING' && (
            <AnalysisLoadingScreen
              onComplete={() => {
                // Wait for the async API promise to populate selectedReport
              }}
            />
          )}

          {currentScreen === 'RESULTS' && (
            <AnalysisResultsScreen
              report={selectedReport}
              onBackToDashboard={() => {
                setActiveTab('home');
                setCurrentScreen('DASHBOARD');
              }}
              onSelectHazard={(haz) => {
                setSelectedHazard(haz);
                setCurrentScreen('HAZARD_DETAIL');
              }}
              onAskAiAssistant={(rep) => {
                setActiveReportForAi(rep);
                setActiveTab('ai');
                setCurrentScreen('AI_ASSISTANT');
              }}
            />
          )}

          {currentScreen === 'HAZARD_DETAIL' && (
            <HazardDetailScreen
              hazard={selectedHazard}
              onBack={() => {
                setCurrentScreen('RESULTS');
              }}
              onAskAiAboutHazard={(_hazardName) => {
                setActiveTab('ai');
                setCurrentScreen('AI_ASSISTANT');
              }}
            />
          )}

          {currentScreen === 'AI_ASSISTANT' && (
            <AiAssistantScreen
              activeReport={activeReportForAi}
              onClearActiveReport={() => setActiveReportForAi(null)}
              onNavigateToReport={(rep) => {
                setSelectedReport(rep);
                setCurrentScreen('RESULTS');
              }}
            />
          )}

          {currentScreen === 'HISTORY' && (
            <ReportHistoryScreen
              reports={userReports}
              onSelectReport={(rep) => {
                setSelectedReport(rep);
                setCurrentScreen('RESULTS');
              }}
              onDeleteReport={handleDeleteReport}
              isLoading={isReportsLoading}
              onRefresh={() => currentUser?.uid && loadUserReports(currentUser.uid)}
              onNavigateToAnalyse={() => {
                setAnalyseInitialMode('Manual');
                setActiveTab('analyse');
                setCurrentScreen('ANALYSE');
              }}
            />
          )}

          {currentScreen === 'PROFILE' && (
            <ProfileScreen
              userProfile={currentUser}
              onLogout={handleLogout}
              onProfileUpdated={(updated) => setCurrentUser(updated)}
            />
          )}
        </div>

        {/* Forgot Password Modal */}
        {isForgotPasswordOpen && (
          <ForgotPasswordModal
            onClose={() => setIsForgotPasswordOpen(false)}
            defaultEmail={currentUser?.email || ''}
          />
        )}

        {/* Android Material 3 Bottom Navigation Bar (5 destinations) */}
        {currentScreen !== 'SPLASH' && currentScreen !== 'LOADING' && currentScreen !== 'LOGIN' && currentScreen !== 'REGISTER' && (
          <nav className="h-16 bg-white border-t border-slate-200 grid grid-cols-5 items-center shrink-0 z-40 select-none shadow-lg">
            <button
              onClick={() => navigateToTab('home')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'home' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`px-3 py-0.5 rounded-full transition-all ${
                  activeTab === 'home' ? 'bg-amber-100 text-amber-700' : 'bg-transparent'
                }`}
              >
                <Home className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-medium">Home</span>
            </button>

            <button
              onClick={() => navigateToTab('analyse')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'analyse' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`px-3 py-0.5 rounded-full transition-all ${
                  activeTab === 'analyse' ? 'bg-amber-100 text-amber-700' : 'bg-transparent'
                }`}
              >
                <FileSearch className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-medium">Analyse</span>
            </button>

            {/* AI Assistant Tab */}
            <button
              onClick={() => navigateToTab('ai')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'ai' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-indigo-600'
              }`}
            >
              <div
                className={`px-3 py-0.5 rounded-full transition-all ${
                  activeTab === 'ai' ? 'bg-indigo-100 text-indigo-700' : 'bg-transparent'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeTab === 'ai' ? 'text-indigo-600 animate-pulse' : 'text-amber-500'}`} />
              </div>
              <span className="text-[9px] font-medium">AI Chat</span>
            </button>

            <button
              onClick={() => navigateToTab('history')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'history' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`px-3 py-0.5 rounded-full transition-all ${
                  activeTab === 'history' ? 'bg-amber-100 text-amber-700' : 'bg-transparent'
                }`}
              >
                <History className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-medium">History</span>
            </button>

            <button
              onClick={() => navigateToTab('profile')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`px-3 py-0.5 rounded-full transition-all ${
                  activeTab === 'profile' ? 'bg-amber-100 text-amber-700' : 'bg-transparent'
                }`}
              >
                <User className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-medium">Profile</span>
            </button>
          </nav>
        )}

        {/* Android Gesture Bar / Navigation Pill */}
        <div className="h-4 bg-white flex items-center justify-center shrink-0">
          <div className="w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
