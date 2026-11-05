'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { upsertUserRecord } from '@/lib/db';
import { Loader2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your Google session...');

  useEffect(() => {
    let isMounted = true;

    async function processAuth() {
      try {
        if (!isSupabaseConfigured() || !supabase) {
          throw new Error('Supabase is not configured yet.');
        }

        // 1. Check for PKCE exchange code in URL
        const code = searchParams.get('code');
        if (code) {
          setMessage('Exchanging Google authentication token...');
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            console.warn('Code exchange note:', exchangeErr.message);
          }
        }

        // 2. Fetch current session & user metadata
        setMessage('Securing account details and syncing to database...');
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        if (session?.user) {
          const u = session.user;
          const email = u.email || '';
          const name = u.user_metadata?.full_name || u.user_metadata?.name || email.split('@')[0];
          const avatarUrl = u.user_metadata?.avatar_url || u.user_metadata?.picture;
          const provider = u.app_metadata?.provider || 'google';

          // Persist user record to Supabase database (profiles/users table) & local state
          await upsertUserRecord({
            id: u.id,
            email,
            name,
            avatarUrl,
            provider,
          });

          if (isMounted) {
            setStatus('success');
            setMessage(`Welcome back, ${name}! Redirecting to dashboard...`);
            setTimeout(() => {
              router.replace('/dashboard');
            }, 900);
          }
          return;
        }

        // 3. Fallback: wait for onAuthStateChange in case token is in hash fragment
        const { data: authSub } = supabase.auth.onAuthStateChange(async (event: string, s: any) => {
          if (s?.user && isMounted) {
            const u = s.user;
            const email = u.email || '';
            const name = u.user_metadata?.full_name || u.user_metadata?.name || email.split('@')[0];
            const avatarUrl = u.user_metadata?.avatar_url || u.user_metadata?.picture;

            await upsertUserRecord({
              id: u.id,
              email,
              name,
              avatarUrl,
              provider: u.app_metadata?.provider || 'google',
            });

            setStatus('success');
            setMessage(`Welcome, ${name}!`);
            setTimeout(() => {
              router.replace('/dashboard');
            }, 900);
          }
        });

        // Safe timeout fallback
        setTimeout(() => {
          if (isMounted && status === 'loading') {
            router.replace('/dashboard');
          }
        }, 4000);

        return () => {
          authSub?.subscription?.unsubscribe();
        };
      } catch (err: any) {
        if (isMounted) {
          console.error('Auth callback error:', err);
          setStatus('error');
          setMessage(err.message || 'Authentication could not be completed.');
        }
      }
    }

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-2xl relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400" />

        {status === 'loading' && (
          <div className="space-y-5 py-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Authenticating with Google</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{message}</p>
            </div>
            <div className="inline-flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono bg-slate-950/70 px-3 py-1 rounded-full border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>OAuth 2.0 PKCE Protected</span>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5 py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Authenticated Successfully!</h3>
              <p className="text-xs text-slate-300 mt-1.5">{message}</p>
            </div>
            <p className="text-[11px] text-slate-500">Redirecting to your dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5 py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Authentication Notice</h3>
              <p className="text-xs text-rose-300 mt-1.5">{message}</p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md"
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

