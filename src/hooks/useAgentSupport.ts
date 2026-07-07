/**
 * useAgentSupport — Realtime agent ↔ member support channel.
 * ----------------------------------------------------------
 * Bidirectional support messages between a member (in /app) and an
 * agent (in /admin). Built on top of Supabase Realtime, so:
 *
 *   - The member's browser authenticates with the member's own JWT.
 *   - The agent's browser authenticates with the agent's own JWT.
 *   - RLS policies on `support_messages` ensure neither party can
 *     read other users' conversations, and members can only write to
 *     their own thread.
 *   - No Smartsupp *secret* key is involved — the public widget key
 *     goes only into the public site build (see services/smartsupp.ts).
 *
 * Table shape (run via supabase/schema.sql or the Supabase dashboard):
 *
 *   create table support_threads (
 *     id uuid primary key default gen_random_uuid(),
 *     member_id uuid references auth.users not null,
 *     agent_id uuid references auth.users,
 *     subject text,
 *     status text default 'open',      -- open | waiting | resolved
 *     last_message_at timestamptz default now(),
 *     created_at timestamptz default now()
 *   );
 *   create table support_messages (
 *     id uuid primary key default gen_random_uuid(),
 *     thread_id uuid references support_threads not null,
 *     sender_role text not null,        -- 'member' | 'agent' | 'system'
 *     sender_id uuid references auth.users,
 *     body text not null,
 *     created_at timestamptz default now()
 *   );
 *   alter table support_threads enable row level security;
 *   alter table support_messages enable row level security;
 *
 *   -- member can read/write their own thread + messages
 *   create policy threads_member_rw on support_threads
 *     for all to authenticated
 *     using (member_id = auth.uid()) with check (member_id = auth.uid());
 *   create policy messages_member_rw on support_messages
 *     for all to authenticated
 *     using (
 *       thread_id in (
 *         select id from support_threads where member_id = auth.uid()
 *       )
 *     )
 *     with check (
 *       thread_id in (
 *         select id from support_threads where member_id = auth.uid()
 *       )
 *     );
 *
 *   -- admin role can read/write everything
 *   create policy threads_agent_all on support_threads
 *     for all to authenticated
 *     using (
 *       exists (select 1 from auth.users where id = auth.uid() and raw_user_meta_data->>'role' = 'agent')
 *     );
 *   create policy messages_agent_all on support_messages
 *     for all to authenticated
 *     using (
 *       exists (select 1 from auth.users where id = auth.uid() and raw_user_meta_data->>'role' = 'agent')
 *     );
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/store';

export interface SupportMessage {
  id: string;
  thread_id: string;
  sender_role: 'member' | 'agent' | 'system';
  sender_id?: string | null;
  body: string;
  created_at: string;
}

export interface SupportThread {
  id: string;
  member_id: string;
  agent_id?: string | null;
  subject?: string | null;
  status: 'open' | 'waiting' | 'resolved';
  last_message_at: string;
  created_at: string;
}

interface AgentSupportOptions {
  /** When provided, use this thread instead of creating/looking up a new one. */
  threadId?: string;
  /** 'member' (default) or 'agent' — controls sender_role on outgoing messages. */
  role?: 'member' | 'agent';
}

export function useAgentSupport(opts: AgentSupportOptions = {}) {
  const role = opts.role ?? 'member';
  const user = useStore((s) => s.user);
  const admin = useStore((s) => s.admin);
  const [thread, setThread] = useState<SupportThread | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<any>(null);

  // Lazy-load the Supabase client — if it's not configured we
  // gracefully no-op (the in-app SupportButton's local AI / ticket
  // sub-views keep working).
  const getSupabase = useCallback(async () => {
    try {
      const mod = await import('@/lib/supabase');
      return mod.getSupabase();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = await getSupabase();
      if (!sb) return;
      if (role === 'member' && !user) return;
      if (role === 'agent' && !admin) return;

      // Resolve thread
      let threadRow: SupportThread | null = null;
      if (opts.threadId) {
        const { data } = await sb
          .from('support_threads')
          .select('*')
          .eq('id', opts.threadId)
          .maybeSingle();
        threadRow = data as SupportThread | null;
      } else if (role === 'member' && user) {
        const { data: existing } = await sb
          .from('support_threads')
          .select('*')
          .eq('member_id', user.id)
          .eq('status', 'open')
          .order('last_message_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (existing) {
          threadRow = existing as SupportThread;
        } else {
          const { data: created } = await sb
            .from('support_threads')
            .insert({ member_id: user.id, subject: 'Member support request' })
            .select()
            .single();
          threadRow = created as SupportThread | null;
        }
      }

      if (!threadRow || cancelled) return;
      setThread(threadRow);

      const { data: initial } = await sb
        .from('support_messages')
        .select('*')
        .eq('thread_id', threadRow.id)
        .order('created_at', { ascending: true });
      if (!cancelled) setMessages((initial ?? []) as SupportMessage[]);

      const channel = sb
        .channel(`support:${threadRow.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `thread_id=eq.${threadRow.id}` },
          (payload: any) => {
            setMessages((prev) =>
              prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new as SupportMessage]
            );
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') setConnected(true);
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setConnected(false);
        });
      channelRef.current = channel;
    })();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, admin?.id, opts.threadId, role]);

  const send = useCallback(
    async (body: string): Promise<SupportMessage | null> => {
      if (!thread || !body.trim()) return null;
      const sb = await getSupabase();
      if (!sb) return null;
      const senderId = role === 'agent' ? admin?.id : user?.id;
      const { data, error } = await sb
        .from('support_messages')
        .insert({
          thread_id: thread.id,
          sender_role: role,
          sender_id: senderId ?? null,
          body: body.trim(),
        })
        .select()
        .single();
      if (error) return null;
      await sb
        .from('support_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', thread.id);
      return data as SupportMessage;
    },
    [thread, role, user?.id, admin?.id, getSupabase]
  );

  return { thread, messages, send, connected, role };
}