import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  HardHat,
  Sparkles
} from 'lucide-react';

import { loginUser, registerUser, UserProfile } from '../../services/firebase';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateToRegister: () => void;
  onForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setErrorMessage('Please enter your official email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userProfile = await loginUser(email, password);
      onLoginSuccess(userProfile);
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please verify and try again.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please reset password or try later.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo safety officer login for immediate testing
  const handleDemoLogin = async () => {
    setEmail('safety.officer@dgms.gov.in');
    setPassword('MiningSafety@2026');
    setErrorMessage(null);
    setIsLoading(true);
    try {
      // Attempt login or register if demo doesn't exist yet
      try {
        const profile = await loginUser('safety.officer@dgms.gov.in', 'MiningSafety@2026');
        onLoginSuccess(profile);
      } catch (loginErr: any) {
        if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
          const profile = await registerUser('Er. Rajesh Kumar', 'safety.officer@dgms.gov.in', 'MiningSafety@2026');
          onLoginSuccess(profile);
        } else {
          throw loginErr;
        }
      }
    } catch (err: any) {
      console.error('Demo login error:', err);
      setErrorMessage(err.message || 'Demo login failed. You can register a new account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-slate-900 text-slate-100 flex flex-col justify-between overflow-y-auto p-6 select-none">
      {/* Top Header & Branding */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <HardHat className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono tracking-wider uppercase text-slate-400">
              DGMS · CMR 2017
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Firebase Auth Active
          </span>
        </div>

        <div className="space-y-1 pt-2">
          <h1 className="text-2xl font-black text-white tracking-tight">
            MINE SAFETY DSS
          </h1>
          <p className="text-xs text-sky-400 font-medium">
            Sign in to access your statutory safety analyses
          </p>
        </div>
      </div>

      {/* Main Login Card */}
      <form onSubmit={handleLogin} className="space-y-4 my-auto py-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            Official Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. inspector@dgms.gov.in"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder-slate-500 transition-colors"
            autoComplete="email"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder-slate-500 pr-10 transition-colors"
              autoComplete="current-password"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In to Safety Portal</span>
            </>
          )}
        </button>

        {/* Quick Demo Sign In */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Demo Login (Er. Rajesh Kumar)</span>
        </button>
      </form>

      {/* Bottom Switch to Register */}
      <div className="pt-2 pb-1 text-center space-y-2 border-t border-slate-800/80">
        <p className="text-xs text-slate-400">
          New mining safety officer or engineer?
        </p>
        <button
          type="button"
          onClick={onNavigateToRegister}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register New Official Account</span>
        </button>
      </div>
    </div>
  );
};
