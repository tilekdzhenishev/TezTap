import { supabase } from '../supabase/client';

const EMAIL_LIMIT_MESSAGE =
  'Лимит отправки email в Supabase исчерпан. Для разработки подождите около часа или отключите подтверждение email в Supabase Auth. Для нормальной работы подключите Custom SMTP.';

function mapAuthError(error: any): Error {
  const message = String(error?.message ?? '');
  const status = error?.status;
  const code = error?.code;
  const normalized = message.toLowerCase();

  if (code !== 'invalid_credentials') {
    console.error('Supabase auth error:', { message, status, code });
  }

  if (
    status === 429 ||
    normalized.includes('email rate limit') ||
    normalized.includes('email limit exceeded') ||
    normalized.includes('rate limit exceeded')
  ) {
    return new Error(EMAIL_LIMIT_MESSAGE);
  }

  if (normalized.includes('network request failed')) {
    return new Error(
      'Не удалось подключиться к Supabase. Проверьте интернет/VPN/прокси и перезапустите приложение.'
    );
  }

  if (normalized.includes('email not confirmed')) {
    return new Error('Email не подтвержден. Проверьте почту и перейдите по ссылке подтверждения.');
  }

  return error instanceof Error ? error : new Error(message || 'Ошибка авторизации');
}

async function runAuthRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw mapAuthError(error);
  }
}

export interface SignUpUserData {
  fullName: string;
  email: string;
  password: string;
}

export interface SignUpEmployerData {
  companyName: string;
  email: string;
  password: string;
  industry?: string;
  contactPhone?: string;
  description?: string;
}

export async function authSignUpUser(data: SignUpUserData) {
  const { data: authData, error } = await runAuthRequest(() => supabase.auth.signUp({
    email: data.email.trim().toLowerCase(),
    password: data.password,
    options: {
      data: {
        full_name: data.fullName.trim(),
        role: 'user',
      },
    },
  }));
  if (error) throw mapAuthError(error);
  if (!authData.user) throw new Error('Registration failed');

  if (authData.session) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name: data.fullName.trim(),
      role: 'user',
    });
    if (profileError) throw mapAuthError(profileError);
  }

  return authData;
}

export async function authSignUpEmployer(data: SignUpEmployerData) {
  const { data: authData, error } = await runAuthRequest(() => supabase.auth.signUp({
    email: data.email.trim().toLowerCase(),
    password: data.password,
    options: {
      data: {
        full_name: data.companyName.trim(),
        role: 'employer',
        business_name: data.companyName.trim(),
        business_type: data.industry || 'Другое',
        contact_phone: data.contactPhone?.trim() || '',
        description: data.description?.trim() || null,
      },
    },
  }));
  if (error) throw mapAuthError(error);
  if (!authData.user) throw new Error('Registration failed');

  if (authData.session) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name: data.companyName.trim(),
      role: 'employer',
    });
    if (profileError) throw mapAuthError(profileError);

    const { error: employerError } = await supabase.from('employers').insert({
      user_id: authData.user.id,
      business_name: data.companyName.trim(),
      business_type: data.industry || 'Другое',
      contact_phone: data.contactPhone?.trim() || '',
      description: data.description?.trim() || null,
      verification_status: 'pending',
    });
    if (employerError) throw mapAuthError(employerError);
  }

  return authData;
}

export async function authSignIn(email: string, password: string) {
  const { data, error } = await runAuthRequest(() => supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  }));
  if (error) throw mapAuthError(error);
  return data;
}

export async function authSignOut() {
  const { error } = await runAuthRequest(() => supabase.auth.signOut());
  if (error) throw mapAuthError(error);
}

export async function authResetPassword(email: string) {
  const { error } = await runAuthRequest(() => supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase()
  ));
  if (error) throw mapAuthError(error);
}

export function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizePhoneForAuth(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');

  let normalized = '';
  if (trimmed.startsWith('+')) {
    normalized = `+${digits}`;
  } else if (digits.startsWith('00')) {
    normalized = `+${digits.slice(2)}`;
  } else if (digits.startsWith('996') && digits.length === 12) {
    normalized = `+${digits}`;
  } else if (digits.startsWith('0') && digits.length === 10) {
    normalized = `+996${digits.slice(1)}`;
  } else if (digits.length === 9) {
    normalized = `+996${digits}`;
  }

  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    throw new Error('Введите номер телефона в формате +996 XXX XXX XXX');
  }

  return normalized;
}

export async function authSignInWithPhone(phone: string) {
  const normalizedPhone = normalizePhoneForAuth(phone);
  let error;
  try {
    const result = await supabase.auth.signInWithOtp({ phone: normalizedPhone });
    error = result.error;
  } catch (e: any) {
    console.error('Phone OTP network failure:', {
      message: e?.message,
      name: e?.name,
      phone: normalizedPhone,
    });
    throw new Error(
      'Не удалось подключиться к Supabase Auth. Проверьте интернет, VPN/прокси и перезапустите приложение.'
    );
  }

  if (error) {
    console.error('Phone OTP request failed:', {
      message: error.message,
      status: error.status,
      code: error.code,
      phone: normalizedPhone,
    });

    if (error.status === 400) {
      throw new Error(
        'SMS вход не настроен в Supabase. Включите Phone provider и подключите SMS provider в Supabase Auth.'
      );
    }

    throw error;
  }
}

export async function authVerifyOtp(phone: string, token: string) {
  const normalizedPhone = normalizePhoneForAuth(phone);
  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalizedPhone,
    token,
    type: 'sms',
  });
  if (error) throw error;

  // Ensure profile exists for phone users
  if (data.user) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!existing) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: null,
        role: 'user',
      });
    }
  }

  return data;
}
