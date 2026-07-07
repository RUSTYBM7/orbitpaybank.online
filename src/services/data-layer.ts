/**
 * src/services/data-layer.ts
 *
 * Member-portal data layer (mirrors admin-portal/src/lib/data-layer.ts).
 * Smart wrappers: real Supabase queries when env is set, local store fall-back
 * otherwise so the demo still works.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useStore } from '@/store';

export interface ApiEnvelope<T = unknown> {
  data: T;
  success: boolean;
  error: string | null;
}

export const ok = <T>(data: T): ApiEnvelope<T> => ({ data, success: true, error: null });
export const fail = <T = null>(message: string, data: T = null as T): ApiEnvelope<T> => ({
  data,
  success: false,
  error: message,
});

export { isSupabaseConfigured, supabase };

/** Run a Supabase query, wrapping the result in an ApiEnvelope. */
export async function runQuery<T>(
  queryFactory: () => PromiseLike<{ data: T | null; error: { message: string } | null }>,
  fallbackData: T,
): Promise<ApiEnvelope<T>> {
  if (!isSupabaseConfigured || !supabase) {
    return ok(fallbackData);
  }
  try {
    const { data, error } = await queryFactory();
    if (error) return fail<T>(error.message, fallbackData);
    return ok((data ?? fallbackData) as T);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return fail<T>(message, fallbackData);
  }
}

// =============================================================================
// Auth (uses Supabase Auth when configured, in-memory otherwise)
// =============================================================================

export const authApi = {
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured || !supabase) {
      // Demo fallback: any password works for the seeded demo user
      const { users, login } = useStore.getState();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? users[0];
      if (user) {
        login(user);
        return ok({ user, session: { access_token: 'demo-token', refresh_token: 'demo-refresh' } });
      }
      return fail('Demo user not found');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return fail(error.message);
    return ok({ user: data.user, session: data.session });
  },

  async signUp(email: string, password: string, fullName: string, phone?: string) {
    if (!isSupabaseConfigured || !supabase) {
      const { login, setUser, users } = useStore.getState();
      const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        login(existing);
        return ok({ user: existing, session: { access_token: 'demo-token', refresh_token: 'demo-refresh' } });
      }
      // Synthesize a demo user
      const newUser = {
        id: `u_${Date.now()}`,
        email,
        fullName,
        phone: phone ?? '',
        avatar: undefined,
        kycStatus: 'not_submitted' as const,
        accountStatus: 'pending' as const,
        tier: 'basic' as const,
        dailyLimit: 1000,
        weeklyLimit: 5000,
        monthlyLimit: 20000,
        balanceUsd: 0,
        balanceEur: 0,
        balanceGbp: 0,
        balanceBtc: 0,
        memberSince: new Date().toISOString(),
        role: 'member' as const,
      };
      setUser(newUser);
      login(newUser);
      return ok({ user: newUser, session: { access_token: 'demo-token', refresh_token: 'demo-refresh' } });
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) return fail(error.message);
    return ok({ user: data.user, session: data.session });
  },

  async signOut() {
    if (!isSupabaseConfigured || !supabase) {
      useStore.getState().logout();
      return ok(null);
    }
    const { error } = await supabase.auth.signOut();
    if (error) return fail(error.message);
    return ok(null);
  },

  async resetPassword(email: string) {
    if (!isSupabaseConfigured || !supabase) {
      return ok(null);
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return fail(error.message);
    return ok(null);
  },

  async getSession() {
    if (!isSupabaseConfigured || !supabase) {
      const { user } = useStore.getState();
      return ok({ user, session: user ? { access_token: 'demo-token' } : null });
    }
    const { data, error } = await supabase.auth.getSession();
    if (error) return fail(error.message);
    return ok(data);
  },
};

// =============================================================================
// User
// =============================================================================

export const userApi = {
  async getProfile() {
    if (!isSupabaseConfigured || !supabase) {
      return ok(useStore.getState().user);
    }
    return runQuery(async () => supabase!.from('members').select('*').eq('user_id', (await supabase!.auth.getUser()).data.user?.id ?? '').single(), null);
  },

  async updateProfile(patch: Record<string, unknown>) {
    if (!isSupabaseConfigured || !supabase) {
      const { user, setUser } = useStore.getState();
      if (user) setUser({ ...user, ...(patch as Partial<typeof user>) });
      return ok(user);
    }
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return fail('not authenticated');
    return runQuery(async () =>
      supabase!.from('members').update(patch).eq('user_id', authUser.id).select().single(),
    null);
  },

  async changePassword(oldPwd: string, newPwd: string) {
    if (!isSupabaseConfigured || !supabase) {
      return ok(null);
    }
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) return fail(error.message);
    return ok(null);
  },
};

