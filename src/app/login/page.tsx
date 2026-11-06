'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Eye, EyeOff, Lock, Mail, User, Loader2, ChevronLeft, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useCurrentUser } from '@/lib/auth';
import { upsertUserRecord } from '@/lib/db';

const PayPalIcon = () => (
  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
    <path fill="#003087" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.767.767 0 0 1 .757-.64h6.586c2.518 0 4.382.525 5.539 1.562 1.096.98 1.528 2.378 1.286 4.153-.393 2.875-2.128 4.795-5.158 5.706-1.129.339-2.505.498-4.088.498H7.957a.768.768 0 0 0-.757.64l-.124.798z" />
    <path fill="#0079C1" d="M8.71 13.992l.745-4.72c.07-.442.45-.768.898-.768h3.332c1.787 0 3.109.373 3.93 1.109.778.696 1.085 1.688.913 2.948-.28 2.04-1.51 3.404-3.66 4.05-.802.24-1.778.353-2.902.353H9.608a.768.768 0 0 1-.757-.64l-.141-.892z" />
  </svg>
);

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useCurrentUser();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user?.email && !searchParams.get('reauth')) {
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    }
  }, [user, router, searchParams]);

  // Real Google OAuth via Supabase
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    if (!isSupabaseConfigured() || !supabase) {
      setErrorMessage('Supabase is not configured yet. Please check your Supabase environment variables.');
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
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setErrorMessage(err.message || 'Google authentication failed.');
      setIsLoading(false);
    }
  };

  // PayPal Identity Login
  const handlePayPalLogin = async () => {
    setErrorMessage(null);
    const pEmail = prompt('Enter your PayPal account email to sign in:');
    if (!pEmail || !pEmail.includes('@')) {
      if (pEmail !== null) {
        setErrorMessage('Please provide a valid PayPal account email.');
      }
      return;
    }

    setIsLoading(true);
    const cleanEmail = pEmail.trim().toLowerCase();
    const cleanName = cleanEmail.split('@')[0];

    try {
      await upsertUserRecord({
        email: cleanEmail,
        name: cleanName,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
        provider: 'paypal',
      });

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'PayPal sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetEmail = (email || '').trim().toLowerCase();
    const targetName = (name || '').trim() || targetEmail.split('@')[0];

    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        if (isRegister) {
          const { data, error } = await supabase.auth.signUp({
            email: targetEmail,
            password: password,
            options: { data: { full_name: targetName } },
          });
          if (error) throw error;
          await upsertUserRecord({
            id: data.user?.id,
            email: targetEmail,
            name: targetName,
            provider: 'email',
          });
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password: password,
          });
          if (error) throw error;
          await upsertUserRecord({
            id: data.user?.id,
            email: targetEmail,
            name: data.user?.user_metadata?.full_name || targetName,
            provider: 'email',
          });
        }
      } else {
        await upsertUserRecord({
          email: targetEmail,
          name: targetName,
          provider: 'email',
        });
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.warn('Auth notice:', err.message);
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Return Home link */}
      <div className="w-full max-w-[700px] mb-4 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="text-xs font-black text-white tracking-tight">
          PayN<span className="text-sky-400">Go</span>
        </div>
      </div>

      {/* Outer Card Container - Exact Original Design */}
      <div className="relative w-full max-w-[700px] h-[520px] bg-white border-8 border-white rounded-[28px] overflow-hidden shadow-2xl flex select-none relative z-10">

        {/* Animated Sliding Hero Panel - Cinematic Sky & 3D Flight Trajectory */}
        <div
          className={`absolute top-0 bottom-0 w-1/2 z-20 transition-all duration-700 ease-in-out pointer-events-none ${
            isRegister ? 'left-0 rounded-r-[22px]' : 'left-1/2 rounded-l-[22px]'
          }`}
        >
          <div className="relative w-full h-full overflow-hidden shadow-2xl rounded-[22px] flex flex-col items-center justify-center p-8 text-center text-white">
            {/* Embedded CSS for Flight Trajectory & Airplane Motion Path */}
            <style jsx>{`
              @keyframes flightTrajectoryFlow {
                from {
                  stroke-dashoffset: 28;
                }
                to {
                  stroke-dashoffset: 0;
                }
              }

              @keyframes flightMotion {
                0% {
                  offset-distance: 0%;
                  -webkit-offset-distance: 0%;
                  transform: scale(0.24);
                  opacity: 0.15;
                  filter: blur(1.5px);
                }
                15% {
                  offset-distance: 15%;
                  -webkit-offset-distance: 15%;
                  transform: scale(0.28);
                  opacity: 0.85;
                  filter: blur(0px);
                }
                20% {
                  offset-distance: 20%;
                  -webkit-offset-distance: 20%;
                  transform: scale(0.35);
                  opacity: 1;
                  filter: blur(0px);
                }
                70% {
                  offset-distance: 70%;
                  -webkit-offset-distance: 70%;
                  transform: scale(1.25);
                  opacity: 1;
                  filter: blur(0px);
                }
                80% {
                  offset-distance: 80%;
                  -webkit-offset-distance: 80%;
                  transform: scale(2.4);
                  opacity: 1;
                  filter: blur(0px);
                }
                95% {
                  offset-distance: 95%;
                  -webkit-offset-distance: 95%;
                  transform: scale(4.8);
                  opacity: 0.95;
                  filter: blur(0.5px);
                }
                98% {
                  offset-distance: 98%;
                  -webkit-offset-distance: 98%;
                  transform: scale(5.0);
                  opacity: 0.2;
                  filter: blur(2.5px);
                }
                100% {
                  offset-distance: 100%;
                  -webkit-offset-distance: 100%;
                  transform: scale(5.0);
                  opacity: 0;
                  filter: blur(4px);
                }
              }

              .flight-line-animated {
                stroke-dasharray: 6 8;
                animation: flightTrajectoryFlow 1.2s linear infinite;
              }

              .airplane-node {
                position: absolute;
                top: 0;
                left: 0;
                width: 28px;
                height: 28px;
                offset-path: path("M -40 540 C 90 460, 160 330, 250 200 C 315 110, 370 55, 470 -20");
                -webkit-offset-path: path("M -40 540 C 90 460, 160 330, 250 200 C 315 110, 370 55, 470 -20");
                offset-rotate: auto 0deg;
                -webkit-offset-rotate: auto 0deg;
                animation: flightMotion 9s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
                will-change: transform, offset-distance, opacity;
                pointer-events: none;
                z-index: 20;
              }
            `}</style>

            {/* Visual Backdrop: High-Altitude Cloudscape */}
            <img
              src="/sky_cloudscape_hero.jpg"
              alt="High-Altitude Cloudscape"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-105"
              style={{ objectPosition: 'center 40%' }}
            />

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  'linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.65) 50%, rgba(2, 6, 23, 0.85) 100%)',
              }}
            />

            {/* SVG Flight Line */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-15"
              viewBox="0 0 350 520"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M -40 540 C 90 460, 160 330, 250 200 C 315 110, 370 55, 470 -20"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1.75"
                strokeLinecap="round"
                className="flight-line-animated"
              />
            </svg>

            {/* Airplane Node */}
            <div className="airplane-node">
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7 fill-white text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                style={{ transform: 'rotate(90deg)' }}
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>

            {/* Text and Toggle Button */}
            <div className="relative z-30 flex flex-col items-center justify-center space-y-3.5 pointer-events-auto px-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                {isRegister ? 'Welcome back' : 'Hello there'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed max-w-[240px] font-medium drop-shadow-sm opacity-95">
                {isRegister
                  ? 'Login to review your latest travel itineraries & PayPal bookings.'
                  : 'Begin your journey using PayNGo, and start exploring now.'}
              </p>

              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="mt-3 pointer-events-auto border-2 border-white/95 text-white hover:bg-white hover:text-slate-950 font-bold text-xs uppercase tracking-wider px-8 py-2.5 rounded-full transition-all shadow-lg transform hover:scale-105 active:scale-95 backdrop-blur-sm"
              >
                {isRegister ? 'LOGIN' : 'SIGN UP'}
              </button>
            </div>
          </div>
        </div>

        {/* Login Form Panel (Left Half) */}
        <div
          className={`w-1/2 h-full p-8 flex flex-col justify-center space-y-4 transition-all duration-700 bg-white ${
            isRegister ? 'opacity-0 pointer-events-none translate-x-full' : 'opacity-100 pointer-events-auto translate-x-0'
          }`}
        >
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Login</h3>

            {/* Social Logins */}
            <div className="flex justify-center space-x-3 pt-1">
              <button
                type="button"
                onClick={handlePayPalLogin}
                className="w-9 h-9 rounded-full bg-[#f0f0f3] hover:bg-sky-50 border border-zinc-200/80 flex items-center justify-center transition-all shadow-sm transform hover:scale-105"
                title="Sign in with PayPal Identity"
              >
                <PayPalIcon />
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-9 h-9 rounded-full bg-[#f0f0f3] hover:bg-zinc-100 border border-zinc-200/80 flex items-center justify-center transition-all shadow-sm transform hover:scale-105"
                title="Sign in with Google (Shows Account Chooser)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-9 h-9 rounded-full bg-[#f0f0f3] hover:bg-zinc-100 border border-zinc-200/80 flex items-center justify-center transition-all shadow-sm transform hover:scale-105"
                title="Sign in with Apple"
              >
                <svg className="w-4 h-4 fill-zinc-900" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.13c.68-.82 1.14-1.97.01-3.13-1.04.04-2.3.69-3.03 1.54-.65.76-1.22 1.95-1.07 3.1 1.17.09 2.37-.58 3.09-1.51z" />
                </svg>
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 font-medium pt-1">Or use your email address</p>

            {errorMessage && !isRegister && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] p-2 rounded-xl text-left">
                {errorMessage}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-[#f0f0f3] border-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#f0f0f3] border-none rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#222226] hover:bg-black text-white font-bold text-xs py-3 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>LOGIN</span>}
            </button>
          </form>
        </div>

        {/* Register Form Panel (Right Half) */}
        <div
          className={`w-1/2 h-full p-8 flex flex-col justify-center space-y-4 transition-all duration-700 bg-white ${
            isRegister ? 'opacity-100 pointer-events-auto translate-x-0' : 'opacity-0 pointer-events-none -translate-x-full'
          }`}
        >
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Create Account</h3>

            {/* Social Logins */}
            <div className="flex justify-center space-x-3 pt-1">
              <button
                type="button"
                onClick={handlePayPalLogin}
                className="w-9 h-9 rounded-full bg-[#f0f0f3] hover:bg-sky-50 border border-zinc-200/80 flex items-center justify-center transition-all shadow-sm transform hover:scale-105"
                title="Sign up with PayPal Identity"
              >
                <PayPalIcon />
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-9 h-9 rounded-full bg-[#f0f0f3] hover:bg-zinc-100 border border-zinc-200/80 flex items-center justify-center transition-all shadow-sm transform hover:scale-105"
                title="Sign up with Google (Shows Account Chooser)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-9 h-9 rounded-full bg-[#f0f0f3] hover:bg-zinc-100 border border-zinc-200/80 flex items-center justify-center transition-all shadow-sm transform hover:scale-105"
                title="Sign up with Apple"
              >
                <svg className="w-4 h-4 fill-zinc-900" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.13c.68-.82 1.14-1.97.01-3.13-1.04.04-2.3.69-3.03 1.54-.65.76-1.22 1.95-1.07 3.1 1.17.09 2.37-.58 3.09-1.51z" />
                </svg>
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 font-medium pt-0.5">Or use your email address</p>

            {errorMessage && isRegister && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] p-2 rounded-xl text-left">
                {errorMessage}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="space-y-1">
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-[#f0f0f3] border-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-[#f0f0f3] border-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#f0f0f3] border-none rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 bg-[#222226] hover:bg-black text-white font-bold text-xs py-3 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>SIGN UP</span>}
            </button>
          </form>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-xs text-slate-500 relative z-10">
        PayNGo Multi-Modal Intelligent Travel • Secured by Supabase &amp; PayPal
      </footer>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
          <p className="text-xs text-slate-400">Loading PayNGo authentication...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
