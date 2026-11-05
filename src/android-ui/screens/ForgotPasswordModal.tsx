import React, { useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { sendPasswordReset } from '../../services/firebase';


interface ForgotPasswordModalProps {
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onClose,
  defaultEmail = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid registered email address.');
      return false;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      let msg = 'Failed to send password reset email. Please try again.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No registered officer account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address is improperly formatted.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Reset Password</h3>
              <p className="text-[10px] text-slate-400">DGMS Safety Portal Recovery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>

        {isSuccess ? (
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-200">Reset Link Sent</p>
                <p className="mt-0.5 text-emerald-300/90 text-[11px]">
                  Instructions to reset your password have been dispatched to <strong>{email}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your official registered email address to receive secure password recovery instructions.
            </p>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Registered Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. officer@dgms.gov.in"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder-slate-500 transition-colors"
                autoComplete="email"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-1/2 py-2 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
