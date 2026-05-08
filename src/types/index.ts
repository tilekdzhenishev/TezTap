export interface Profile {
  id: string;
  full_name: string | null;
  role: 'user' | 'employer' | 'admin';
  created_at: string;
}

export type EmployerVerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Employer {
  id: string;
  business_name: string;
  business_type: string;
  contact_phone: string;
  description: string | null;
  verification_status: EmployerVerificationStatus;
  created_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
}

export type EmployerDraft = {
  business_name: string;
  business_type: string;
  contact_phone: string;
  description: string;
};

export const BUSINESS_TYPE_OPTIONS = [
  'Супермаркет / магазин',
  'Кафе / ресторан',
  'Склад / логистика',
  'Услуги / сервис',
  'Другое',
] as const;

export interface Job {
  id: string;
  employer_id: string | null;
  title: string;
  description: string;
  payment: string;
  duration: string;
  schedule: string;
  location: string;
  experience: string | null;
  company_name: string | null;
  contact_url: string;
  status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  created_at: string;
  closed_at: string | null;
}

export interface SavedJob {
  id: string;
  job_id: string;
  device_id: string;
  created_at: string;
  job?: Job;
}

export type JobDraft = {
  title: string;
  payment: string;
  duration: string;
  schedule: string;
  location: string;
  description: string;
  experience: string;
  company_name: string;
  contact_url: string;
};

export type WorkerVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface WorkerProfile {
  id: string;
  user_id: string;
  full_name: string;
  birth_year: number | null;
  phone: string | null;
  passport_front_url: string | null;
  selfie_url: string | null;
  verification_status: WorkerVerificationStatus;
  rating: number;
  completed_shifts: number;
  no_show_count: number;
  is_banned: boolean;
  suspended_until: string | null;
  created_at: string;
}

export type JobApplicationStatus =
  | 'applied'
  | 'accepted'
  | 'completed'
  | 'no_show'
  | 'cancelled'
  | 'rejected';

export interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  status: JobApplicationStatus;
  applied_at: string;
  responded_at: string | null;
  rating: number | null;
  no_show_reported: boolean;
  worker_profile?: WorkerProfile;
  job?: Job;
}

export const DURATION_OPTIONS = ['Сегодня', '1–3 дня', '3–7 дней', '1–2 недели', 'Другое'] as const;

export const EXPERIENCE_OPTIONS = ['Можно без опыта', 'Опыт желателен', 'Опыт обязателен'] as const;
