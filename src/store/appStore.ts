import { create } from 'zustand';
import { Job, SavedJob, Employer } from '../types';
import {
  fetchActiveJobs,
  fetchPendingJobs,
  fetchSavedJobs,
  saveJobToDevice,
  unsaveJob,
  isJobSaved,
  approveJob,
  rejectJob,
  fetchPendingEmployers,
  approveEmployer,
  rejectEmployer,
  suspendEmployer,
} from '../supabase/client';
import { getDeviceId } from '../utils/deviceId';

interface AppState {
  deviceId: string | null;
  activeJobs: Job[];
  pendingJobs: Job[];
  savedJobs: SavedJob[];
  currentJobIndex: number;
  loading: boolean;
  error: string | null;
  pendingEmployers: Employer[];

  init: () => Promise<void>;
  loadActiveJobs: () => Promise<void>;
  loadPendingJobs: () => Promise<void>;
  loadSavedJobs: () => Promise<void>;
  skipJob: () => void;
  saveJob: (job: Job) => Promise<boolean>;
  unsaveJob: (savedJobId: string) => Promise<void>;
  isJobSaved: (jobId: string) => Promise<boolean>;
  approveJob: (jobId: string) => Promise<boolean>;
  rejectJob: (jobId: string) => Promise<void>;
  resetFeed: () => void;
  loadPendingEmployers: () => Promise<void>;
  approveEmployer: (id: string) => Promise<boolean>;
  rejectEmployer: (id: string, notes?: string) => Promise<boolean>;
  suspendEmployer: (id: string) => Promise<boolean>;
}

export const useStore = create<AppState>((set, get) => ({
  deviceId: null,
  activeJobs: [],
  pendingJobs: [],
  savedJobs: [],
  currentJobIndex: 0,
  loading: false,
  error: null,
  pendingEmployers: [],

  init: async () => {
    const deviceId = await getDeviceId();
    set({ deviceId });
    await get().loadActiveJobs();
    await get().loadSavedJobs();
  },

  loadActiveJobs: async () => {
    set({ loading: true, error: null });
    const jobs = await fetchActiveJobs();
    set({ activeJobs: jobs, loading: false, currentJobIndex: 0 });
  },

  loadPendingJobs: async () => {
    set({ loading: true });
    const jobs = await fetchPendingJobs();
    set({ pendingJobs: jobs, loading: false });
  },

  loadSavedJobs: async () => {
    const { deviceId } = get();
    if (!deviceId) return;
    set({ loading: true });
    const saved = await fetchSavedJobs(deviceId);
    set({ savedJobs: saved, loading: false });
  },

  skipJob: () => {
    const { activeJobs, currentJobIndex } = get();
    if (currentJobIndex < activeJobs.length - 1) {
      set({ currentJobIndex: currentJobIndex + 1 });
    }
  },

  saveJob: async (job: Job) => {
    const { deviceId } = get();
    if (!deviceId) return false;

    const alreadySaved = await isJobSaved(job.id, deviceId);
    if (alreadySaved) return false;

    const saved = await saveJobToDevice(job.id, deviceId);
    if (saved) {
      await get().loadSavedJobs();
      return true;
    }
    return false;
  },

  unsaveJob: async (savedJobId: string) => {
    await unsaveJob(savedJobId);
    await get().loadSavedJobs();
  },

  isJobSaved: async (jobId: string) => {
    const { deviceId } = get();
    if (!deviceId) return false;
    return await isJobSaved(jobId, deviceId);
  },

  approveJob: async (jobId: string) => {
    const result = await approveJob(jobId);
    if (result) {
      await get().loadPendingJobs();
    }
    return result;
  },

  rejectJob: async (jobId: string) => {
    await rejectJob(jobId);
    await get().loadPendingJobs();
  },

  resetFeed: () => {
    set({ currentJobIndex: 0 });
  },

  loadPendingEmployers: async () => {
    set({ loading: true });
    const employers = await fetchPendingEmployers();
    set({ pendingEmployers: employers, loading: false });
  },

  approveEmployer: async (id: string) => {
    const result = await approveEmployer(id);
    if (result) {
      await get().loadPendingEmployers();
    }
    return result;
  },

  rejectEmployer: async (id: string, notes?: string) => {
    const result = await rejectEmployer(id, notes);
    if (result) {
      await get().loadPendingEmployers();
    }
    return result;
  },

  suspendEmployer: async (id: string) => {
    const result = await suspendEmployer(id);
    if (result) {
      await get().loadPendingEmployers();
    }
    return result;
  },
}));
