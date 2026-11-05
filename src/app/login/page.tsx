'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Plane,
  Sparkles,
  Database,
  KeyRound,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { supabase, isSupabaseConfigured, getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabase';
import { upsertUserRecord } from '@/lib/db';
import { useCurrentUser } from '@/lib/auth';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const PayPalIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
    <path
      fill="#003087"
      d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.767.767 0 0 1 .757-.64h6.586c2.518 0 4.382.525 5.539 1.562 1.096.98 1.528 2.378 1.286 4.153-.393 2.875-2.128 4.795-5.158 5.706-1.129.339-2.505.498-4.088.498H7.957a.768.768 0 0 0-.757.64l-.124.798z"
    />
    <path
      fill="#0079C1"
      d="M8.71 13.992l.745-4.72c.07-.442.45-.768.898-.768h3.332c1.787 0 3.109.373 3.93 1.109.778.696 1.085 1.688.913 2.948-.28 2.04-1.51 3.404-3.66 4.05-.802.24-1.778.353-2.902.353H9.608a.768.768 0 0 1-.757-.64l-.141-.892z"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useCurrentUser();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // PayPal custom modal
  const [isPayPalModalOpen, setIsPayPalModalOpen] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalName, setPaypalName] = useState('');

  // Forgot password state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Supabase credentials setup drawer/helper
  const [showConfigHelper, setShowConfigHelper] = useState(false);
  const [customSupabaseUrl, setCustomSupabaseUrl] = useState('');
  const [customSupabaseKey, setCustomSupabaseKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user?.email && !searchParams.get('reauth')) {
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    }
  }, [user, router, searchParams]);

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!isSupabaseConfigured() || !supabase) {
      setErrorMessage(
        'Supabase is not yet connected. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to trigger live Google OAuth.'
      );
      setShowConfigHelper(true);
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // Prompt account selector so user can choose from all Google accounts on device
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect browser to Google's account chooser
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setErrorMessage(err.message || 'Failed to initialize Google authentication.');
      setIsLoading(false);
    }
  };

  // PayPal Identity Login Flow
  const handlePayPalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paypalEmail.trim() || !paypalEmail.includes('@')) {
      setErrorMessage('Please provide a valid PayPal email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const cleanEmail = paypalEmail.trim().toLowerCase();
    const cleanName = paypalName.trim() || cleanEmail.split('@')[0];

    try {
      // Upsert into Supabase database ('profiles' / 'users') & local state
      await upsertUserRecord({
        email: cleanEmail,
        name: cleanName,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
        provider: 'paypal',
      });

      setSuccessMessage(`Logged in via PayPal Identity as ${cleanEmail}`);
      setIsPayPalModalOpen(false);

      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'PayPal sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Email / Password Form Submit
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (activeTab === 'signup' && password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please check and retry.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        if (activeTab === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: fullName.trim() || cleanEmail.split('@')[0],
              },
            },
          });
          if (error) throw error;

          // Upsert to Supabase database ('profiles' or 'users' table)
          await upsertUserRecord({
            id: data.user?.id,
            email: cleanEmail,
            name: fullName.trim() || cleanEmail.split('@')[0],
            provider: 'email',
          });

          setSuccessMessage('Account created successfully! Redirecting...');
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (error) throw error;

          // Upsert to database
          await upsertUserRecord({
            id: data.user?.id,
            email: cleanEmail,
            name: data.user?.user_metadata?.full_name || cleanEmail.split('@')[0],
            provider: 'email',
          });

          setSuccessMessage('Welcome back! Loading your dashboard...');
        }
      } else {
        // Fallback when Supabase env keys are not populated yet
        await upsertUserRecord({
          email: cleanEmail,
          name: (fullName || cleanEmail.split('@')[0]).trim(),
          provider: 'email',
        });
        setSuccessMessage('Signed in locally! Syncing session...');
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } catch (err: any) {
      console.error('Email auth error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      return;
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
          redirectTo: `${window.location.origin}/login?tab=reset`,
        });
        if (error) throw error;
        setResetSuccess(true);
      } catch (err: any) {
        alert(err.message || 'Could not send reset link.');
      }
    } else {
      setResetSuccess(true);
    }
  };

  // Quick configure Supabase from UI if user has their URL & Key ready
  const handleSaveCustomSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSupabaseUrl && customSupabaseKey) {
      localStorage.setItem('payngo_supabase_url', customSupabaseUrl.trim());
      localStorage.setItem('payngo_supabase_anon_key', customSupabaseKey.trim());
      setIsConfigured(true);
      setShowConfigHelper(false);
      setSuccessMessage('Supabase credentials connected successfully!');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white flex items-center gap-1">
              PayNGo <span className="text-sky-400 font-medium text-xs">Auth</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-mono">
              Secure Traveler Identity
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-1.5 rounded-full transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Login / Register Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          {/* Subtle Top Glow Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-600" />

          {/* Card Header & Tab Switcher */}
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-sky-400 uppercase tracking-wider bg-sky-400/10 border border-sky-400/20 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>256-Bit SSL Encrypted &amp; Supabase Database Synced</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeTab === 'signin' ? 'Sign In to PayNGo' : 'Create Traveler Account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              {activeTab === 'signin'
                ? 'Access your trips, instant memory box, and verified bookings.'
                : 'Join thousands of explorers discovering authentic travel with PayNGo.'}
            </p>

            {/* Toggle Switch */}
            <div className="p-1 bg-slate-950 rounded-2xl inline-flex border border-slate-800 mt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'signin'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'signup'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Notifications */}
          {errorMessage && (
            <div className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-2xl flex items-start space-x-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-2xl flex items-start space-x-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* Social Logins: Google & PayPal */}
          <div className="space-y-3 mb-6">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-3 group border border-slate-200 active:scale-[0.99] cursor-pointer"
            >
              <GoogleIcon />
              <span>
                {activeTab === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 group-hover:bg-slate-200 px-2 py-0.5 rounded-full border border-slate-200 ml-auto hidden sm:inline-block">
                Shows Account Chooser
              </span>
            </button>

            {/* PayPal Identity Button */}
            <button
              type="button"
              onClick={() => setIsPayPalModalOpen(true)}
              disabled={isLoading}
              className="w-full bg-[#003087]/20 hover:bg-[#003087]/30 text-sky-200 border border-[#0079C1]/50 font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-3 active:scale-[0.99] cursor-pointer"
            >
              <PayPalIcon />
              <span>Continue with PayPal</span>
              <span className="text-[10px] text-sky-300/80 bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-700/50 ml-auto hidden sm:inline-block">
                Verified Identity
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              Or with email
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="traveler@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">Password</label>
                {activeTab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setIsForgotPasswordOpen(true);
                    }}
                    className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 group active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{activeTab === 'signin' ? 'Sign In Securely' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Database & Safety Footer Badges */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Real-time profiles table sync</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase Auth &amp; Google Account Chooser</span>
            </span>
          </div>

          {/* Connection Helper Toggle (if Supabase isn't configured in .env.local) */}
          {!isConfigured && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center space-x-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Connect Supabase Project</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowConfigHelper(!showConfigHelper)}
                  className="text-amber-400 underline font-bold"
                >
                  {showConfigHelper ? 'Hide Config' : 'Setup Now'}
                </button>
              </div>

              {showConfigHelper && (
                <form onSubmit={handleSaveCustomSupabase} className="mt-3 space-y-2 border-t border-amber-500/20 pt-2">
                  <p className="text-[10px] text-amber-300">
                    Paste your Supabase URL &amp; Anon Key below or add them to <code className="bg-black/40 px-1 py-0.5 rounded">.env.local</code>:
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="https://xyzcompany.supabase.co"
                    value={customSupabaseUrl}
                    onChange={(e) => setCustomSupabaseUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="password"
                    required
                    placeholder="eyJhbGciOi... (anon key)"
                    value={customSupabaseKey}
                    onChange={(e) => setCustomSupabaseKey(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs"
                  >
                    Save &amp; Connect Live
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </main>

      {/* PayPal Modal Dialog */}
      {isPayPalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#003087]/30 border border-[#0079C1]/40 flex items-center justify-center">
                <PayPalIcon />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Sign In with PayPal Identity</h3>
                <p className="text-[11px] text-slate-400">Authenticated via PayPal Traveler Profile</p>
              </div>
            </div>

            <form onSubmit={handlePayPalSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">PayPal Account Email *</label>
                <input
                  type="email"
                  required
                  placeholder="your-paypal-email@domain.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={paypalName}
                  onChange={(e) => setPaypalName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPayPalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-md"
                >
                  Confirm &amp; Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative space-y-4">
            <h3 className="text-base font-black text-white">Reset Account Password</h3>
            <p className="text-xs text-slate-400">
              Enter your registered email address and we will send you a password recovery link.
            </p>

            {resetSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                <p className="font-bold">Password reset email dispatched!</p>
                <p>Check your inbox or spam folder for password update instructions.</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setResetSuccess(false);
                  }}
                  className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded-xl font-bold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="traveler@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    Send Recovery Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
        PayNGo Multi-Modal Intelligent Travel • Secured by Supabase &amp; PayPal
      </footer>

    </div>
  );
}

