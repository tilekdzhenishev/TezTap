import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  Job,
  SavedJob,
  Employer,
  EmployerDraft,
  Profile,
  WorkerProfile,
  JobApplication,
  JobApplicationStatus,
} from '../types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const getWebStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const isSecureStoreAvailable = () =>
  Platform.OS !== 'web' &&
  typeof SecureStore.getItemAsync === 'function' &&
  typeof SecureStore.setItemAsync === 'function' &&
  typeof SecureStore.deleteItemAsync === 'function';

const SupabaseStorageAdapter = {
  getItem: async (key: string) => {
    if (isSecureStoreAvailable()) {
      return SecureStore.getItemAsync(key);
    }
    return getWebStorage()?.getItem(key) ?? null;
  },
  setItem: async (key: string, value: string) => {
    if (isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    getWebStorage()?.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
    getWebStorage()?.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SupabaseStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function fetchActiveJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'approved')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
  return data as Job[];
}

export async function fetchPendingJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending jobs:', error);
    return [];
  }
  return data as Job[];
}

export async function submitJob(job: Omit<Job, 'id' | 'created_at'>): Promise<boolean> {
  // Do NOT use .select().single() after insert — the SELECT RLS only exposes approved+active
  // jobs, so a freshly-inserted pending job would trigger a false RLS violation on RETURNING.
  const { error } = await supabase.from('jobs').insert(job);
  if (error) {
    console.error('Error submitting job:', error);
    return false;
  }
  return true;
}

export async function approveJob(jobId: string): Promise<boolean> {
  const { error } = await supabase
    .from('jobs')
    .update({ status: 'approved', is_active: true })
    .eq('id', jobId);

  if (error) {
    console.error('Error approving job:', error);
    return false;
  }
  return true;
}

export async function closeJob(jobId: string): Promise<boolean> {
  const { error } = await supabase
    .from('jobs')
    .update({ is_active: false, closed_at: new Date().toISOString() })
    .eq('id', jobId);

  if (error) {
    console.error('Error closing job:', error);
    return false;
  }
  return true;
}

export async function rejectJob(jobId: string): Promise<boolean> {
  const { error } = await supabase
    .from('jobs')
    .update({ status: 'rejected', is_active: false })
    .eq('id', jobId);

  if (error) {
    console.error('Error rejecting job:', error);
    return false;
  }
  return true;
}

export async function saveJobToDevice(jobId: string, deviceId: string): Promise<SavedJob | null> {
  const { data, error } = await supabase
    .from('saved_jobs')
    .insert({ job_id: jobId, device_id: deviceId })
    .select()
    .single();

  if (error) {
    console.error('Error saving job:', error);
    return null;
  }
  return data as SavedJob;
}

export async function fetchSavedJobs(deviceId: string): Promise<SavedJob[]> {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('*, job:jobs(*)')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved jobs:', error);
    return [];
  }
  return data as SavedJob[];
}

export async function unsaveJob(savedJobId: string): Promise<boolean> {
  const { error } = await supabase.from('saved_jobs').delete().eq('id', savedJobId);

  if (error) {
    console.error('Error unsaving job:', error);
    return false;
  }
  return true;
}

export async function isJobSaved(jobId: string, deviceId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('job_id', jobId)
    .eq('device_id', deviceId)
    .limit(1);

  if (error) return false;
  return (data?.length ?? 0) > 0;
}

// ── Profiles ─────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
  return data as Profile;
}

export async function fetchEmployerByUserId(userId: string): Promise<Employer | null> {
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('Error fetching employer by user_id:', error);
    return null;
  }
  return data as Employer | null;
}

// ── Employer verification ─────────────────────────────────────

