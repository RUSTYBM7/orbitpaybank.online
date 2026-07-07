/**
 * src/services/api/index.ts
 *
 * Member-portal API surface. Re-exports from data-layer.ts which calls real
 * Supabase queries when env is configured, and falls back to local Zustand
 * store reads otherwise.
 *
 * Public surface (authApi, userApi, accountApi, ...) is preserved for the
 * dozens of components that import these names.
 */

export {
  authApi,
  userApi,
  accountApi,
  transactionApi,
  transferApi,
  cardsApi,
  billPayApi,
  loansApi,
  notificationApi,
  aiApi,
  currencyApi,
  chatApi,
  bankingApi,
} from '@/services/data-layer';

// Legacy API types re-exported for components that import them
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Types referenced throughout the member portal
export type Currency = 'USD' | 'EUR' | 'GBP' | 'BTC';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  kycStatus: 'verified' | 'pending' | 'rejected' | 'not_submitted';
  accountStatus: 'active' | 'suspended' | 'frozen' | 'closed' | 'pending';
  balanceUSD: number;
  balanceEUR: number;
  balanceGBP: number;
  balanceBTC: number;
}

export interface Account {
  id: string;
  type: 'checking' | 'savings';
  name: string;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  currency: string;
  status: string;
  isPrimary: boolean;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  amount: number;
  currency: string;
  description: string;
  recipientName?: string;
  recipientAvatar?: string;
  status: 'completed' | 'pending' | 'failed' | 'flagged';
  category?: string;
  merchant?: string;
  createdAt: string;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId?: string;
  externalAccount?: {
    routingNumber: string;
    accountNumber: string;
    bankName: string;
    recipientName: string;
  };
  amount: number;
  currency: string;
  memo?: string;
  scheduledDate?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'support' | 'transaction' | 'general';
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
  timestamp: string;
  isAdmin: boolean;
}

// Stub helpers kept for components that still reference the legacy shape
let authToken: string | null = null;
let refreshToken: string | null = null;

export const setAuthTokens = (token: string, refresh: string) => {
  authToken = token;
  refreshToken = refresh;
};

export const clearAuthTokens = () => {
  authToken = null;
  refreshToken = null;
};

export const getAuthHeader = () =>
  authToken ? { Authorization: `Bearer ${authToken}` } : {};

/** Convenience: when the component just needs the current user. */
export const getCurrentUser = () => {
  // Lazy-load store to avoid circular imports
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useStore } = require('@/store') as typeof import('@/store');
  return useStore.getState().user;
};