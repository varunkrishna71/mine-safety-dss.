import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  Info, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Save, 
  X,
  Send
} from 'lucide-react';

import { UserProfile, updateUserProfile, resendVerificationEmail } from '../../services/firebase';

interface ProfileScreenProps {
  userProfile: UserProfile | null;
  onLogout: () => void;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  onLogout,
  onProfileUpdated,
}) => {
  const [criticalPush, setCriticalPush] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userProfile?.fullName || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const initials = (userProfile?.fullName || 'Mining Officer')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSaveName = async () => {
    if (!userProfile?.uid || !newName.trim() || newName.trim().length < 2) return;
    setIsSavingName(true);
    try {
      await updateUserProfile(userProfile.uid, { fullName: newName.trim() });
      if (onProfileUpdated) {
        onProfileUpdated({ ...userProfile, fullName: newName.trim() });
      }
      setIsEditingName(false);
    } catch (err: any) {
      console.error('Error updating name:', err);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSendVerification = async () => {
    setVerificationError(null);
    try {
      await resendVerificationEmail();
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (err: any) {
      setVerificationError(err.message || 'Failed to dispatch verification email.');
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 pb-20 select-none">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-5 pt-3 shadow-md shrink-0">
        <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
          <span>⚙️</span> Officer Profile & Settings
        </h2>
        <p className="text-[11px] text-slate-400">
          Statutory Inspector Credentials & Account Storage
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md inline-block mb-1">
                {userProfile?.role || 'DGMS Certified Inspector'}
              </span>

              {isEditingName ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-xs font-bold px-2 py-1 border border-slate-300 rounded-lg w-full focus:outline-none focus:border-amber-500 text-slate-900"
                    placeholder="Enter full name"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(userProfile?.fullName || '');
                    }}
                    className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 leading-tight truncate">
                    {userProfile?.fullName || 'Er. Mining Officer'}
                  </h3>
                  <button
                    onClick={() => {
                      setNewName(userProfile?.fullName || '');
                      setIsEditingName(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p className="text-xs text-slate-500 truncate mt-0.5 font-mono">
                {userProfile?.email || 'officer@dgms.gov.in'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Zone: {userProfile?.miningZone || 'DGMS Eastern & Central Coalfields'}
              </p>
            </div>
          </div>

          {/* Email Verification Status Banner */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {userProfile?.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Email Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Unverified Email
                </span>
              )}
            </div>

            {!userProfile?.emailVerified && (
              <button
                onClick={handleSendVerification}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Resend Link</span>
              </button>
            )}
          </div>

          {verificationSent && (
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Verification email sent. Please check your inbox.</span>
            </div>
          )}

          {verificationError && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{verificationError}</span>
            </div>
          )}
        </div>

        {/* Cloud Firestore Identity & Security Info */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cloud Firestore Isolation</span>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              ABAC Rules
            </span>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5 pt-1">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400">Firebase User UID:</span>
              <span className="font-mono text-[10px] font-semibold text-slate-700 truncate max-w-[170px]">
                {userProfile?.uid || 'guest-session'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400">Account Created:</span>
              <span className="font-mono text-slate-800 text-[11px]">
                {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Report Partition:</span>
              <span className="font-mono text-[10px] text-emerald-700 font-semibold truncate max-w-[170px]">
                users/{userProfile?.uid?.slice(0, 8)}.../reports
              </span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Surveillance Preferences</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Critical Threshold Push Alerts</span>
                <span className="text-[10px] text-slate-500">Methane &gt; 2.0% & evacuation notifications</span>
              </div>
              <input
                type="checkbox"
                checked={criticalPush}
                onChange={(e) => setCriticalPush(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Daily Shift Surveillance Digest</span>
                <span className="text-[10px] text-slate-500">End-of-shift hazard audit summary</span>
              </div>
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Application Information */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100">
            <Info className="w-4 h-4 text-blue-600" />
            <span>About Application</span>
          </div>

          <div className="space-y-1.5 text-slate-600 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Application Name:</span>
              <span className="font-semibold text-slate-800">Mine Safety DSS (Android)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Build Version:</span>
              <span className="font-mono text-slate-800">v2.6.0 (Phase 6 Firebase)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-semibold text-emerald-700">Cloud Firestore (ABAC)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Statutory Framework:</span>
              <span className="font-semibold text-blue-700">CMR 2017 & DGMS Guidelines</span>
            </div>
          </div>
        </div>

        {/* Logout Action */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full bg-white hover:bg-red-50 border border-red-200 text-red-600 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Inspector Session</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Sign Out</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to end your session? Your analysis records remain securely saved in Firestore.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="py-2 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