export async function registerEmployer(draft: EmployerDraft): Promise<Employer | null> {
  const { data, error } = await supabase
    .from('employers')
    .insert({
      business_name: draft.business_name,
      business_type: draft.business_type,
      contact_phone: draft.contact_phone,
      description: draft.description || null,
      verification_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error registering employer:', error);
    return null;
  }
  return data as Employer;
}

export async function fetchEmployerById(id: string): Promise<Employer | null> {
  const { data, error } = await supabase.from('employers').select('*').eq('id', id).single();

  if (error) return null;
  return data as Employer;
}

export async function fetchPendingEmployers(): Promise<Employer[]> {
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending employers:', error);
    return [];
  }
  return data as Employer[];
}

export async function approveEmployer(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('employers')
    .update({
      verification_status: 'approved',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id');

  if (error) {
    console.error('Error approving employer:', error);
    return false;
  }
  if (!data?.length) {
    console.error('approveEmployer: no row matched id', id);
    return false;
  }
  return true;
}

export async function rejectEmployer(id: string, notes?: string): Promise<boolean> {
  const { error } = await supabase
    .from('employers')
    .update({
      verification_status: 'rejected',
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
    })
    .eq('id', id);

  if (error) {
    console.error('Error rejecting employer:', error);
    return false;
  }
  return true;
}

export async function suspendEmployer(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('employers')
    .update({
      verification_status: 'suspended',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error suspending employer:', error);
    return false;
  }
  return true;
}

// ── Employer Jobs ─────────────────────────────────────────────

export async function fetchEmployerJobs(employerId: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Job[];
}

// ── Worker Profiles ───────────────────────────────────────────

export async function fetchWorkerProfile(userId: string): Promise<WorkerProfile | null> {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data as WorkerProfile;
}

export async function createWorkerProfile(
  userId: string,
  draft: {
    full_name: string;
    birth_year?: number;
    phone?: string;
    passport_front_url?: string;
    selfie_url?: string;
  }
): Promise<WorkerProfile | null> {
  const { data, error } = await supabase
    .from('worker_profiles')
    .insert({
      user_id: userId,
      full_name: draft.full_name,
      birth_year: draft.birth_year ?? null,
      phone: draft.phone ?? null,
      passport_front_url: draft.passport_front_url ?? null,
      selfie_url: draft.selfie_url ?? null,
      verification_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating worker profile:', error);
    return null;
  }
  return data as WorkerProfile;
}

export async function updateWorkerProfileUrls(
  userId: string,
  updates: { passport_front_url?: string; selfie_url?: string }
): Promise<boolean> {
  const { error } = await supabase.from('worker_profiles').update(updates).eq('user_id', userId);

  if (error) {
    console.error('Error updating worker profile:', error);
    return false;
  }
  return true;
}

export async function fetchPendingWorkers(): Promise<WorkerProfile[]> {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select('*')
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending workers:', error);
    return [];
  }
  return data as WorkerProfile[];
}

export async function verifyWorker(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('worker_profiles')
    .update({ verification_status: 'verified' })
    .eq('id', id);

  if (error) {
    console.error('Error verifying worker:', error);
    return false;
  }
  return true;
}

export async function rejectWorkerProfile(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('worker_profiles')
    .update({ verification_status: 'rejected' })
    .eq('id', id);

  if (error) {
    console.error('Error rejecting worker:', error);
    return false;
  }
  return true;
}

// ── Storage uploads (private bucket) ─────────────────────────

export async function uploadWorkerDoc(
  userId: string,
  docType: 'passport' | 'selfie',
  uri: string
): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const path = `${userId}/${docType}.jpg`;

    const { error } = await supabase.storage
      .from('worker-docs')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

    if (error) {
      console.error('Error uploading doc:', error);
      return null;
    }

    // Return the storage path (not a public URL — bucket is private)
    return path;
  } catch (e) {
    console.error('Upload failed:', e);
    return null;
  }
}

export async function getWorkerDocSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('worker-docs')
    .createSignedUrl(path, expiresIn);

  if (error || !data) {
    console.error('Error creating worker document signed URL:', error);
    return null;
  }
  return data.signedUrl;
}

// ── Job Applications ──────────────────────────────────────────