// =============================================================================
// Accounts (member view: only their own)
// =============================================================================

export const accountApi = {
  async list() {
    if (!isSupabaseConfigured || !supabase) {
      return ok(useStore.getState().bankAccounts);
    }
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return ok([]);
    return runQuery(async () =>
      supabase!.from('accounts')
        .select('*, members!inner(*)')
        .eq('members.user_id', authUser.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
    []);
  },

  async getById(id: string) {
    if (!isSupabaseConfigured || !supabase) {
      return ok(useStore.getState().bankAccounts.find((a) => a.id === id) ?? null);
    }
    return runQuery(async () => supabase!.from('accounts').select('*').eq('id', id).single(), null);
  },

  async create(payload: Record<string, unknown>) {
    if (!isSupabaseConfigured || !supabase) {
      // Demo: add to in-memory store
      const { setBankAccounts, bankAccounts, addTransaction } = useStore.getState();
      const newAcc = {
        id: `acc_${Date.now()}`,
        userId: 'demo-user',
        type: (payload.type as 'checking' | 'savings') ?? 'checking',
        name: (payload.name as string) ?? 'New Account',
        accountNumber: `${Math.floor(Math.random() * 1e10)}`,
        routingNumber: '021000021',
        balance: 0,
        currency: (payload.currency as string) ?? 'USD',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPrimary: bankAccounts.length === 0,
        color: 'mint',
      };
      setBankAccounts([...bankAccounts, newAcc]);
      return ok(newAcc);
    }
    return runQuery(async () =>
      supabase!.from('accounts').insert(payload).select().single(),
    null);
  },
};

// =============================================================================
// Transactions
// =============================================================================

export const transactionApi = {
  async list(filters?: { limit?: number; accountId?: string; from?: string; to?: string }) {
    if (!isSupabaseConfigured || !supabase) {
      return ok(useStore.getState().transactions);
    }
    return runQuery(async () => {
      let q = supabase!.from('transactions').select('*').order('created_at', { ascending: false });
      if (filters?.limit) q = q.limit(filters.limit);
      if (filters?.accountId) q = q.eq('initiated_by', filters.accountId);
      if (filters?.from) q = q.gte('created_at', filters.from);
      if (filters?.to) q = q.lte('created_at', filters.to);
      return q;
    }, []);
  },

  async getById(id: string) {
    return runQuery(async () => supabase!.from('transactions').select('*').eq('id', id).single(), null);
  },

  async create(payload: Record<string, unknown>) {
    return runQuery(async () => supabase!.from('transactions').insert(payload).select().single(), null);
  },
};

// =============================================================================
// Transfers
// =============================================================================

export const transferApi = {
  async list() {
    return runQuery(async () => supabase!.from('transfers').select('*').order('created_at', { ascending: false }), []);
  },

  async create(payload: Record<string, unknown>) {
    return runQuery(async () => supabase!.from('transfers').insert(payload).select().single(), null);
  },

  async cancel(id: string) {
    return runQuery(async () => supabase!.from('transfers').update({ status: 'cancelled' }).eq('id', id), null);
  },
};

// =============================================================================
// Cards (member view)
// =============================================================================

export const cardsApi = {
  async list() {
    if (!isSupabaseConfigured || !supabase) {
      return ok(useStore.getState().cards);
    }
    return runQuery(async () => supabase!.from('cards').select('*').order('created_at', { ascending: false }), []);
  },

  async create(payload: Record<string, unknown>) {
    return runQuery(async () => supabase!.from('cards').insert(payload).select().single(), null);
  },

  async freeze(id: string) {
    return runQuery(async () => supabase!.from('cards').update({ status: 'frozen' }).eq('id', id), null);
  },

  async unfreeze(id: string) {
    return runQuery(async () => supabase!.from('cards').update({ status: 'active' }).eq('id', id), null);
  },

  async cancel(id: string) {
    return runQuery(async () => supabase!.from('cards').update({ status: 'blocked' }).eq('id', id), null);
  },

  async updateLimits(id: string, limits: { daily?: number; monthly?: number }) {
    return runQuery(async () => supabase!.from('cards').update(limits).eq('id', id), null);
  },
};

// =============================================================================
// Bill Pay
// =============================================================================

export const billPayApi = {
  async listBillers() {
    return runQuery(async () => supabase!.from('billers').select('*').eq('is_active', true).order('name'), []);
  },

  async listPayments() {
    if (!isSupabaseConfigured || !supabase) {
      return ok(useStore.getState().billPayments);
    }
    return runQuery(async () => supabase!.from('bill_payments').select('*').order('next_run_at'), []);
  },

  async schedule(payload: Record<string, unknown>) {
    return runQuery(async () => supabase!.from('bill_payments').insert(payload).select().single(), null);
  },

  async cancel(id: string) {
    return runQuery(async () => supabase!.from('bill_payments').update({ status: 'cancelled' }).eq('id', id), null);
  },
};

// =============================================================================
// Loans (member view)
// =============================================================================

export const loansApi = {
  async list() {
    if (!isSupabaseConfigured || !supabase) {
      return ok(useStore.getState().loans);
    }
    return runQuery(async () => supabase!.from('loans').select('*').order('created_at', { ascending: false }), []);
  },

  async apply(payload: Record<string, unknown>) {
    return runQuery(async () => supabase!.from('loans').insert({ ...payload, status: 'pending' }).select().single(), null);
  },

  async getPaymentSchedule(loanId: string) {
    return runQuery(async () => supabase!.from('loan_payments').select('*').eq('loan_id', loanId).order('due_date'), []);
  },
};

// =============================================================================
// Notifications (member inbox)
// =============================================================================

export const notificationApi = {
  async list() {
    if (!isSupabaseConfigured || !supabase) {
      return ok(useStore.getState().notifications);
    }
    return runQuery(async () => supabase!.from('notifications').select('*').order('created_at', { ascending: false }).limit(50), []);
  },

  async markRead(id: string) {
    return runQuery(async () => supabase!.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id), null);
  },

  async subscribe(onMessage: (n: unknown) => void) {
    if (!isSupabaseConfigured || !supabase) return () => {};
    const channel = supabase
      .channel('member-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        onMessage(payload.new);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },
};

// =============================================================================
// AI (keyword-matcher fallback; real LLM hook documented)
// =============================================================================

export const aiApi = {
  async ask(prompt: string) {
    // Currently a no-op: members don't have an AI assistant yet (the admin
    // portal's AIAssistant is admin-only). When wired, this would call an
    // /api/ai or Edge Function with the user's prompt + recent tx context.
    return ok({ reply: 'AI assistant is not yet enabled for member accounts.', prompt });
  },
};

// =============================================================================
// Currency (rates table; static fallback)
// =============================================================================

export const currencyApi = {
  async rates() {
    return ok([
      { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1, change: 0 },
      { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92, change: 0.15 },
      { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79, change: -0.08 },
      { code: 'BTC', name: 'Bitcoin', symbol: '₿', rate: 0.000015, change: 2.34 },
    ]);
  },
};

// =============================================================================
// Chat (in-app messaging with admin support)
// =============================================================================

export const chatApi = {
  async listRooms() {
    if (!isSupabaseConfigured || !supabase) {
      return ok(useStore.getState().chatRooms);
    }
    return runQuery(async () => supabase!.from('support_tickets').select('*').order('updated_at', { ascending: false }), []);
  },

  async listMessages(roomId: string) {
    if (!isSupabaseConfigured || !supabase) {
      return ok(useStore.getState().chatMessages.filter((m) => m.roomId === roomId));
    }
    return runQuery(async () => supabase!.from('support_ticket_messages').select('*').eq('ticket_id', roomId).order('created_at'), []);
  },

  async sendMessage(roomId: string, body: string) {
    if (!isSupabaseConfigured || !supabase) {
      const { addChatMessage, chatMessages } = useStore.getState();
      const newMsg = {
        id: `msg_${Date.now()}`,
        roomId,
        authorId: 'demo-user',
        authorName: 'You',
        body,
        timestamp: new Date().toISOString(),
        isAdmin: false,
      };
      addChatMessage(newMsg);
      return ok(newMsg);
    }
    return runQuery(async () =>
      supabase!.from('support_ticket_messages').insert({
        ticket_id: roomId,
        author_member_id: (await supabase!.auth.getUser()).data.user?.id,
        body,
      }).select().single(),
    null);
  },
};

// =============================================================================
// Banking / utility endpoints
// =============================================================================

export const bankingApi = {
  async getRoutingNumber() {
    return ok({ routingNumber: '021000021', bankName: 'OrbitPay Federal Credit Union' });
  },

  async validateRouting(routing: string) {
    // ABA routing checksum
    if (!/^\d{9}$/.test(routing)) return fail('Routing must be 9 digits');
    const digits = routing.split('').map(Number);
    const sum =
      3 * (digits[0] + digits[3] + digits[6]) +
      7 * (digits[1] + digits[4] + digits[7]) +
      1 * (digits[2] + digits[5] + digits[8]);
    return sum % 10 === 0 ? ok({ valid: true }) : fail('Invalid ABA checksum');
  },

  async getStatements(accountId: string) {
    return runQuery(async () =>
      supabase!.from('statements').select('*').eq('account_id', accountId).order('period_start', { ascending: false }),
    []);
  },
};