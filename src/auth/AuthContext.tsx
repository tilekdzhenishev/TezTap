import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { fetchProfile, fetchWorkerProfile, supabase } from '../supabase/client';
import { Profile, WorkerProfile } from '../types';
import {
  authSignIn,
  authSignOut,
  authSignUpUser,
  authSignUpEmployer,
  authResetPassword,
  SignUpUserData,
  SignUpEmployerData,
} from './authService';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  workerProfile: WorkerProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUpUser: (data: SignUpUserData) => Promise<void>;
  signUpEmployer: (data: SignUpEmployerData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshWorkerProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string, authUser: User | null = user) => {
    let p = await fetchProfile(uid);
    if (!p && authUser?.id === uid) {
      const metadata = authUser.user_metadata ?? {};
      const role = metadata.role === 'employer' ? 'employer' : 'user';
      const fullName = typeof metadata.full_name === 'string' ? metadata.full_name : null;

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: uid,
        full_name: fullName,
        role,
      });

      if (!profileError && role === 'employer') {
        // Guard: only create employer row if one doesn't already exist for this user.
        // authSignUpEmployer creates it immediately (even without a session),
        // so on first login there will already be a row — inserting again would duplicate it.
        const { data: existingEmp } = await supabase
          .from('employers')
          .select('id')
          .eq('user_id', uid)
          .maybeSingle();

        if (!existingEmp) {
          const businessName =
            typeof metadata.business_name === 'string' ? metadata.business_name : fullName;
          if (businessName) {
            await supabase.from('employers').insert({
              user_id: uid,
              business_name: businessName,
              business_type:
                typeof metadata.business_type === 'string' ? metadata.business_type : 'Другое',
              contact_phone:
                typeof metadata.contact_phone === 'string' ? metadata.contact_phone : '',
              description: typeof metadata.description === 'string' ? metadata.description : null,
              verification_status: 'pending',
            });
          }
        }
      }

      p = await fetchProfile(uid);
    }
    setProfile(p);
    if (p?.role === 'user') {
      const wp = await fetchWorkerProfile(uid);
      setWorkerProfile(wp);
    } else {
      setWorkerProfile(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user.id, s.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await loadProfile(s.user.id, s.user);
      } else {
        setProfile(null);
        setWorkerProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        workerProfile,
        loading,
        signIn: async (email, password) => {
          await authSignIn(email, password);
        },
        signUpUser: async (data) => {
          await authSignUpUser(data);
        },
        signUpEmployer: async (data) => {
          await authSignUpEmployer(data);
        },
        signOut: async () => {
          await authSignOut();
        },
        resetPassword: async (email) => {
          await authResetPassword(email);
        },
        refreshProfile: async () => {
          if (user) await loadProfile(user.id, user);
        },
        refreshWorkerProfile: async () => {
          if (user) {
            const wp = await fetchWorkerProfile(user.id);
            setWorkerProfile(wp);
          }
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