export async function applyToJob(jobId: string, workerId: string): Promise<JobApplication | null> {
  const { data, error } = await supabase
    .from('job_applications')
    .insert({ job_id: jobId, worker_id: workerId })
    .select()
    .single();

  if (error) {
    console.error('Error applying to job:', error);
    return null;
  }
  return data as JobApplication;
}

export async function hasAppliedToJob(jobId: string, workerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('job_applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('worker_id', workerId)
    .limit(1);

  if (error) return false;
  return (data?.length ?? 0) > 0;
}

export async function fetchMyApplications(workerId: string): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*, job:jobs(*)')
    .eq('worker_id', workerId)
    .order('applied_at', { ascending: false });

  if (error) return [];
  return data as JobApplication[];
}

export async function fetchJobApplications(jobId: string): Promise<JobApplication[]> {
  // job_applications.worker_id → auth.users(id), not worker_profiles — no direct FK exists,
  // so PostgREST cannot derive the join automatically. Fetch worker profiles separately.
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_id', jobId)
    .order('applied_at', { ascending: true });

  if (error) return [];
  if (!data || data.length === 0) return data as JobApplication[];

  const workerIds = data.map((a) => a.worker_id);
  const { data: profiles } = await supabase
    .from('worker_profiles')
    .select('*')
    .in('user_id', workerIds);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));

  return data.map((app) => ({
    ...app,
    worker_profile: profileMap[app.worker_id] ?? null,
  })) as JobApplication[];
}

export async function fetchApplicationsForEmployer(employerId: string): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*, job:jobs!inner(*)')
    .eq('jobs.employer_id', employerId)
    .order('applied_at', { ascending: false });

  if (error) return [];
  if (!data || data.length === 0) return data as JobApplication[];

  const workerIds = data.map((a) => a.worker_id);
  const { data: profiles } = await supabase
    .from('worker_profiles')
    .select('*')
    .in('user_id', workerIds);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));

  return data.map((app) => ({
    ...app,
    worker_profile: profileMap[app.worker_id] ?? null,
  })) as JobApplication[];
}

export async function updateApplicationStatus(
  applicationId: string,
  status: JobApplicationStatus
): Promise<boolean> {
  const { error } = await supabase
    .from('job_applications')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', applicationId);

  if (error) return false;
  return true;
}

export async function reportNoShow(applicationId: string, workerId: string): Promise<boolean> {
  const { error: appError } = await supabase
    .from('job_applications')
    .update({ status: 'no_show', no_show_reported: true, responded_at: new Date().toISOString() })
    .eq('id', applicationId);

  if (appError) return false;

  // Fetch current no_show_count to apply suspension logic
  const wp = await fetchWorkerProfile(workerId);
  if (!wp) return true;

  const newCount = wp.no_show_count + 1;
  const updates: Partial<WorkerProfile> = { no_show_count: newCount };

  if (newCount >= 3) {
    updates.is_banned = true;
  } else if (newCount === 2) {
    const until = new Date();
    until.setDate(until.getDate() + 7);
    updates.suspended_until = until.toISOString();
  }

  await supabase.from('worker_profiles').update(updates).eq('user_id', workerId);

  return true;
}

export async function rateWorker(
  applicationId: string,
  workerId: string,
  rating: number
): Promise<boolean> {
  const { error } = await supabase
    .from('job_applications')
    .update({ rating, status: 'completed' })
    .eq('id', applicationId);

  if (error) return false;

  // Recalculate average rating
  const { data } = await supabase
    .from('job_applications')
    .select('rating')
    .eq('worker_id', workerId)
    .not('rating', 'is', null);

  if (data && data.length > 0) {
    const avg = data.reduce((sum, r) => sum + (r.rating ?? 0), 0) / data.length;
    const { error: wpError } = await supabase
      .from('worker_profiles')
      .update({
        rating: Math.round(avg * 100) / 100,
        completed_shifts: data.length,
      })
      .eq('user_id', workerId);

    if (wpError) {
      console.error('Error updating worker rating stats:', wpError);
    }
  }

  return true;
}
