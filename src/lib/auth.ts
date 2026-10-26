'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthUser {
  email: string;
  name: string;
  avatarUrl?: string;
}

const AUTH_STORAGE_KEY = 'payngo_user_session';
const AUTH_EVENT_KEY = 'payngo_auth_state_change';

/**
 * Read the current stored user from localStorage
 */
export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Persist the user to localStorage and dispatch custom event
 */
export function saveStoredUser(user: { email: string; name?: string; avatarUrl?: string }) {
  if (typeof window === 'undefined') return;
  const authUser: AuthUser = {
    email: user.email,
    name: user.name || user.email.split('@')[0],
    avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email)}`,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
  window.dispatchEvent(new CustomEvent(AUTH_EVENT_KEY, { detail: authUser }));
}

/**
 * Remove stored user and sign out
 */
export async function clearStoredUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn(e);
    }
  }
  window.dispatchEvent(new CustomEvent(AUTH_EVENT_KEY, { detail: null }));
}

/**
 * React hook to track current logged-in user across components
 */
export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial check from localStorage
    const cached = getStoredUser();
    if (cached) {
      setUser(cached);
      setLoading(false);
    }

    // 2. Check Supabase session if configured
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getUser().then(({ data }: { data: any }) => {
        if (data?.user?.email) {
          const supabaseUser: AuthUser = {
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
            avatarUrl: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.user.email)}`,
          };
          saveStoredUser(supabaseUser);
          setUser(supabaseUser);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // 3. Listen to auth state changes from other components/tabs
    const handleAuthChange = (e: any) => {
      setUser(e.detail);
    };

    window.addEventListener(AUTH_EVENT_KEY, handleAuthChange);
    window.addEventListener('storage', (e) => {
      if (e.key === AUTH_STORAGE_KEY) {
        setUser(getStoredUser());
      }
    });

    return () => {
      window.removeEventListener(AUTH_EVENT_KEY, handleAuthChange);
    };
  }, []);

  return {
    user,
    loading,
    login: (email: string, name?: string) => saveStoredUser({ email, name }),
    logout: clearStoredUser,
  };
}
