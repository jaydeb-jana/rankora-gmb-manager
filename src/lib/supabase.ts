import { createClient } from '@supabase/supabase-js';
import { CustomerUser, BusinessSettings, CustomerReview, GoogleBusinessAccount, PricingPlan } from '../types';

export const ADMIN_CREDENTIALS = {
  email: 'info@arventaventures.online',
  password: 'Jaydeb@123',
  fullName: 'Jaydeb Jana (Super Admin)',
  mobileNumber: '+91 7872490719',
};

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://cdrqdpfqkuaqxwzinkam.supabase.co';
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || 'sb_publishable_L3ZjqMOgGAAopufiMAhSyQ_w0gzubrP';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Global Realtime Channel for Instant Real-Time Sync across all clients, tabs, and devices
export const realtimeChannel = supabase.channel('rankora-realtime', {
  config: { broadcast: { ack: false, self: false } },
});
try {
  realtimeChannel.subscribe();
} catch (e) {
  console.warn('Realtime channel subscription note:', e);
}

export function broadcastUsersChange(eventType: string, payload: any = {}): void {
  try {
    realtimeChannel.send({
      type: 'broadcast',
      event: 'users_sync',
      payload: { eventType, ...payload, timestamp: Date.now() },
    });
  } catch {}

  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('rankora_realtime_sync');
      bc.postMessage({ eventType, ...payload, timestamp: Date.now() });
      bc.close();
    }
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rankora_users_updated', { detail: { eventType, ...payload } }));
  }
}

// Local persistence cache keys for resilience
const LOCAL_USERS_KEY = 'rankora_supabase_users';
const LOCAL_SETTINGS_KEY = 'rankora_supabase_settings';
const LOCAL_REVIEWS_KEY = 'rankora_supabase_reviews';
const LOCAL_GOOGLE_KEY = 'rankora_supabase_google';
const LOCAL_CURRENT_USER_KEY = 'rankora_current_user';
const LOCAL_OTP_KEY = 'rankora_supabase_otps';
const LOCAL_LOGO_KEY_PREFIX = 'rankora_logo_';
const LOCAL_PLANS_KEY = 'rankora_pricing_plans';
const LOCAL_IMPERSONATOR_KEY = 'rankora_impersonator_admin';
const LOCAL_DELETED_USERS_KEY = 'rankora_deleted_users';

export function getDeletedIdentifiers(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_DELETED_USERS_KEY);
    return raw ? JSON.parse(raw).map((e: string) => (typeof e === 'string' ? e.toLowerCase().trim() : '')) : [];
  } catch {
    return [];
  }
}

export function getDeletedEmails(): string[] {
  return getDeletedIdentifiers();
}

export const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'pro-plan',
    name: 'Pro Plan',
    tagline: 'Essential review automation for single store owners & local shops.',
    monthlyPrice: 749,
    yearlyPrice: 599,
    currency: '₹',
    isPopular: false,
    isActive: true,
    order: 1,
    whatsAppText: 'Hello Arventa Ventures, I would like to activate the Pro Plan for my RANKORA Google Business Profile automation.',
    features: [
      '10 High-Quality AI Review Generations / Day',
      '1 Verified Google Location with live review tracking',
      '16+ Table Tent Stand Layouts (PNG & 300 DPI Print ready)',
      '2 Languages Support (English + 1 Regional Language)',
      'Advanced Gemini Flash AI Engine for human-like 5-star drafts',
      'Owner Reply Approval Queue with 1-click publishing',
      'Custom Review Slug Landing Page with direct Google Maps link',
      'Standard Email Support (24-hour response turnaround)',
    ],
  },
  {
    id: 'ultra-plan',
    name: 'Ultra Plan',
    tagline: 'High-volume retail chains, agencies & multi-counter stores.',
    monthlyPrice: 1499,
    yearlyPrice: 1200,
    currency: '₹',
    isPopular: true,
    isActive: true,
    order: 2,
    whatsAppText: 'Hello Arventa Ventures, I would like to activate the Ultra Plan for my RANKORA Google Business Profile automation.',
    features: [
      'Unlimited Daily AI Review Generations (No Daily Limit)',
      'Multi-Location Support & unlimited QR counter stand downloads',
      'Zero-Delay Auto-Publishing: owner replies post automatically',
      'High-Resolution Vector SVG & PDF commercial printing assets',
      'High-Priority Gemini AI Throughput for instant review drafting',
      'Custom Domain & Brand Logo Branding on customer landing page',
      'Dedicated Priority WhatsApp Messaging Support directly by Arventa Ventures',
      'Dedicated Account Growth Manager for Google Maps local ranking',
    ],
  },
];

// Pure empty array - NO hardcoded mock or demo users can ever auto-regenerate
export const REAL_INITIAL_USERS: Array<{
  user: CustomerUser & { password?: string };
  settings?: Partial<BusinessSettings>;
  googleAccount?: Partial<GoogleBusinessAccount>;
}> = [];

function purgeDemoUsersIfPresent(): void {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return;
    const users = JSON.parse(raw);
    const demoEmails = [
      'contact@arventacafe.com',
      'support@apexmotors.in',
      'manager@royaldental.com',
    ];
    const deleted = getDeletedIdentifiers();
    let changed = false;

    Object.keys(users).forEach((k) => {
      const u = users[k];
      const kLow = k.toLowerCase().trim();
      const uEmailLow = u?.email ? u.email.toLowerCase().trim() : '';
      const uIdLow = u?.id ? u.id.toLowerCase().trim() : '';

      if (
        demoEmails.includes(kLow) ||
        demoEmails.includes(uEmailLow) ||
        deleted.includes(kLow) ||
        (uEmailLow && deleted.includes(uEmailLow)) ||
        (uIdLow && deleted.includes(uIdLow)) ||
        kLow.startsWith('deleted_') ||
        uEmailLow.startsWith('deleted_') ||
        u?.fullName?.includes('[DELETED')
      ) {
        delete users[k];
        changed = true;
      }
    });

    if (changed) {
      setLocalStore(LOCAL_USERS_KEY, users);
    }
  } catch (e) {
    console.warn('Purge demo users notice:', e);
  }
}

function syncRealUsers(): void {
  try {
    purgeDemoUsersIfPresent();
    const rawUsers = localStorage.getItem(LOCAL_USERS_KEY);
    const users = rawUsers ? JSON.parse(rawUsers) : {};
    const allSettings = getLocalStore<Record<string, any>>(LOCAL_SETTINGS_KEY, {});
    const googleAccounts = getLocalStore<Record<string, any>>(LOCAL_GOOGLE_KEY, {});
    const deleted = getDeletedIdentifiers();

    // Aggressively remove any deleted users or emails
    Object.keys(users).forEach((k) => {
      const u = users[k];
      const kLow = k.toLowerCase().trim();
      const uEmailLow = u?.email ? u.email.toLowerCase().trim() : '';
      const uIdLow = u?.id ? u.id.toLowerCase().trim() : '';

      if (
        deleted.includes(kLow) ||
        (uEmailLow && deleted.includes(uEmailLow)) ||
        (uIdLow && deleted.includes(uIdLow)) ||
        kLow.startsWith('deleted_') ||
        uEmailLow.startsWith('deleted_') ||
        u?.fullName?.includes('[DELETED')
      ) {
        delete users[k];
      }
    });

    // Check active session user and ensure they are added to all users registry if valid
    const activeUser = getLocalStore<any>(LOCAL_CURRENT_USER_KEY, null);
    if (
      activeUser &&
      activeUser.email &&
      activeUser.role !== 'admin' &&
      activeUser.email !== 'info@arventaventures.online'
    ) {
      const activeEmailLow = activeUser.email.toLowerCase().trim();
      const activeIdLow = (activeUser.id || '').toLowerCase().trim();
      if (!deleted.includes(activeEmailLow) && !deleted.includes(activeIdLow) && !activeEmailLow.startsWith('deleted_')) {
        if (!users[activeUser.email]) {
          users[activeUser.email] = activeUser;
        }
      }
    }

    setLocalStore(LOCAL_USERS_KEY, users);
    setLocalStore(LOCAL_SETTINGS_KEY, allSettings);
    setLocalStore(LOCAL_GOOGLE_KEY, googleAccounts);
  } catch (e) {
    console.warn('Sync real users notice:', e);
  }
}

export function getStoredLogo(userId: string): string {
  try {
    return localStorage.getItem(LOCAL_LOGO_KEY_PREFIX + userId) || '';
  } catch {
    return '';
  }
}

export function setStoredLogo(userId: string, logo: string): void {
  try {
    if (!logo) {
      localStorage.removeItem(LOCAL_LOGO_KEY_PREFIX + userId);
    } else {
      localStorage.setItem(LOCAL_LOGO_KEY_PREFIX + userId, logo);
    }
  } catch (e) {
    console.warn('Dedicated logo storage notice:', e);
  }
}

function getLocalStore<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalStore<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage set failed, attempting fallback:', e);
  }
}

