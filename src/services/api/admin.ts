/**
 * Admin Portal API Service Layer
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface AdminStats {
  totalUsers: number;
  activeToday: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingKycs: number;
  flaggedTransactions: number;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'support_admin' | 'finance_admin' | 'viewer';
  permissions: string[];
  isOnline: boolean;
  lastLogin: string;
  avatar?: string;
}

export interface UserManagement {
  id: string;
  email: string;
  fullName: string;
  kycStatus: string;
  accountStatus: string;
  createdAt: string;
  lastActive: string;
  totalBalance: number;
}

// Auth — FIX-10: tokens held in memory only (not localStorage) until a real
// backend issues httpOnly cookies. The previous code persisted the admin token
// to localStorage, which is XSS-prone: any injected script could steal the
// session. Until FIX-11 ships a backend, the admin will need to re-login
// after every page reload. This is acceptable for the demo and far safer.
let adminToken: string | null = null;

export const setAdminToken = (token: string) => {
  adminToken = token;
};

export const clearAdminToken = () => {
  adminToken = null;
};

export const getAdminHeader = () => {
  return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
};

async function adminClient<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string }> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAdminHeader(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Request failed' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Admin API Error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Admin Auth
export const adminAuthApi = {
  login: (email: string, password: string, totp?: string) =>
    adminClient<{ admin: AdminUser; token: string }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, totp }),
    }),

  verify2fa: (code: string) =>
    adminClient<{ admin: AdminUser; token: string }>('/admin/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  logout: () => adminClient('/admin/auth/logout', { method: 'POST' }),
};

// Dashboard
export const dashboardApi = {
  getStats: () => adminClient<AdminStats>('/admin/dashboard/stats'),

  getRecentActivity: (limit?: number) =>
    adminClient<{ activities: Activity[] }>(`/admin/dashboard/activity?limit=${limit || 10}`),

  getCharts: (period: 'day' | 'week' | 'month') =>
    adminClient<{ transactions: ChartData[]; users: ChartData[] }>(`/admin/dashboard/charts?period=${period}`),
};

// Users Management
export const usersApi = {
  getAll: (params?: { search?: string; status?: string; kyc?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return adminClient<{ users: UserManagement[]; total: number; page: number }>(`/admin/users${query ? `?${query}` : ''}`);
  },

  getUser: (id: string) => adminClient<UserManagement>(`/admin/users/${id}`),

  updateStatus: (id: string, status: string, reason?: string) =>
    adminClient(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    }),

  updateKyc: (id: string, status: 'approved' | 'rejected', reason?: string) =>
    adminClient(`/admin/users/${id}/kyc`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    }),

  freezeAccount: (id: string, reason: string) =>
    adminClient(`/admin/users/${id}/freeze`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  unfreezeAccount: (id: string) =>
    adminClient(`/admin/users/${id}/unfreeze`, { method: 'POST' }),
};

// KYC Management
export const kycApi = {
  getQueue: (status?: 'pending' | 'approved' | 'rejected') => {
    const query = status ? `?status=${status}` : '';
    return adminClient<{ documents: KycDocument[] }>(`/admin/kyc${query}`);
  },

  review: (id: string, decision: 'approved' | 'rejected', notes?: string) =>
    adminClient(`/admin/kyc/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    }),

  getUserDocuments: (userId: string) =>
    adminClient<{ documents: KycDocument[] }>(`/admin/kyc/user/${userId}`),
};

// Transactions
export const transactionsApi = {
  getAll: (params?: { status?: string; type?: string; userId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return adminClient<{ transactions: Transaction[]; total: number }>(`/admin/transactions${query ? `?${query}` : ''}`);
  },

  getTransaction: (id: string) => adminClient<Transaction>(`/admin/transactions/${id}`),

  flagTransaction: (id: string, reason: string) =>
    adminClient(`/admin/transactions/${id}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  unflagTransaction: (id: string) =>
    adminClient(`/admin/transactions/${id}/unflag`, { method: 'POST' }),

  reverseTransaction: (id: string, reason: string) =>
    adminClient(`/admin/transactions/${id}/reverse`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// Chat / Support
export const chatSupportApi = {
  getRooms: () => adminClient<{ rooms: ChatRoom[] }>('/admin/chat/rooms'),

  getMessages: (roomId: string) =>
    adminClient<{ messages: Message[] }>(`/admin/chat/rooms/${roomId}/messages`),

  sendMessage: (roomId: string, content: string) =>
    adminClient(`/admin/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  resolveRoom: (roomId: string) =>
    adminClient(`/admin/chat/rooms/${roomId}/resolve`, { method: 'POST' }),
};

// Staff Management
export const staffApi = {
  getAll: () => adminClient<{ staff: AdminUser[] }>('/admin/staff'),

  create: (data: { email: string; fullName: string; role: string }) =>
    adminClient<{ staff: AdminUser }>('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<AdminUser>) =>
    adminClient<{ staff: AdminUser }>(`/admin/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) => adminClient(`/admin/staff/${id}`, { method: 'DELETE' }),
};

// Audit Logs
export const auditApi = {
  getLogs: (params?: { adminId?: string; action?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return adminClient<{ logs: AuditLog[]; total: number }>(`/admin/audit${query ? `?${query}` : ''}`);
  },
};

// Config
export const configApi = {
  get: () => adminClient<{ config: Record<string, unknown> }>('/admin/config'),

  update: (key: string, value: unknown) =>
    adminClient(`/admin/config/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),
};

// Helper types
interface Activity {
  id: string;
  type: string;
  description: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

interface ChartData {
  date: string;
  value: number;
}

interface KycDocument {
  id: string;
  userId: string;
  userName: string;
  docType: string;
  url: string;
  status: string;
  uploadedAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  status: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderType: 'user' | 'admin';
  senderName: string;
  content: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  createdAt: string;
}

export default {
  auth: adminAuthApi,
  dashboard: dashboardApi,
  users: usersApi,
  kyc: kycApi,
  transactions: transactionsApi,
  chat: chatSupportApi,
  staff: staffApi,
  audit: auditApi,
  config: configApi,
};
