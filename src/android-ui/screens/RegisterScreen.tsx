import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  ArrowLeft, 
  AlertCircle, 
  HardHat
} from 'lucide-react';

import { registerUser, UserProfile } from '../../services/firebase';

interface RegisterScreenProps {
  onRegisterSuccess: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters long.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please provide a valid official email address.');
      return false;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userProfile = await registerUser(fullName, email, password);
      onRegisterSuccess(userProfile);
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = 'Failed to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please log in instead.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address is improperly formatted.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'The password is too weak. Please use letters, numbers, and symbols.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-slate-900 text-slate-100 flex flex-col justify-between overflow-y-auto p-6 select-none">
      {/* Top Bar with Back Button */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>

        <div className="flex items-center gap-2 pt-1">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Officer Registration
            </h1>
            <p className="text-[11px] text-sky-400 font-medium">
              DGMS Safety Officer & Mining Engineer Portal
            </p>
          </div>
        </div>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleRegister} className="space-y-3.5 my-auto py-3">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Full Name & Title
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Er. Rajesh Kumar"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder-slate-500 transition-colors"
            autoComplete="name"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            Official Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. rajesh.kumar@coalindia.in"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder-slate-500 transition-colors"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Create Password (min. 6 characters)
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder-slate-500 pr-10 transition-colors"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Confirm Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder-slate-500 transition-colors"
            autoComplete="new-password"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Register & Provision Profile</span>
            </>
          )}
        </button>
      </form>

      {/* Bottom Switch to Login */}
      <div className="pt-2 pb-1 text-center border-t border-slate-800/80">
        <p className="text-xs text-slate-400">
          Already registered?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Sign In here
          </button>
        </p>
      </div>
    </div>
  );
};