export const supabaseService = {
  // --------------------------------------------------------------------------
  // AUTHENTICATION & USER MANAGEMENT
  // --------------------------------------------------------------------------
  async register(data: {
    fullName: string;
    businessName: string;
    email: string;
    mobileNumber: string;
    password: string;
    confirmPassword: string;
  }) {
    const email = data.email.toLowerCase().trim();
    if (data.password !== data.confirmPassword) {
      return { error: 'Passwords do not match.' };
    }
    if (data.password.length < 8) {
      return { error: 'Password must be at least 8 characters in length.' };
    }

    try {
      // 1. Attempt Supabase Auth Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            business_name: data.businessName,
            mobile_number: data.mobileNumber,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          return { error: 'An account with this email address already exists. Please log in.' };
        }
        console.warn('Supabase Auth signUp note (Edge Function will dispatch OTP):', authError.message);
      }

      // Generate verification record (Strictly 8-digit OTP)
      const otpCode = Math.floor(10000000 + Math.random() * 90000000).toString();
      const otps = getLocalStore<Record<string, any>>(LOCAL_OTP_KEY, {});
      otps[email] = {
        code: otpCode,
        purpose: 'registration',
        expiresAt: Date.now() + 10 * 60 * 1000,
        userData: {
          id: authData?.user?.id || 'usr_' + Math.random().toString(36).substring(2, 10),
          email,
          fullName: data.fullName,
          businessName: data.businessName,
          mobileNumber: data.mobileNumber,
          password: data.password,
        },
      };
      setLocalStore(LOCAL_OTP_KEY, otps);

      // Save user profile state
      const users = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});
      users[email] = {
        id: otps[email].userData.id,
        email,
        fullName: data.fullName,
        businessName: data.businessName,
        mobileNumber: data.mobileNumber,
        password: data.password,
        isVerified: false,
        createdAt: new Date().toISOString(),
      };
      setLocalStore(LOCAL_USERS_KEY, users);

      // Invoke Supabase Edge Function to dispatch OTP via Gmail SMTP
      try {
        const { error: funcError } = await supabase.functions.invoke('send-email-otp', {
          body: {
            toEmail: email,
            otpCode,
            purpose: 'registration',
            customerName: data.fullName,
          },
        });
        if (funcError) {
          console.warn('Supabase Edge Function send-email-otp dispatch note:', funcError.message);
        }
      } catch (fErr) {
        console.warn('Supabase Edge Function invoke exception:', fErr);
      }

      return {
        success: true,
        message: `An 8-digit verification code has been dispatched to ${email}. Please check your inbox and spam folder.`,
      };
    } catch (err: any) {
      return { error: err.message || 'Failed to complete registration.' };
    }
  },

  async verifyOtp(data: { email: string; otpCode: string; purpose: 'registration' | 'password_reset' }): Promise<{
    success?: boolean;
    message?: string;
    token?: string;
    user?: CustomerUser;
    error?: string;
  }> {
    const email = data.email.toLowerCase().trim();
    const otps = getLocalStore<Record<string, any>>(LOCAL_OTP_KEY, {});
    const record = otps[email];

    // Attempt verification via Supabase Auth
    let supabaseVerified = false;
    let authUser: any = null;
    let authSession: any = null;

    try {
      const { data: vData, error: vError } = await supabase.auth.verifyOtp({
        email,
        token: data.otpCode.trim(),
        type: data.purpose === 'registration' ? 'signup' : 'recovery',
      });
      if (!vError && vData?.user) {
        supabaseVerified = true;
        authUser = vData.user;
        authSession = vData.session;
      }
    } catch (e) {
      console.warn('Supabase Auth verifyOtp note:', e);
    }

    // Verify against record if not directly verified via Supabase Auth
    if (!supabaseVerified) {
      if (!record || record.purpose !== data.purpose) {
        return { error: 'Invalid or expired verification code. Please request a new code.' };
      }

      if (Date.now() > record.expiresAt) {
        delete otps[email];
        setLocalStore(LOCAL_OTP_KEY, otps);
        return { error: 'Verification code has expired. Please request a new code.' };
      }

      if (record.code !== data.otpCode.trim()) {
        return { error: 'Invalid verification code. Please check your email and try again.' };
      }
    }

    if (data.purpose === 'registration') {
      const users = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});
      const user = users[email] || record.userData;
      user.isVerified = true;
      users[email] = user;
      setLocalStore(LOCAL_USERS_KEY, users);
      delete otps[email];
      setLocalStore(LOCAL_OTP_KEY, otps);

      const token = 'sb_token_' + btoa(JSON.stringify({ userId: user.id, email: user.email }));
      localStorage.setItem('rankora_token', token);
      localStorage.setItem('reputepulse_token', token);
      setLocalStore(LOCAL_CURRENT_USER_KEY, user);

      // Initialize Business Settings in Supabase
      await this.initDefaultBusinessSettings(user.id, user.businessName || `${user.fullName}'s Business`);

      // Sync user profile to Supabase
      try {
        await supabase.from('profiles').upsert({
          full_name: user.fullName,
          email: user.email,
          mobile_number: user.mobileNumber,
          created_at: user.createdAt,
          updated_at: new Date().toISOString(),
        });
      } catch {}

      // Broadcast instant real-time sync across all devices and open tabs
      broadcastUsersChange('user_registered', { user });

      return {
        success: true,
        message: 'Account successfully verified and registered with Supabase.',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          mobileNumber: user.mobileNumber,
          isVerified: true,
          createdAt: user.createdAt,
        },
      };
    } else {
      record.verified = true;
      setLocalStore(LOCAL_OTP_KEY, otps);
      return {
        success: true,
        message: 'Verification code confirmed. You may now specify your new password.',
      };
    }
  },

  async resendOtp(data: { email: string; purpose: string }): Promise<{ success?: boolean; message?: string; error?: string }> {
    const email = data.email.toLowerCase().trim();

    // Call Supabase Auth resend
    try {
      if (data.purpose === 'registration') {
        await supabase.auth.resend({
          type: 'signup',
          email,
        });
      } else {
        await supabase.auth.resetPasswordForEmail(email);
      }
    } catch (err: any) {
      console.warn('Supabase resendOtp note:', err);
    }

    const otpCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    const otps = getLocalStore<Record<string, any>>(LOCAL_OTP_KEY, {});
    otps[email] = {
      ...(otps[email] || {}),
      code: otpCode,
      purpose: data.purpose,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    setLocalStore(LOCAL_OTP_KEY, otps);

    // Invoke Supabase Edge Function to dispatch OTP via Gmail SMTP
    try {
      const { error: funcError } = await supabase.functions.invoke('send-email-otp', {
        body: {
          toEmail: email,
          otpCode,
          purpose: data.purpose,
        },
      });
      if (funcError) {
        console.warn('Supabase Edge Function send-email-otp dispatch note:', funcError.message);
      }
    } catch (fErr) {
      console.warn('Supabase Edge Function invoke exception:', fErr);
    }

    return {
      success: true,
      message: `A fresh 8-digit verification code has been dispatched to ${email}. Please check your inbox and spam folder.`,
    };
  },

  async login(data: { email: string; password: string }) {
    const email = data.email.toLowerCase().trim();

    // 0. Super Admin Login Authentication
    if (email === ADMIN_CREDENTIALS.email.toLowerCase()) {
      if (data.password !== ADMIN_CREDENTIALS.password) {
        return { error: 'Invalid password for Super Admin account. Please check your credentials.' };
      }

      syncRealUsers();
      const adminUser: CustomerUser = {
        id: 'admin_arventa_super',
        email: ADMIN_CREDENTIALS.email,
        fullName: ADMIN_CREDENTIALS.fullName,
        mobileNumber: ADMIN_CREDENTIALS.mobileNumber,
        isVerified: true,
        role: 'admin',
        status: 'active',
        businessName: 'Arventa Ventures HQ',
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      const token = 'sb_admin_token_' + btoa(JSON.stringify({ userId: adminUser.id, email: adminUser.email, role: 'admin' }));
      localStorage.setItem('rankora_token', token);
      localStorage.removeItem('reputepulse_token');
      localStorage.removeItem(LOCAL_IMPERSONATOR_KEY);
      setLocalStore(LOCAL_CURRENT_USER_KEY, adminUser);
      await this.initDefaultBusinessSettings(adminUser.id, 'Arventa Ventures HQ');

      return {
        success: true,
        token,
        user: adminUser,
      };
    }

    const deletedList = getDeletedEmails();
    if (deletedList.includes(email)) {
      return { error: 'This account has been deleted by system administrators and no longer exists.' };
    }

    try {
      // Sync real accounts
      syncRealUsers();
      const users = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});
      const user = users[email];

      if (user && user.status === 'suspended') {
        let passwordMatches = data.password === user.password;
        if (!passwordMatches) {
          try {
            const { error: testErr } = await supabase.auth.signInWithPassword({
              email,
              password: data.password,
            });
            if (!testErr) {
              passwordMatches = true;
            }
          } catch {}
        }

        if (passwordMatches) {
          const suspendedUser: CustomerUser = {
            id: user.id || 'usr_' + Math.random().toString(36).slice(2, 8),
            email: user.email,
            fullName: user.fullName || 'Business Owner',
            mobileNumber: user.mobileNumber || '',
            isVerified: true,
            role: user.role || 'user',
            status: 'suspended',
            planId: user.planId || 'pro-plan',
            createdAt: user.createdAt || new Date().toISOString(),
          };
          const token = 'sb_token_' + btoa(JSON.stringify({ userId: suspendedUser.id, email: user.email }));
          localStorage.setItem('rankora_token', token);
          localStorage.removeItem('reputepulse_token');
          setLocalStore(LOCAL_CURRENT_USER_KEY, suspendedUser);
          await this.initDefaultBusinessSettings(suspendedUser.id, user.businessName || `${suspendedUser.fullName}'s Business`);
          return {
            success: true,
            token,
            user: suspendedUser,
          };
        } else {
          return {
            error: 'Invalid password. Please check your credentials.',
          };
        }
      }

      // 1. Try Supabase Auth Sign In
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      });

      if (!authError && authData.user) {
        const authUserIdLow = (authData.user.id || '').toLowerCase().trim();
        const authUserEmailLow = (authData.user.email || email).toLowerCase().trim();
        if (
          deletedList.includes(authUserIdLow) ||
          deletedList.includes(authUserEmailLow) ||
          authUserEmailLow.startsWith('deleted_')
        ) {
          try {
            await supabase.auth.signOut();
          } catch {}
          return { error: 'This account has been deleted by system administrators and no longer exists.' };
        }

        const existingStatus = user?.status || users[email]?.status || 'active';
        const currentUser: CustomerUser = {
          id: authData.user.id,
          email: authData.user.email || email,
          fullName: authData.user.user_metadata?.full_name || user?.fullName || 'Business Owner',
          mobileNumber: authData.user.user_metadata?.mobile_number || user?.mobileNumber || '',
          isVerified: true,
          role: user?.role || 'user',
          status: existingStatus,
          planId: user?.planId || 'pro-plan',
          createdAt: authData.user.created_at || new Date().toISOString(),
        };

        const token = authData.session?.access_token || 'sb_token_' + btoa(JSON.stringify({ userId: currentUser.id, email }));
        localStorage.setItem('rankora_token', token);
        localStorage.removeItem('reputepulse_token');
        setLocalStore(LOCAL_CURRENT_USER_KEY, currentUser);

        // Save user to all users registry without resetting suspended status
        const usersRecord = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});
        usersRecord[currentUser.email] = {
          ...(usersRecord[currentUser.email] || {}),
          ...currentUser,
          status: existingStatus,
          businessName: user?.businessName || authData.user.user_metadata?.business_name || `${currentUser.fullName}'s Business`,
        };
        setLocalStore(LOCAL_USERS_KEY, usersRecord);

        // Ensure business settings exist
        await this.initDefaultBusinessSettings(currentUser.id, user?.businessName || `${currentUser.fullName}'s Business`);

        return {
          success: true,
          token,
          user: currentUser,
        };
      }

      // 2. Check registered users in local Supabase store
      if (user && user.password === data.password) {
        const token = 'sb_token_' + btoa(JSON.stringify({ userId: user.id, email: user.email }));
        localStorage.setItem('rankora_token', token);
        localStorage.removeItem('reputepulse_token');
        setLocalStore(LOCAL_CURRENT_USER_KEY, user);
        await this.initDefaultBusinessSettings(user.id, user.businessName || `${user.fullName}'s Business`);

        return {
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            mobileNumber: user.mobileNumber,
            isVerified: true,
            role: user.role || 'user',
            status: user.status || 'active',
            planId: user.planId || 'pro-plan',
            createdAt: user.createdAt,
          },
        };
      }

      // If user exists in local registered accounts but password did not match:
      if (user) {
        return { error: 'Invalid password. Please check your credentials.' };
      }

      // If Supabase authentication returned an error:
      if (authError) {
        if (
          authError.message.includes('Invalid login credentials') ||
          authError.message.includes('invalid_grant') ||
          authError.message.includes('Email not confirmed')
        ) {
          return { error: 'Invalid email or password. Please verify your credentials or create a new account.' };
        }
        return { error: authError.message };
      }

      // Account not found
      return {
        error: 'No account found with this email address. Please click "Create account" to register.',
      };
    } catch (err: any) {
      return { error: err.message || 'Login failed.' };
    }
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase auth signOut error:', e);
    }
    // Remove local storage user and tokens
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
    localStorage.removeItem(LOCAL_IMPERSONATOR_KEY);
    localStorage.removeItem('rankora_token');
    localStorage.removeItem('reputepulse_token');

    // Clean any Supabase auth keys from localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth-token') || key.startsWith('supabase.auth'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}

    broadcastUsersChange('user_logged_out', {});
    return { success: true };
  },

  async forgotPassword(email: string) {
    const trimmed = email.toLowerCase().trim();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed);
      if (error) {
        if (
          error.message.includes('rate limit') ||
          (error as any).code === 'over_email_send_rate_limit'
        ) {
          return {
            error:
              'Supabase email limit exceeded (max 3-4/hr). Please configure Custom SMTP in your Supabase Dashboard using your Gmail credentials or wait a few minutes.',
          };
        }
        return { error: error.message };
      }
    } catch (err: any) {
      console.warn('Supabase resetPasswordForEmail note:', err);
    }

    const otpCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    const otps = getLocalStore<Record<string, any>>(LOCAL_OTP_KEY, {});
    otps[trimmed] = {
      code: otpCode,
      purpose: 'password_reset',
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    setLocalStore(LOCAL_OTP_KEY, otps);

    // Invoke Supabase Edge Function to dispatch OTP via Gmail SMTP
    try {
      const { error: funcError } = await supabase.functions.invoke('send-email-otp', {
        body: {
          toEmail: trimmed,
          otpCode,
          purpose: 'password_reset',
        },
      });
      if (funcError) {
        console.warn('Supabase Edge Function send-email-otp dispatch note:', funcError.message);
      }
    } catch (fErr) {
      console.warn('Supabase Edge Function invoke exception:', fErr);
    }

    return {
      success: true,
      message: `An 8-digit password reset code has been dispatched to ${trimmed}. Please check your inbox and spam folder.`,
    };
  },

  async resetPassword(data: { email: string; otpCode: string; newPassword: string; confirmPassword: string }) {
    if (data.newPassword !== data.confirmPassword) {
      return { error: 'Passwords do not match.' };
    }
    const email = data.email.toLowerCase().trim();
    const users = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});
    if (users[email]) {
      users[email].password = data.newPassword;
      setLocalStore(LOCAL_USERS_KEY, users);
    }
    try {
      await supabase.auth.updateUser({ password: data.newPassword });
    } catch {}

    return {
      success: true,
      message: 'Password successfully updated. You may now sign in with your new credentials.',
    };
  },

  getMe(): { user?: CustomerUser; error?: string } {
    let currentUser = getLocalStore<CustomerUser | null>(LOCAL_CURRENT_USER_KEY, null);
    const usersRecord = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});

    if (!currentUser) {
      const token = localStorage.getItem('rankora_token') || localStorage.getItem('reputepulse_token');
      if (token && token.startsWith('sb_token_')) {
        try {
          const payload = JSON.parse(atob(token.replace('sb_token_', '')));
          if (payload.email && usersRecord[payload.email.toLowerCase()]) {
            currentUser = { ...usersRecord[payload.email.toLowerCase()] };
            setLocalStore(LOCAL_CURRENT_USER_KEY, currentUser);
          }
        } catch {}
      }
    }

    if (currentUser) {
      const email = currentUser.email ? currentUser.email.toLowerCase().trim() : '';
      const id = currentUser.id ? currentUser.id.toLowerCase().trim() : '';
      const deletedList = getDeletedIdentifiers();

      if (
        (email && deletedList.includes(email)) ||
        (id && deletedList.includes(id)) ||
        email.startsWith('deleted_')
      ) {
        localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
        localStorage.removeItem('rankora_token');
        localStorage.removeItem('reputepulse_token');
        return { error: 'No active session (account deleted).' };
      }

      const liveUser = email ? usersRecord[email] : null;
      if (liveUser) {
        currentUser.status = liveUser.status || currentUser.status || 'active';
        currentUser.role = liveUser.role || currentUser.role;
        currentUser.planId = liveUser.planId || currentUser.planId;
        setLocalStore(LOCAL_CURRENT_USER_KEY, currentUser);
      }
      return { user: currentUser };
    }
    return { error: 'No active session.' };
  },

  // --------------------------------------------------------------------------
  // BUSINESS SETTINGS
  // --------------------------------------------------------------------------
  async initDefaultBusinessSettings(userId: string, businessName: string): Promise<BusinessSettings> {
    const allSettings = getLocalStore<Record<string, BusinessSettings>>(LOCAL_SETTINGS_KEY, {});
    if (allSettings[userId]) {
      return allSettings[userId];
    }

    const baseSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const customSlug = (baseSlug || 'store') + '-' + userId.slice(-4);

    const isSuperAdmin = userId === 'usr_admin' || userId === 'admin-demo';
    const defaultSettings: BusinessSettings = {
      id: 'biz-' + userId,
      userId,
      businessName,
      category: 'Retail Store',
      placeId: isSuperAdmin ? 'ChIJQ6v9a_d-lDkR4Vq7hC8k97s' : '',
      googleReviewUrl: isSuperAdmin ? 'https://search.google.com/local/writereview?placeid=ChIJQ6v9a_d-lDkR4Vq7hC8k97s' : '',
      customSlug,
      productsAndServices: '',
      services: [],
      shopAiDetails: '',
      reviewWritingRules: 'Focus on friendly staff, store ambiance, and prompt customer assistance.',
      reviewStyleAndRules: 'Focus on friendly staff, store ambiance, and prompt customer assistance.',
      customerExperience: 'Clean, modern, and highly customer-friendly store environment.',
      brandTone: 'friendly',
      targetKeywords: ['best store', 'friendly staff', 'great collection', 'fast service'],
      languagePreferences: [
        { code: 'en', name: 'English', percentage: 100 },
      ],
      autoReplyEnabled: true,
      autoReplyMode: 'approval',
      minStarRating: 4,
      responseDelayMinutes: 5,
      updatedAt: new Date().toISOString(),
    };

    allSettings[userId] = defaultSettings;
    setLocalStore(LOCAL_SETTINGS_KEY, allSettings);

    try {
      await supabase.from('business_settings').upsert({
        user_id: userId,
        settings: defaultSettings,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase business_settings sync fallback active');
    }

    return defaultSettings;
  },

  async getBusinessSettings(): Promise<{ settings: BusinessSettings }> {
    const me = this.getMe();
    const userId = me.user?.id || 'usr_default';
    const allSettings = getLocalStore<Record<string, BusinessSettings>>(LOCAL_SETTINGS_KEY, {});
    let localSettings = allSettings[userId];

    if (!localSettings) {
      localSettings = await this.initDefaultBusinessSettings(
        userId,
        me.user?.fullName ? `${me.user.fullName}'s Business` : 'My Business'
      );
    }

    const isMockUrl = (url?: string) =>
      Boolean(
        url &&
          (url.includes('ChIJQ6v9a_d-lDkR4Vq7hC8k97s') ||
            url.includes('ChIJQ6v9a_d-IDkR4Vq7hC8k97s'))
      );

    if (me.user?.email !== ADMIN_CREDENTIALS.email && isMockUrl(localSettings.googleReviewUrl)) {
      localSettings.googleReviewUrl = '';
      localSettings.placeId = '';
    }

    // Ensure logo is loaded from dedicated store if missing in settings
    if (!localSettings.businessLogo) {
      const storedLogo = getStoredLogo(userId);
      if (storedLogo) {
        localSettings.businessLogo = storedLogo;
      }
    }

    // Non-blocking query to Supabase with 1.5s timeout to avoid any page freeze
    try {
      const fetchPromise = supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 1500)
      );

      const res: any = await Promise.race([fetchPromise, timeoutPromise]);
      const data = res?.data;

      if (data) {
        const remoteLogo = data.google_account_info?.businessLogo || '';
        const effectiveLogo = remoteLogo || localSettings.businessLogo || getStoredLogo(userId);

        const mapped: BusinessSettings = {
          id: data.id || localSettings.id,
          userId: data.user_id || userId,
          businessName: data.business_name || localSettings.businessName,
          category: data.category || localSettings.category,
          placeId: data.place_id ?? localSettings.placeId,
          googleReviewUrl: data.google_review_url ?? localSettings.googleReviewUrl,
          productsAndServices: data.products_and_services ?? localSettings.productsAndServices,
          services: data.google_account_info?.services ?? (localSettings.services || (data.products_and_services ? data.products_and_services.split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean) : [])),
          customerExperience: data.customer_experience ?? localSettings.customerExperience,
          shopAiDetails: data.google_account_info?.shopAiDetails ?? (data.customer_experience ?? (localSettings.shopAiDetails || '')),
          brandTone: data.brand_tone || localSettings.brandTone,
          targetKeywords: data.target_keywords || localSettings.targetKeywords,
          customSlug: data.custom_slug || localSettings.customSlug,
          languagePreferences: data.language_preferences || localSettings.languagePreferences,
          autoReplyEnabled: data.auto_reply_enabled ?? localSettings.autoReplyEnabled,
          autoReplyMode: data.auto_reply_mode || localSettings.autoReplyMode,
          minStarRating: data.min_star_rating ?? localSettings.minStarRating,
          responseDelayMinutes: data.response_delay_minutes ?? localSettings.responseDelayMinutes,
          businessLogo: effectiveLogo,
          reviewWritingRules: data.google_account_info?.reviewWritingRules ?? (data.google_account_info?.reviewStyleAndRules ?? (localSettings.reviewWritingRules || '')),
          reviewStyleAndRules: data.google_account_info?.reviewStyleAndRules ?? (data.google_account_info?.reviewWritingRules ?? (localSettings.reviewStyleAndRules || '')),
          geminiApiKey: data.google_account_info?.geminiApiKey || localSettings.geminiApiKey,
          updatedAt: data.updated_at || localSettings.updatedAt,
        };

        if (me.user?.email !== ADMIN_CREDENTIALS.email && isMockUrl(mapped.googleReviewUrl)) {
          mapped.googleReviewUrl = '';
          mapped.placeId = '';
        }

        allSettings[userId] = mapped;
        setLocalStore(LOCAL_SETTINGS_KEY, allSettings);
        if (effectiveLogo) {
          setStoredLogo(userId, effectiveLogo);
        }
        return { settings: mapped };
      }
    } catch {
      // Return fast cached local settings
    }

    return { settings: localSettings };
  },

  async updateBusinessSettings(
    updates: Partial<BusinessSettings> & { fullName?: string; mobileNumber?: string }
  ): Promise<{ success: boolean; settings: BusinessSettings; user?: CustomerUser; error?: string; message?: string }> {
    const me = this.getMe();
    const userId = me.user?.id || 'usr_default';
    const allSettings = getLocalStore<Record<string, BusinessSettings>>(LOCAL_SETTINGS_KEY, {});
    const existing = allSettings[userId] || (await this.initDefaultBusinessSettings(userId, 'My Business'));

    const effectiveRules = updates.reviewStyleAndRules !== undefined ? updates.reviewStyleAndRules : updates.reviewWritingRules;
    const finalLogo = updates.businessLogo !== undefined ? updates.businessLogo : (existing.businessLogo || getStoredLogo(userId));
    const finalServices = updates.services !== undefined ? updates.services : existing.services;
    const finalShopDetails = updates.shopAiDetails !== undefined ? updates.shopAiDetails : existing.shopAiDetails;
    const finalProductsServices = updates.productsAndServices !== undefined 
      ? updates.productsAndServices 
      : (finalServices && finalServices.length > 0 ? finalServices.join(', ') : existing.productsAndServices);

    const newSettings: BusinessSettings = {
      ...existing,
      ...updates,
      businessLogo: finalLogo,
      services: finalServices,
      shopAiDetails: finalShopDetails,
      productsAndServices: finalProductsServices,
      customerExperience: finalShopDetails || updates.customerExperience || existing.customerExperience || '',
      reviewWritingRules: effectiveRules !== undefined ? effectiveRules : existing.reviewWritingRules,
      reviewStyleAndRules: effectiveRules !== undefined ? effectiveRules : existing.reviewStyleAndRules,
      updatedAt: new Date().toISOString(),
    };

    // 1. Instant local persistence
    setStoredLogo(userId, finalLogo || '');
    allSettings[userId] = newSettings;
    setLocalStore(LOCAL_SETTINGS_KEY, allSettings);

    // 2. Update user profile if changed
    let updatedUser = me.user;
    if (updatedUser?.email) {
      const users = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});
      users[updatedUser.email] = {
        ...(users[updatedUser.email] || {}),
        ...updatedUser,
        fullName: updates.fullName || updatedUser.fullName,
        mobileNumber: updates.mobileNumber || updatedUser.mobileNumber,
        businessName: newSettings.businessName,
      };
      setLocalStore(LOCAL_USERS_KEY, users);

      if (updates.fullName || updates.mobileNumber) {
        updatedUser = {
          ...updatedUser,
          fullName: updates.fullName || updatedUser.fullName,
          mobileNumber: updates.mobileNumber || updatedUser.mobileNumber,
          businessName: newSettings.businessName,
        };
        setLocalStore(LOCAL_CURRENT_USER_KEY, updatedUser);
      }
    }

    // 3. Non-blocking asynchronous sync to Supabase with real table columns
    const dbPayload: any = {
      user_id: userId,
      business_name: newSettings.businessName,
      category: newSettings.category || 'Retail Store',
      place_id: newSettings.placeId || '',
      google_review_url: newSettings.googleReviewUrl || '',
      products_and_services: newSettings.productsAndServices || '',
      customer_experience: newSettings.shopAiDetails || newSettings.customerExperience || '',
      brand_tone: newSettings.brandTone || 'friendly',
      target_keywords: newSettings.targetKeywords || [],
      custom_slug: newSettings.customSlug || ('business-' + userId.slice(-4)),
      language_preferences: newSettings.languagePreferences || [{ code: 'en', name: 'English', percentage: 100 }],
      auto_reply_enabled: Boolean(newSettings.autoReplyEnabled),
      auto_reply_mode: newSettings.autoReplyMode || 'approval',
      min_star_rating: newSettings.minStarRating || 4,
      response_delay_minutes: newSettings.responseDelayMinutes || 5,
      google_account_info: {
        ...((existing as any).googleAccountInfo || {}),
        businessLogo: finalLogo || '',
        reviewWritingRules: newSettings.reviewWritingRules || '',
        reviewStyleAndRules: newSettings.reviewStyleAndRules || '',
        geminiApiKey: newSettings.geminiApiKey || '',
        services: newSettings.services || [],
        shopAiDetails: newSettings.shopAiDetails || '',
      },
      updated_at: new Date().toISOString(),
    };

    // Background sync - does not block UI return
    (async () => {
      try {
        await supabase.from('business_settings').upsert(dbPayload, { onConflict: 'user_id' });
      } catch (err) {
        console.warn('Supabase business_settings sync notice:', err);
      }
    })();

    return {
      success: true,
      message: 'Business profile and logo saved successfully!',
      settings: newSettings,
      user: updatedUser,
    };
  },

  // --------------------------------------------------------------------------
  // REVIEWS MANAGEMENT
  // --------------------------------------------------------------------------
  async getReviews(): Promise<{ reviews: CustomerReview[] }> {
    const me = this.getMe();
    const userId = me.user?.id || 'usr_default';

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return { reviews: data.map((d) => d.review_data || d) };
      }
    } catch {}

    const allReviews = getLocalStore<Record<string, CustomerReview[]>>(LOCAL_REVIEWS_KEY, {});
    const reviews = allReviews[userId] || [];
    return { reviews };
  },

  async submitReply(reviewId: string, replyText: string, action: 'publish' | 'draft'): Promise<{ success: boolean; review: CustomerReview }> {
    const me = this.getMe();
    const userId = me.user?.id || 'usr_default';
    const allReviews = getLocalStore<Record<string, CustomerReview[]>>(LOCAL_REVIEWS_KEY, {});
    const reviews = allReviews[userId] || [];
    const index = reviews.findIndex((r) => r.id === reviewId);

    if (index !== -1) {
      reviews[index] = {
        ...reviews[index],
        replyText,
        replyStatus: action === 'publish' ? 'published' : 'drafted',
        replyDate: action === 'publish' ? new Date().toISOString() : undefined,
      };
      allReviews[userId] = reviews;
      setLocalStore(LOCAL_REVIEWS_KEY, allReviews);

      try {
        await supabase.from('reviews').upsert({
          id: reviewId,
          user_id: userId,
          review_data: reviews[index],
          updated_at: new Date().toISOString(),
        });
      } catch {}

      return { success: true, review: reviews[index] };
    }

    throw new Error('Review not found');
  },

  async testIncomingReview(data: { authorName?: string; starRating?: number; reviewText?: string }): Promise<{ success: boolean; message: string; review: CustomerReview }> {
    const me = this.getMe();
    const userId = me.user?.id || 'usr_default';
    const allReviews = getLocalStore<Record<string, CustomerReview[]>>(LOCAL_REVIEWS_KEY, {});
    const reviews = allReviews[userId] || [];

    const newRev: CustomerReview = {
      id: 'rev-' + Math.random().toString(36).substring(2, 9),
      userId,
      authorName: data.authorName || 'Simulated Customer',
      starRating: data.starRating || 5,
      reviewText: data.reviewText || 'Superb quality and friendly staff. Truly five-star service!',
      reviewDate: new Date().toISOString(),
      replyStatus: 'pending',
      autoReplied: false,
    };

    reviews.unshift(newRev);
    allReviews[userId] = reviews;
    setLocalStore(LOCAL_REVIEWS_KEY, allReviews);

    try {
      await supabase.from('reviews').insert({
        id: newRev.id,
        user_id: userId,
        review_data: newRev,
        created_at: newRev.reviewDate,
      });
    } catch {}

    return {
      success: true,
      message: 'Incoming review recorded in Supabase.',
      review: newRev,
    };
  },

  // --------------------------------------------------------------------------
  // GOOGLE ACCOUNT
  // --------------------------------------------------------------------------
  async getGoogleAccount(): Promise<{ account: GoogleBusinessAccount }> {
    const me = this.getMe();
    const userId = me.user?.id || 'usr_default';
    const store = getLocalStore<Record<string, GoogleBusinessAccount>>(LOCAL_GOOGLE_KEY, {});
    return {
      account: store[userId] || {
        connected: false,
      },
    };
  },

  async simulateGoogleConnect(data: {
    locationName?: string;
    address?: string;
    placeId?: string;
    rating?: number;
    reviewCount?: number;
  }): Promise<{ success: boolean; account: GoogleBusinessAccount }> {
    const me = this.getMe();
    const userId = me.user?.id || 'usr_default';
    const account: GoogleBusinessAccount = {
      connected: true,
      locationName: data.locationName || 'My Google Business',
      address: data.address || 'Kolkata, West Bengal, India',
      placeId: data.placeId || 'ChIJQ6v9a_d-lDkR4Vq7hC8k97s',
      rating: data.rating || 4.9,
      reviewCount: data.reviewCount || 128,
      connectedAt: new Date().toISOString(),
    };

    const store = getLocalStore<Record<string, GoogleBusinessAccount>>(LOCAL_GOOGLE_KEY, {});
    store[userId] = account;
    setLocalStore(LOCAL_GOOGLE_KEY, store);

    try {
      await supabase.from('google_accounts').upsert({
        user_id: userId,
        account_data: account,
        updated_at: new Date().toISOString(),
      });
    } catch {}

    return { success: true, account };
  },

  async disconnectGoogle(): Promise<{ success: boolean; message: string }> {
    const me = this.getMe();
    const userId = me.user?.id || 'usr_default';
    const store = getLocalStore<Record<string, GoogleBusinessAccount>>(LOCAL_GOOGLE_KEY, {});
    delete store[userId];
    setLocalStore(LOCAL_GOOGLE_KEY, store);

    try {
      await supabase.from('google_accounts').delete().eq('user_id', userId);
    } catch {}

    return { success: true, message: 'Google Business Profile disconnected.' };
  },

  // --------------------------------------------------------------------------
  // CONTACT INQUIRY DISPATCH
  // --------------------------------------------------------------------------
  async sendContactInquiry(data: {
    name: string;
    email: string;
    mobile?: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      // 1. Record contact inquiry in Supabase table
      await supabase.from('contact_inquiries').insert({
        name: data.name,
        email: data.email,
        mobile: data.mobile || '',
        subject: data.subject || 'RANKORA Inquiry',
        message: data.message,
        recipient: 'info@arventaventures.online',
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase contact_inquiries record note:', err);
    }

    return {
      success: true,
      message: 'Your inquiry has been successfully sent.',
    };
  },

  // --------------------------------------------------------------------------
  // PUBLIC BUSINESS BY SLUG
  // --------------------------------------------------------------------------
  async getPublicBusiness(slug: string): Promise<any> {
    const sanitized = slug.toLowerCase().trim();

    // 1. Query Supabase business_settings table by custom_slug with 1.5s timeout
    try {
      const fetchPromise = supabase
        .from('business_settings')
        .select('*')
        .ilike('custom_slug', sanitized)
        .maybeSingle();

      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 1500)
      );

      const res: any = await Promise.race([fetchPromise, timeoutPromise]);
      const data = res?.data;

      if (data && !res?.error) {
        let effectiveKey = data.google_account_info?.geminiApiKey || (data as any).gemini_api_key || '';
        if (!effectiveKey) {
          const allSettings = getLocalStore<Record<string, BusinessSettings>>(LOCAL_SETTINGS_KEY, {});
          for (const biz of Object.values(allSettings)) {
            if (biz.customSlug?.toLowerCase() === sanitized && biz.geminiApiKey) {
              effectiveKey = biz.geminiApiKey;
              break;
            }
          }
        }

        const isSuspended =
          data.google_account_info?.isSuspended === true ||
          data.google_account_info?.status === 'suspended';

        return {
          businessName: data.business_name,
          businessLogo: data.google_account_info?.businessLogo || '',
          category: data.category,
          customSlug: data.custom_slug,
          isSuspended,
          googleReviewUrl: isSuspended ? '' : data.google_review_url,
          productsAndServices: data.products_and_services || '',
          services: data.google_account_info?.services || (data.products_and_services ? data.products_and_services.split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean) : []),
          customerExperience: data.customer_experience || '',
          brandTone: data.brand_tone || 'friendly',
          targetKeywords: data.target_keywords || [],
          languagePreferences: data.language_preferences || [
            { code: 'en', name: 'English', percentage: 100 },
          ],
          shopAiDetails: data.google_account_info?.shopAiDetails || '',
          reviewWritingRules: data.google_account_info?.reviewWritingRules || '',
          geminiApiKey: effectiveKey,
        };
      }
    } catch (err) {
      console.warn('Supabase remote getPublicBusiness check note:', err);
    }

    // 2. Fall back to local store
    const allSettings = getLocalStore<Record<string, BusinessSettings>>(LOCAL_SETTINGS_KEY, {});
    const usersRecord = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});

    for (const biz of Object.values(allSettings)) {
      if (biz.customSlug?.toLowerCase() === sanitized) {
        const owner = Object.values(usersRecord).find(
          (u: any) =>
            u.id === biz.userId ||
            (u.email && u.email.toLowerCase() === biz.userId?.toLowerCase())
        );
        const isSuspended =
          owner?.status === 'suspended' ||
          biz.isSuspended === true ||
          (biz as any).status === 'suspended' ||
          (biz as any).googleAccountInfo?.isSuspended === true;

        return {
          businessName: biz.businessName,
          businessLogo: biz.businessLogo,
          category: biz.category,
          customSlug: biz.customSlug,
          isSuspended,
          googleReviewUrl: isSuspended ? '' : biz.googleReviewUrl,
          productsAndServices: biz.productsAndServices || '',
          services: biz.services || (biz.productsAndServices ? biz.productsAndServices.split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean) : []),
          customerExperience: biz.customerExperience || '',
          brandTone: biz.brandTone || 'friendly',
          targetKeywords: biz.targetKeywords || [],
          languagePreferences: biz.languagePreferences || [
            { code: 'en', name: 'English', percentage: 100 },
          ],
          shopAiDetails: biz.shopAiDetails || '',
          reviewWritingRules: biz.reviewWritingRules || '',
          geminiApiKey: biz.geminiApiKey || (biz as any).googleAccountInfo?.geminiApiKey || '',
        };
      }
    }

    // 3. Fallback to active user's business settings if available
    const activeUser = getLocalStore<any>(LOCAL_CURRENT_USER_KEY, null);
    if (activeUser?.id && allSettings[activeUser.id]) {
      const biz = allSettings[activeUser.id];
      const isSuspended = activeUser.status === 'suspended' || biz.isSuspended === true;
      return {
        businessName: biz.businessName,
        businessLogo: biz.businessLogo,
        category: biz.category,
        customSlug: biz.customSlug,
        isSuspended,
        googleReviewUrl: isSuspended ? '' : biz.googleReviewUrl,
        productsAndServices: biz.productsAndServices || '',
        services: biz.services || (biz.productsAndServices ? biz.productsAndServices.split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean) : []),
        customerExperience: biz.customerExperience || '',
        brandTone: biz.brandTone || 'friendly',
        targetKeywords: biz.targetKeywords || [],
        languagePreferences: biz.languagePreferences || [
          { code: 'en', name: 'English', percentage: 100 },
        ],
        shopAiDetails: biz.shopAiDetails || '',
        reviewWritingRules: biz.reviewWritingRules || '',
        geminiApiKey: biz.geminiApiKey || (biz as any).googleAccountInfo?.geminiApiKey || '',
      };
    }

    // Default business fallback if slug not found
    return {
      businessName: 'Premium Business Store',
      category: 'Retail Store',
      customSlug: sanitized,
      googleReviewUrl: 'https://g.page/r/sample-business-review',
      productsAndServices: 'High quality collections and customer care',
      customerExperience: 'Clean, modern, and highly customer-friendly store environment.',
      brandTone: 'friendly',
      targetKeywords: ['best store', 'friendly staff', 'great collection', 'fast service'],
      languagePreferences: [
        { code: 'en', name: 'English', percentage: 100 },
      ],
    };
  },

  async getAllUsers(): Promise<{ users: CustomerUser[] }> {
    syncRealUsers();
    const realUsersMap: Record<string, CustomerUser> = {};
    const deleted = getDeletedIdentifiers();

    // 1. Load local persistence stores first to prevent TDZ reference errors
    const usersRecord = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});
    const allSettings = getLocalStore<Record<string, BusinessSettings>>(LOCAL_SETTINGS_KEY, {});

    // 2. Fetch real registered users from Supabase PostgreSQL profiles table
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(profiles) && profiles.length > 0) {
        // Also fetch business settings for these users
        const { data: bizList } = await supabase
          .from('business_settings')
          .select('user_id, business_name, custom_slug');

        const bizMap = new Map<string, string>();
        if (Array.isArray(bizList)) {
          bizList.forEach((b: any) => {
            if (b.user_id && b.business_name) {
              bizMap.set(b.user_id, b.business_name);
            }
          });
        }

        profiles.forEach((p: any) => {
          if (!p.email) return;
          const email = p.email.toLowerCase().trim();
          const pId = p.id ? p.id.toLowerCase().trim() : '';

          // Completely skip if deleted, marked as deleted, or fake demo
          if (
            deleted.includes(email) ||
            deleted.includes(pId) ||
            email.startsWith('deleted_') ||
            p.full_name?.includes('[DELETED') ||
            email === 'contact@arventacafe.com' ||
            email === 'support@apexmotors.in' ||
            email === 'manager@royaldental.com'
          ) {
            return;
          }

          const existingLocal = usersRecord[email];
          realUsersMap[email] = {
            id: p.id || existingLocal?.id || 'usr_' + Math.random().toString(36).slice(2, 8),
            email: p.email,
            fullName: p.full_name || existingLocal?.fullName || 'Business Owner',
            mobileNumber: p.mobile_number || existingLocal?.mobileNumber || '',
            isVerified: true,
            createdAt: p.created_at || existingLocal?.createdAt || new Date().toISOString(),
            role: email === ADMIN_CREDENTIALS.email.toLowerCase() ? 'admin' : 'user',
            status: existingLocal?.status || 'active',
            businessName: bizMap.get(p.id) || existingLocal?.businessName || `${p.full_name || 'My'}'s Business`,
            planId: existingLocal?.planId || 'pro-plan',
            password: existingLocal?.password || p.raw_user_meta_data?.password || 'Jaydeb@123',
          };
        });
      }
    } catch (e) {
      console.warn('Supabase profiles query error:', e);
    }

    // 3. Combine with locally registered or admin-created users
    Object.values(usersRecord).forEach((u: any) => {
      if (!u || !u.email) return;
      const email = u.email.toLowerCase().trim();
      const uId = u.id ? u.id.toLowerCase().trim() : '';

      if (
        deleted.includes(email) ||
        deleted.includes(uId) ||
        email.startsWith('deleted_') ||
        u.fullName?.includes('[DELETED') ||
        email === 'contact@arventacafe.com' ||
        email === 'support@apexmotors.in' ||
        email === 'manager@royaldental.com'
      ) {
        return;
      }

      const userSettings = allSettings[u.id];
      const existing = realUsersMap[email];
      realUsersMap[email] = {
        id: u.id || existing?.id || 'usr_' + Math.random().toString(36).slice(2, 8),
        email: u.email,
        fullName: u.fullName || existing?.fullName || 'Business Owner',
        mobileNumber: u.mobileNumber || existing?.mobileNumber || '',
        isVerified: u.isVerified ?? existing?.isVerified ?? true,
        createdAt: u.createdAt || existing?.createdAt || new Date().toISOString(),
        role: u.role || existing?.role || (email === ADMIN_CREDENTIALS.email.toLowerCase() ? 'admin' : 'user'),
        status: u.status || existing?.status || 'active',
        businessName: userSettings?.businessName || u.businessName || existing?.businessName || `${u.fullName || 'Business Owner'}'s Business`,
        planId: u.planId || existing?.planId || 'pro-plan',
        password: u.password || existing?.password || 'Jaydeb@123',
      };
    });

    return { users: Object.values(realUsersMap) };
  },

  async updateUser(
    userId: string,
    data: Partial<CustomerUser> & { businessName?: string }
  ): Promise<{ success: boolean; user?: CustomerUser; error?: string }> {
    const usersRecord = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});
    const targetEmail = Object.keys(usersRecord).find((e) => usersRecord[e].id === userId);

    if (!targetEmail) {
      return { success: false, error: 'User not found in system.' };
    }

    const current = usersRecord[targetEmail];
    const newEmail = data.email ? data.email.toLowerCase().trim() : targetEmail;

    const updatedUser = {
      ...current,
      ...data,
      email: newEmail,
    };

    if (newEmail !== targetEmail) {
      delete usersRecord[targetEmail];
      usersRecord[newEmail] = updatedUser;
    } else {
      usersRecord[targetEmail] = updatedUser;
    }

    setLocalStore(LOCAL_USERS_KEY, usersRecord);

    // Update business settings if businessName changed
    if (data.businessName) {
      const allSettings = getLocalStore<Record<string, BusinessSettings>>(LOCAL_SETTINGS_KEY, {});
      if (allSettings[userId]) {
        allSettings[userId].businessName = data.businessName;
        allSettings[userId].updatedAt = new Date().toISOString();
        setLocalStore(LOCAL_SETTINGS_KEY, allSettings);
      }
    }

    // If currently logged-in user is this user, update active session
    const currentUser = getLocalStore<CustomerUser | null>(LOCAL_CURRENT_USER_KEY, null);
    if (currentUser && currentUser.id === userId) {
      setLocalStore(LOCAL_CURRENT_USER_KEY, { ...currentUser, ...updatedUser });
    }

    // Sync to Supabase profiles
    try {
      await supabase.from('profiles').update({
        full_name: updatedUser.fullName,
        mobile_number: updatedUser.mobileNumber,
        updated_at: new Date().toISOString(),
      }).eq('email', newEmail);
    } catch {}

    broadcastUsersChange('user_updated', { userId, user: updatedUser });

    return { success: true, user: updatedUser };
  },

  async deleteUser(userId: string, emailHint?: string): Promise<{ success: boolean; error?: string }> {
    if (userId === 'admin_arventa_super' || (emailHint && emailHint.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase())) {
      return { success: false, error: 'Cannot delete the Super Administrator account.' };
    }

    const usersRecord = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});

    // Find all emails and IDs matching this user
    let targetEmail = (emailHint ? emailHint.toLowerCase().trim() : '');
    if (!targetEmail) {
      const matchKey = Object.keys(usersRecord).find((k) => {
        const u = usersRecord[k];
        if (!u) return false;
        if (u.id === userId || k.toLowerCase() === userId.toLowerCase() || u.email?.toLowerCase() === userId.toLowerCase()) {
          return true;
        }
        return false;
      });
      if (matchKey) {
        targetEmail = (usersRecord[matchKey]?.email || matchKey).toLowerCase().trim();
      }
    }

    const matchedUser = targetEmail ? usersRecord[targetEmail] : null;
    const targetUserId = matchedUser?.id || userId;

    // 1. Permanently register in deleted list (both email and user IDs)
    const deletedList = getDeletedIdentifiers();
    const toAdd = [targetEmail, userId, targetUserId].filter(Boolean).map((s) => s.toLowerCase().trim());
    let listChanged = false;
    for (const item of toAdd) {
      if (item && !deletedList.includes(item)) {
        deletedList.push(item);
        listChanged = true;
      }
    }
    if (listChanged) {
      setLocalStore(LOCAL_DELETED_USERS_KEY, deletedList);
    }

    // 2. Completely remove from users registry (by email, id, or key)
    Object.keys(usersRecord).forEach((k) => {
      const u = usersRecord[k];
      const kLow = k.toLowerCase().trim();
      const uEmailLow = u?.email ? u.email.toLowerCase().trim() : '';
      const uIdLow = u?.id ? u.id.toLowerCase().trim() : '';
      const userIdLow = userId.toLowerCase().trim();
      const targetUserIdLow = targetUserId.toLowerCase().trim();
      const targetEmailLow = targetEmail ? targetEmail.toLowerCase().trim() : '';

      if (
        kLow === userIdLow ||
        kLow === targetUserIdLow ||
        (targetEmailLow && kLow === targetEmailLow) ||
        uIdLow === userIdLow ||
        uIdLow === targetUserIdLow ||
        (targetEmailLow && uEmailLow === targetEmailLow) ||
        deletedList.includes(kLow) ||
        (uEmailLow && deletedList.includes(uEmailLow)) ||
        (uIdLow && deletedList.includes(uIdLow))
      ) {
        delete usersRecord[k];
      }
    });
    setLocalStore(LOCAL_USERS_KEY, usersRecord);

    // 3. Completely delete business settings
    const allSettings = getLocalStore<Record<string, any>>(LOCAL_SETTINGS_KEY, {});
    delete allSettings[userId];
    delete allSettings[targetUserId];
    Object.keys(allSettings).forEach((k) => {
      const s = allSettings[k];
      const sUserLow = (s?.userId || '').toLowerCase().trim();
      if (
        sUserLow === userId.toLowerCase().trim() ||
        sUserLow === targetUserId.toLowerCase().trim() ||
        (sUserLow && deletedList.includes(sUserLow))
      ) {
        delete allSettings[k];
      }
    });
    setLocalStore(LOCAL_SETTINGS_KEY, allSettings);

    // 4. Completely delete reviews
    const allReviews = getLocalStore<Record<string, any>>(LOCAL_REVIEWS_KEY, {});
    delete allReviews[userId];
    delete allReviews[targetUserId];
    Object.keys(allReviews).forEach((k) => {
      if (
        k.toLowerCase() === userId.toLowerCase() ||
        k.toLowerCase() === targetUserId.toLowerCase() ||
        deletedList.includes(k.toLowerCase())
      ) {
        delete allReviews[k];
      }
    });
    setLocalStore(LOCAL_REVIEWS_KEY, allReviews);

    // 5. Completely delete connected Google accounts
    const allGoogle = getLocalStore<Record<string, any>>(LOCAL_GOOGLE_KEY, {});
    delete allGoogle[userId];
    delete allGoogle[targetUserId];
    Object.keys(allGoogle).forEach((k) => {
      if (
        k.toLowerCase() === userId.toLowerCase() ||
        k.toLowerCase() === targetUserId.toLowerCase() ||
        deletedList.includes(k.toLowerCase())
      ) {
        delete allGoogle[k];
      }
    });
    setLocalStore(LOCAL_GOOGLE_KEY, allGoogle);

    // 6. Delete OTP records
    const otps = getLocalStore<Record<string, any>>(LOCAL_OTP_KEY, {});
    if (targetEmail) {
      delete otps[targetEmail];
    }
    Object.keys(otps).forEach((k) => {
      if (deletedList.includes(k.toLowerCase().trim())) {
        delete otps[k];
      }
    });
    setLocalStore(LOCAL_OTP_KEY, otps);

    // 7. Delete logo assets from local storage
    try {
      localStorage.removeItem(LOCAL_LOGO_KEY_PREFIX + userId);
      localStorage.removeItem(LOCAL_LOGO_KEY_PREFIX + targetUserId);
    } catch {}

    // 8. If the deleted user is currently logged in, terminate their active session
    const currentUser = getLocalStore<CustomerUser | null>(LOCAL_CURRENT_USER_KEY, null);
    if (
      currentUser &&
      (currentUser.id === userId ||
        currentUser.id === targetUserId ||
        (targetEmail && currentUser.email?.toLowerCase().trim() === targetEmail.toLowerCase().trim()) ||
        deletedList.includes(currentUser.id.toLowerCase().trim()) ||
        (currentUser.email && deletedList.includes(currentUser.email.toLowerCase().trim())))
    ) {
      localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
      localStorage.removeItem('rankora_token');
      localStorage.removeItem('reputepulse_token');
    }

    // 9. Permanent hard-delete and wipe from Supabase PostgreSQL tables
    try {
      if (targetEmail) {
        // Also update profile to mark deleted so it can never be retrieved even if RLS denies delete
        await supabase.from('profiles').update({
          full_name: '[DELETED_USER]',
          email: `deleted_${Date.now()}_${targetEmail.replace(/[^a-zA-Z0-9]/g, '')}@deleted.local`,
          mobile_number: '',
          updated_at: new Date().toISOString(),
        }).eq('email', targetEmail);

        await supabase.from('profiles').delete().eq('email', targetEmail);
      }
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.from('profiles').delete().eq('id', targetUserId);
    } catch (e) {
      console.warn('Supabase profile deletion notice:', e);
    }

    try {
      await supabase.from('business_settings').delete().or(`user_id.eq.${userId},user_id.eq.${targetUserId}`);
    } catch {}

    try {
      await supabase.from('customer_reviews').delete().or(`user_id.eq.${userId},user_id.eq.${targetUserId}`);
    } catch {}

    try {
      await supabase.from('google_accounts').delete().or(`user_id.eq.${userId},user_id.eq.${targetUserId}`);
    } catch {}

    try {
      await supabase.from('reviews').delete().or(`user_id.eq.${userId},user_id.eq.${targetUserId}`);
    } catch {}

    try {
      if (targetEmail) {
        await supabase.from('contact_inquiries').delete().eq('email', targetEmail);
      }
    } catch {}

    // 10. Broadcast realtime deletion to all open tabs and windows
    broadcastUsersChange('user_deleted', { userId, email: targetEmail, targetUserId });
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('rankora_realtime_sync');
        bc.postMessage({ type: 'user_deleted', userId, email: targetEmail, targetUserId, timestamp: Date.now() });
        bc.close();
      }
    } catch {}

    return { success: true };
  },

  async toggleSuspendUser(userId: string, targetEmailHint?: string): Promise<{ success: boolean; status?: 'active' | 'suspended'; error?: string }> {
    if (userId === 'admin_arventa_super' || (targetEmailHint && targetEmailHint.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase())) {
      return { success: false, error: 'Cannot suspend the Super Administrator account.' };
    }

    const usersRecord = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});

    // Flexible lookup: match by ID, targetEmailHint, or user's email field
    let targetKey = Object.keys(usersRecord).find((k) => {
      const u = usersRecord[k];
      if (!u) return false;
      if (u.id === userId) return true;
      if (targetEmailHint && (k.toLowerCase() === targetEmailHint.toLowerCase() || u.email?.toLowerCase() === targetEmailHint.toLowerCase())) {
        return true;
      }
      if (k.toLowerCase() === userId.toLowerCase() || u.email?.toLowerCase() === userId.toLowerCase()) {
        return true;
      }
      return false;
    });

    // Fallback: check REAL_INITIAL_USERS if not yet in usersRecord
    if (!targetKey) {
      const matchInitial = REAL_INITIAL_USERS.find(
        (entry) =>
          entry.user.id === userId ||
          (targetEmailHint && entry.user.email.toLowerCase() === targetEmailHint.toLowerCase()) ||
          entry.user.email.toLowerCase() === userId.toLowerCase()
      );
      if (matchInitial) {
        targetKey = matchInitial.user.email.toLowerCase();
        usersRecord[targetKey] = { ...matchInitial.user };
      }
    }

    if (!targetKey || !usersRecord[targetKey]) {
      return { success: false, error: 'User not found in system.' };
    }

    const currentStatus = usersRecord[targetKey].status || 'active';
    const newStatus: 'active' | 'suspended' = currentStatus === 'active' ? 'suspended' : 'active';
    usersRecord[targetKey].status = newStatus;
    setLocalStore(LOCAL_USERS_KEY, usersRecord);

    // Sync to Supabase profiles database table if present
    try {
      await supabase
        .from('profiles')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .or(`id.eq.${userId},email.eq.${targetKey}`);
    } catch (e) {
      console.warn('Supabase profile status update notice:', e);
    }

    // Sync to business_settings (both local and Supabase)
    const targetUserId = usersRecord[targetKey]?.id || userId;
    const allSettings = getLocalStore<Record<string, BusinessSettings>>(LOCAL_SETTINGS_KEY, {});
    let targetBizKey = Object.keys(allSettings).find((k) => {
      const b = allSettings[k];
      return b.userId === targetUserId || b.userId === userId || k === targetUserId || k === userId;
    });

    if (!targetBizKey) {
      // Find by custom slug or create
      targetBizKey = targetUserId;
    }

    if (allSettings[targetBizKey]) {
      allSettings[targetBizKey].isSuspended = newStatus === 'suspended';
      (allSettings[targetBizKey] as any).status = newStatus;
      if (newStatus === 'suspended') {
        allSettings[targetBizKey].autoReplyEnabled = false;
      }
      setLocalStore(LOCAL_SETTINGS_KEY, allSettings);
    }

    // Sync to Supabase business_settings table
    try {
      await supabase
        .from('business_settings')
        .update({
          google_account_info: {
            isSuspended: newStatus === 'suspended',
            status: newStatus,
            suspendedAt: newStatus === 'suspended' ? new Date().toISOString() : null,
          },
          auto_reply_enabled: newStatus === 'suspended' ? false : true,
          updated_at: new Date().toISOString(),
        })
        .or(`user_id.eq.${userId},user_id.eq.${targetUserId}`);
    } catch (e) {
      console.warn('Supabase business_settings suspension sync note:', e);
    }

    // Also update current active session if it matches target user
    const currentUser = getLocalStore<CustomerUser | null>(LOCAL_CURRENT_USER_KEY, null);
    if (
      currentUser &&
      (currentUser.id === userId ||
        currentUser.email.toLowerCase() === targetKey.toLowerCase() ||
        (targetEmailHint && currentUser.email.toLowerCase() === targetEmailHint.toLowerCase()))
    ) {
      currentUser.status = newStatus;
      setLocalStore(LOCAL_CURRENT_USER_KEY, currentUser);
    }

    broadcastUsersChange('user_status_changed', { userId, email: targetKey, status: newStatus });

    return { success: true, status: newStatus };
  },

  async createUser(data: {
    fullName: string;
    email: string;
    mobileNumber: string;
    businessName: string;
    password?: string;
    planId?: string;
  }): Promise<{ success: boolean; user?: CustomerUser; error?: string }> {
    const email = data.email.toLowerCase().trim();
    const usersRecord = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});

    if (usersRecord[email] || email === ADMIN_CREDENTIALS.email.toLowerCase()) {
      return { success: false, error: 'A user with this email address already exists.' };
    }

    const newId = 'usr_' + Math.random().toString(36).substring(2, 10);
    const newUser: CustomerUser = {
      id: newId,
      email,
      fullName: data.fullName,
      mobileNumber: data.mobileNumber,
      businessName: data.businessName,
      isVerified: true,
      role: 'user',
      status: 'active',
      planId: data.planId || 'pro-plan',
      createdAt: new Date().toISOString(),
    };

    usersRecord[email] = {
      ...newUser,
      password: data.password || 'password123',
    };
    setLocalStore(LOCAL_USERS_KEY, usersRecord);

    // Initialize business settings
    await this.initDefaultBusinessSettings(newId, data.businessName);

    // Attempt Supabase profiles sync
    try {
      await supabase.from('profiles').upsert({
        full_name: data.fullName,
        email,
        mobile_number: data.mobileNumber,
        created_at: newUser.createdAt,
        updated_at: new Date().toISOString(),
      });
    } catch {}

    broadcastUsersChange('user_created', { user: newUser });

    return { success: true, user: newUser };
  },

  // --------------------------------------------------------------------------
  // ADMIN IMPERSONATION
  // --------------------------------------------------------------------------
  async impersonateUser(targetUserId: string): Promise<{ success: boolean; user?: CustomerUser; error?: string }> {
    let adminUser = getLocalStore<CustomerUser | null>(LOCAL_CURRENT_USER_KEY, null);
    if (!adminUser) {
      adminUser = {
        id: 'admin_arventa_super',
        email: ADMIN_CREDENTIALS.email,
        fullName: ADMIN_CREDENTIALS.fullName,
        mobileNumber: ADMIN_CREDENTIALS.mobileNumber,
        role: 'admin',
        isVerified: true,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
    }

    const { users } = await this.getAllUsers();
    const target = users.find(
      (u) => u.id === targetUserId || u.email.toLowerCase() === targetUserId.toLowerCase()
    );
    if (!target) {
      return { success: false, error: 'Target user not found in registry.' };
    }

    // Save admin in impersonator key if not already saved
    const existingImpersonator = getLocalStore<CustomerUser | null>(LOCAL_IMPERSONATOR_KEY, null);
    if (!existingImpersonator) {
      setLocalStore(LOCAL_IMPERSONATOR_KEY, adminUser);
    }

    // Switch active session to target user
    setLocalStore(LOCAL_CURRENT_USER_KEY, target);
    const token = 'sb_impersonated_' + btoa(JSON.stringify({ userId: target.id, email: target.email }));
    localStorage.setItem('rankora_token', token);
    localStorage.removeItem('reputepulse_token');

    // Ensure business settings exist for this user so their store profile loads immediately
    await this.initDefaultBusinessSettings(
      target.id,
      target.businessName || `${target.fullName}'s Business`
    );

    return { success: true, user: target };
  },

  stopImpersonating(): { success: boolean; adminUser?: CustomerUser; error?: string } {
    let adminUser = getLocalStore<CustomerUser | null>(LOCAL_IMPERSONATOR_KEY, null);
    if (!adminUser) {
      adminUser = {
        id: 'admin_arventa_super',
        email: ADMIN_CREDENTIALS.email,
        fullName: ADMIN_CREDENTIALS.fullName,
        mobileNumber: ADMIN_CREDENTIALS.mobileNumber,
        role: 'admin',
        isVerified: true,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
    }

    // Restore admin session
    setLocalStore(LOCAL_CURRENT_USER_KEY, adminUser);
    localStorage.removeItem(LOCAL_IMPERSONATOR_KEY);
    const token = 'sb_admin_token_' + btoa(JSON.stringify({ userId: adminUser.id, email: adminUser.email, role: 'admin' }));
    localStorage.setItem('rankora_token', token);
    localStorage.removeItem('reputepulse_token');

    return { success: true, adminUser: adminUser || undefined };
  },

  getImpersonatorAdmin(): CustomerUser | null {
    return getLocalStore<CustomerUser | null>(LOCAL_IMPERSONATOR_KEY, null);
  },

  // --------------------------------------------------------------------------
  // PRICING PLANS MANAGEMENT
  // --------------------------------------------------------------------------
  getPricingPlans(): PricingPlan[] {
    const stored = getLocalStore<PricingPlan[] | null>(LOCAL_PLANS_KEY, null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      const hasUpdatedPrices = stored.some(
        (p) =>
          (p.id === 'pro-plan' && p.yearlyPrice === 599) ||
          (p.id === 'ultra-plan' && p.yearlyPrice === 1200)
      );
      if (hasUpdatedPrices) {
        return stored;
      }
    }
    setLocalStore(LOCAL_PLANS_KEY, DEFAULT_PRICING_PLANS);
    return DEFAULT_PRICING_PLANS;
  },

  savePricingPlan(plan: PricingPlan): { success: boolean; plans: PricingPlan[] } {
    const plans = this.getPricingPlans();
    const index = plans.findIndex((p) => p.id === plan.id);
    let updatedPlans: PricingPlan[];
    if (index >= 0) {
      updatedPlans = plans.map((p) => (p.id === plan.id ? plan : p));
    } else {
      updatedPlans = [...plans, plan];
    }
    setLocalStore(LOCAL_PLANS_KEY, updatedPlans);
    return { success: true, plans: updatedPlans };
  },

  deletePricingPlan(planId: string): { success: boolean; plans: PricingPlan[] } {
    const plans = this.getPricingPlans();
    const updatedPlans = plans.filter((p) => p.id !== planId);
    setLocalStore(LOCAL_PLANS_KEY, updatedPlans);
    return { success: true, plans: updatedPlans };
  },

  resetPricingPlans(): { success: boolean; plans: PricingPlan[] } {
    setLocalStore(LOCAL_PLANS_KEY, DEFAULT_PRICING_PLANS);
    return { success: true, plans: DEFAULT_PRICING_PLANS };
  },

  async activateUserPlan(planId: string, promoCode?: string): Promise<{ success: boolean; user?: CustomerUser; error?: string; message?: string }> {
    const me = this.getMe();
    if (!me.user) {
      return { success: false, error: 'User is not logged in.' };
    }

    const updatedUser: CustomerUser = {
      ...me.user,
      planId: planId,
    };

    setLocalStore(LOCAL_CURRENT_USER_KEY, updatedUser);

    if (updatedUser.email) {
      const users = getLocalStore<Record<string, any>>(LOCAL_USERS_KEY, {});
      if (users[updatedUser.email]) {
        users[updatedUser.email] = {
          ...users[updatedUser.email],
          planId: planId,
        };
        setLocalStore(LOCAL_USERS_KEY, users);
      }
    }

    return {
      success: true,
      user: updatedUser,
      message: 'Plan activated successfully!',
    };
  },
};
