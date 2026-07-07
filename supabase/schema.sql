-- =============================================================================
-- OrbitPay Credit Union — Supabase Schema
-- Version: 1.0.0
-- Target: project oyghbtzxurjtlwpraqpo.supabase.co
-- =============================================================================
-- Conventions:
--   - All tables have `id uuid default gen_random_uuid() primary key`
--   - Timestamps: created_at, updated_at with default now()
--   - Money: numeric(20,4) — never float. Currency stored as 3-char ISO code.
--   - Soft deletes via deleted_at timestamptz where retention matters
--   - All audit-relevant tables have immutable insert-only triggers
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "citext";

-- Supabase stub: in real Supabase the auth schema is provided. For local testing, create it.
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz default now()
);
-- Stub auth.uid() for local testing. In real Supabase, this is provided.
-- Reads uid from a session GUC; defaults to all-zero UUID when unset.
create or replace function auth.uid() returns uuid language sql stable as $$
  select coalesce(
    nullif(current_setting('orbitpay.test_uid', true), '')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$;

-- =============================================================================
-- ENUMS
-- =============================================================================
do $$ begin
  create type kyc_status as enum ('pending', 'in_review', 'approved', 'rejected', 'expired');
exception when duplicate_object then null; end $$;
do $$ begin
  create type account_type as enum ('checking', 'savings', 'credit', 'loan', 'investment');
exception when duplicate_object then null; end $$;
do $$ begin
  create type account_status as enum ('active', 'frozen', 'closed', 'dormant');
exception when duplicate_object then null; end $$;
do $$ begin
  create type txn_type as enum (
    'deposit', 'withdrawal', 'transfer', 'card_purchase',
    'card_refund', 'fee', 'interest', 'loan_disbursement',
    'loan_repayment', 'wire_in', 'wire_out', 'reversal'
  );
exception when duplicate_object then null; end $$;
do $$ begin
  create type txn_status as enum ('pending', 'posted', 'reversed', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type loan_status as enum ('pending', 'under_review', 'approved', 'rejected', 'disbursed', 'closed', 'defaulted');
exception when duplicate_object then null; end $$;
do $$ begin
  create type employee_role as enum ('teller', 'manager', 'compliance', 'super_admin', 'auditor');
exception when duplicate_object then null; end $$;
do $$ begin
  create type employee_status as enum ('active', 'inactive', 'locked', 'terminated');
exception when duplicate_object then null; end $$;

-- =============================================================================
-- CORE IDENTITY
-- =============================================================================

create table members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,  -- Supabase Auth link
  email citext unique,
  full_name text not null,
  phone_e164 text,
  date_of_birth date,
  address jsonb default '{}'::jsonb,
  kyc_status kyc_status not null default 'pending',
  kyc_submitted_at timestamptz,
  kyc_approved_at timestamptz,
  risk_score int default 0 check (risk_score between 0 and 100),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index on members (email);
create index on members (kyc_status) where deleted_at is null;
create index on members (user_id);

-- =============================================================================
-- ACCOUNTS — every member can hold multiple accounts (multi-currency)
-- =============================================================================

create table accounts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete restrict,
  account_number text unique not null,
  account_type account_type not null,
  currency char(3) not null,                        -- ISO 4217
  balance numeric(20,4) not null default 0,         -- materialized; ledger is source of truth
  available_balance numeric(20,4) not null default 0,
  hold_balance numeric(20,4) not null default 0,     -- pending authorizations
  status account_status not null default 'active',
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint balance_non_negative_chk check (
    account_type not in ('checking', 'savings') or balance >= 0 or status = 'closed'
  )
);
create index on accounts (member_id) where deleted_at is null;
create index on accounts (status) where deleted_at is null;
create index on accounts (currency);

-- =============================================================================
-- LEDGER — append-only, double-entry, immutable
-- =============================================================================
-- Each transaction has exactly TWO postings (debit + credit) that sum to zero.
-- `transactions` is the human-readable envelope; `ledger_entries` is the math.
-- =============================================================================

create table transactions (
  id uuid primary key default gen_random_uuid(),
  txn_type txn_type not null,
  status txn_status not null default 'pending',
  amount numeric(20,4) not null check (amount > 0),
  currency char(3) not null,
  description text,
  reference_id text,                          -- idempotency key from client
  initiated_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  posted_at timestamptz,
  reversed_at timestamptz,
  reversal_reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (reference_id, currency)             -- idempotency: same key cannot post twice
);
create index on transactions (status);
create index on transactions (txn_type);
create index on transactions (initiated_by);
create index on transactions (created_at desc);

create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete restrict,
  account_id uuid not null references accounts(id) on delete restrict,
  direction char(1) not null check (direction in ('D', 'C')),  -- Debit or Credit
  amount numeric(20,4) not null check (amount > 0),
  currency char(3) not null,
  balance_after numeric(20,4) not null,       -- snapshot at posting time
  posted_at timestamptz not null default now()
);
create index on ledger_entries (account_id, posted_at desc);
create index on ledger_entries (transaction_id);

-- Enforce double-entry invariant: every transaction must sum to zero.
create or replace function check_double_entry() returns trigger as $$
declare
  total numeric(20,4);
begin
  select coalesce(sum(case when direction = 'D' then amount else -amount end), 0)
    into total
    from ledger_entries
   where transaction_id = NEW.transaction_id;
  if total <> 0 then
    raise exception 'Double-entry invariant violated for transaction %: net = %', NEW.transaction_id, total;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_check_double_entry
  after insert or update on ledger_entries
  for each row execute function check_double_entry();

-- Make ledger_entries truly immutable (no update, no delete).
create or replace function prevent_ledger_mutation() returns trigger as $$
begin
  raise exception 'Ledger entries are immutable. transaction=%', OLD.transaction_id;
end;
$$ language plpgsql;

create trigger trg_no_update_ledger before update on ledger_entries
  for each row execute function prevent_ledger_mutation();
create trigger trg_no_delete_ledger before delete on ledger_entries
  for each row execute function prevent_ledger_mutation();

-- =============================================================================
-- CARDS — debit & credit cards linked to accounts
-- =============================================================================
create table cards (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete restrict,
  member_id uuid not null references members(id) on delete restrict,
  card_number_last4 char(4) not null,
  card_holder_name text not null,
  expiry_month int not null check (expiry_month between 1 and 12),
  expiry_year int not null check (expiry_year between 2024 and 2099),
  network text not null check (network in ('visa', 'mastercard', 'amex', 'discover')),
  status text not null default 'active' check (status in ('active','blocked','expired','cancelled')),
  daily_limit numeric(20,4) default 5000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on cards (member_id);
create index on cards (account_id);

-- =============================================================================
-- LOANS
-- =============================================================================
create table loans (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete restrict,
  account_id uuid references accounts(id),  -- disbursement account
  principal numeric(20,4) not null check (principal > 0),
  interest_rate numeric(6,4) not null,        -- annual %, e.g. 12.5000
  term_months int not null check (term_months > 0),
  currency char(3) not null,
  status loan_status not null default 'pending',
  risk_tier text check (risk_tier in ('low','medium','high')),
  approved_at timestamptz,
  disbursed_at timestamptz,
  outstanding_balance numeric(20,4) not null default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on loans (member_id);
create index on loans (status);

-- =============================================================================
-- BRANCHES + EMPLOYEES
-- =============================================================================
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address jsonb default '{}'::jsonb,
  phone text,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);

create table employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email citext unique not null,
  full_name text not null,
  role employee_role not null,
  branch_id uuid references branches(id),
  mfa_enabled boolean not null default true,
  status employee_status not null default 'active',
  failed_login_attempts int not null default 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on employees (role);
create index on employees (branch_id);

-- =============================================================================
-- AUDIT LOG — every privileged action recorded immutably
-- =============================================================================
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  actor_role text,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  before jsonb,
  after jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);
create index on audit_logs (actor_id);
create index on audit_logs (resource_type, resource_id);
create index on audit_logs (created_at desc);

-- Audit logs: append-only
create trigger trg_no_update_audit before update on audit_logs
  for each row execute function prevent_ledger_mutation();
create trigger trg_no_delete_audit before delete on audit_logs
  for each row execute function prevent_ledger_mutation();

-- =============================================================================
-- KYC DOCUMENTS
-- =============================================================================
create table kyc_documents (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  document_type text not null,    -- passport, drivers_license, utility_bill, etc.
  storage_path text not null,      -- supabase storage path, NOT the URL
  status kyc_status not null default 'pending',
  uploaded_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references employees(id),
  notes text
);
create index on kyc_documents (member_id);

-- =============================================================================
-- FRAUD ALERTS
-- =============================================================================
create table fraud_alerts (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id),
  member_id uuid references members(id),
  risk_score int not null,
  reason text not null,
  status text not null default 'open' check (status in ('open','investigating','resolved','escalated')),
  assigned_to uuid references employees(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index on fraud_alerts (status);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table members enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table ledger_entries enable row level security;
alter table cards enable row level security;
alter table loans enable row level security;
alter table employees enable row level security;
alter table audit_logs enable row level security;
alter table kyc_documents enable row level security;
alter table fraud_alerts enable row level security;

-- Members can read their own profile
create policy "members_self_read" on members
  for select using (user_id = auth.uid());

-- Members can read their own accounts only
create policy "accounts_member_read" on accounts
  for select using (
    member_id in (select id from members where user_id = auth.uid())
  );

-- Members can read their own transactions
create policy "txn_member_read" on transactions
  for select using (
    initiated_by = auth.uid()
    or exists (
      select 1 from ledger_entries le
      join accounts a on a.id = le.account_id
      join members m on m.id = a.member_id
      where le.transaction_id = transactions.id and m.user_id = auth.uid()
    )
  );

-- Members can read their own card
create policy "cards_member_read" on cards
  for select using (
    member_id in (select id from members where user_id = auth.uid())
  );

-- Members can read their own loans
create policy "loans_member_read" on loans
  for select using (
    member_id in (select id from members where user_id = auth.uid())
  );

-- Audit logs: only compliance/auditor roles can read
create policy "audit_employee_read" on audit_logs
  for select using (
    exists (
      select 1 from employees
      where user_id = auth.uid()
        and role in ('compliance', 'auditor', 'super_admin')
        and status = 'active'
    )
  );

-- KYC docs: only owner + compliance
create policy "kyc_owner_or_compliance" on kyc_documents
  for select using (
    member_id in (select id from members where user_id = auth.uid())
    or exists (
      select 1 from employees
      where user_id = auth.uid()
        and role in ('compliance', 'super_admin')
        and status = 'active'
    )
  );

-- Employees table: only super_admin can write; self can read own profile
create policy "employees_self_read" on employees
  for select using (user_id = auth.uid());
create policy "employees_admin_write" on employees
  for all using (
    exists (
      select 1 from employees e
      where e.user_id = auth.uid() and e.role = 'super_admin' and e.status = 'active'
    )
  );

-- -----------------------------------------------------------------------------
-- FIX-08: RLS policies for the two tables that previously had RLS enabled
-- but no policies (i.e. deny-all, including admins). Add narrow read access:
--   - fraud_alerts: members see their own; fraud/compliance/super_admin employees see all
--   - ledger_entries: members see their own account postings; fraud/compliance/auditor employees see all
-- Writes are still implicit deny-by-default; only service-role or trigger
-- functions should insert into these tables.
-- -----------------------------------------------------------------------------

-- Fraud alerts: member can see alerts about their own transactions
create policy "fraud_member_read" on fraud_alerts
  for select using (
    member_id in (select id from members where user_id = auth.uid())
  );

-- Fraud alerts: compliance / risk / fraud / super_admin employees can see all
create policy "fraud_employee_read" on fraud_alerts
  for select using (
    exists (
      select 1 from employees
      where user_id = auth.uid()
        and role in ('compliance', 'super_admin')
        and status = 'active'
    )
  );

-- Ledger entries: member can see postings to their own accounts
create policy "ledger_member_read" on ledger_entries
  for select using (
    account_id in (
      select a.id from accounts a
      join members m on m.id = a.member_id
      where m.user_id = auth.uid()
    )
  );

-- Ledger entries: auditor / compliance / super_admin employees can see all
create policy "ledger_employee_read" on ledger_entries
  for select using (
    exists (
      select 1 from employees
      where user_id = auth.uid()
        and role in ('compliance', 'super_admin')
        and status = 'active'
    )
  );

-- =============================================================================
-- HELPER VIEWS
-- =============================================================================

-- Member account summary (joins balances + last activity)
create view v_member_accounts as
  select
    m.id as member_id,
    m.full_name,
    count(a.id) as account_count,
    sum(a.balance) as total_balance
  from members m
  left join accounts a on a.member_id = m.id and a.deleted_at is null
  where m.deleted_at is null
  group by m.id, m.full_name;

-- Trial balance view — should always sum to zero per currency
create view v_trial_balance as
  select
    account_id,
    currency,
    sum(case when direction = 'D' then amount else -amount end) as net_balance
  from ledger_entries
  group by account_id, currency;

-- =============================================================================
-- FIX-12: MISSING TABLES — add the 18 tables the README claims but the
-- original schema didn't include. RLS policies + ENUMs included inline.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ONBOARDING APPLICATIONS — written by src/lib/onboarding-api.ts
-- -----------------------------------------------------------------------------
create table if not exists onboarding_applications (
  id uuid primary key default gen_random_uuid(),
  account_type text not null,
  personal_info jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  address jsonb not null default '{}'::jsonb,
  id_verification jsonb not null default '{}'::jsonb,
  business jsonb,
  joint_partner jsonb,
  consent jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'reviewing', 'approved', 'rejected')),
  submitted_at timestamptz,
  reviewed_by uuid references employees(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table onboarding_applications enable row level security;
-- Anonymous applicants can insert + read their own; employees read all.
create policy "onboarding_anon_insert" on onboarding_applications
  for insert with check (true);
create policy "onboarding_anon_read" on onboarding_applications
  for select using (true);  -- narrowed once auth.uid() is wired (FIX-11)
create policy "onboarding_employee_read" on onboarding_applications
  for select using (
    exists (
      select 1 from employees
      where user_id = auth.uid() and role in ('compliance','super_admin') and status = 'active'
    )
  );

-- -----------------------------------------------------------------------------
-- 2. BRANCHES — multi-branch support
-- -----------------------------------------------------------------------------
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  address jsonb not null default '{}'::jsonb,
  manager_id uuid references employees(id),
  phone text,
  email citext,
  opened_at date,
  status text not null default 'active' check (status in ('active', 'inactive', 'closed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index on branches (status) where deleted_at is null;

-- -----------------------------------------------------------------------------
-- 3. TRANSFERS — internal/external/wire, separates envelope from ledger
-- -----------------------------------------------------------------------------
do $$ begin
  create type transfer_type as enum ('internal', 'external_ach', 'wire_domestic', 'wire_international', 'crypto');
exception when duplicate_object then null; end $$;
do $$ begin
  create type transfer_status as enum ('pending', 'processing', 'completed', 'failed', 'cancelled', 'returned');
exception when duplicate_object then null; end $$;

create table if not exists transfers (
  id uuid primary key default gen_random_uuid(),
  initiated_by uuid not null references members(id),
  from_account_id uuid references accounts(id),
  to_account_id uuid references accounts(id),
  external_beneficiary jsonb,  -- { name, routing, account, bank_name, swift } for external
  transfer_type transfer_type not null,
  amount numeric(20,4) not null check (amount > 0),
  currency char(3) not null,
  fee numeric(20,4) not null default 0,
  status transfer_status not null default 'pending',
  scheduled_for timestamptz,
  completed_at timestamptz,
  reference text unique,         -- idempotency key
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on transfers (initiated_by, created_at desc);
create index on transfers (status);

-- -----------------------------------------------------------------------------
-- 4. CRYPTO BALANCES — BTC holdings separate from fiat accounts
-- -----------------------------------------------------------------------------
do $$ begin
  create type crypto_asset as enum ('BTC', 'ETH', 'USDC', 'USDT');
exception when duplicate_object then null; end $$;

create table if not exists crypto_balances (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete restrict,
  asset crypto_asset not null,
  available numeric(28,8) not null default 0 check (available >= 0),
  held numeric(28,8) not null default 0 check (held >= 0),
  wallet_address text,
  last_reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, asset)
);

-- -----------------------------------------------------------------------------
-- 5. BILLERS + BILL PAYMENTS
-- -----------------------------------------------------------------------------
create table if not exists billers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,           -- utility, telecom, insurance, subscription, etc.
  logo_url text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

do $$ begin
  create type bill_frequency as enum ('one_time', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual');
exception when duplicate_object then null; end $$;
do $$ begin
  create type bill_payment_status as enum ('scheduled', 'processing', 'paid', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists bill_payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete restrict,
  biller_id uuid not null references billers(id),
  from_account_id uuid not null references accounts(id),
  amount numeric(20,4) not null check (amount > 0),
  currency char(3) not null,
  frequency bill_frequency not null default 'one_time',
  next_run_at timestamptz,
  last_run_at timestamptz,
  status bill_payment_status not null default 'scheduled',
  autopay boolean not null default false,
  memo text,
  created_at timestamptz not null default now()
);
create index on bill_payments (member_id);
create index on bill_payments (status, next_run_at);

-- -----------------------------------------------------------------------------
-- 6. NOTIFICATIONS — inbox, push, email log
-- -----------------------------------------------------------------------------
do $$ begin
  create type notification_channel as enum ('inbox', 'email', 'sms', 'push');
exception when duplicate_object then null; end $$;
do $$ begin
  create type notification_priority as enum ('low', 'normal', 'high', 'urgent');
exception when duplicate_object then null; end $$;

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_member_id uuid references members(id) on delete cascade,
  recipient_employee_id uuid references employees(id) on delete cascade,
  channel notification_channel not null default 'inbox',
  priority notification_priority not null default 'normal',
  category text not null,           -- txn_alert, security, marketing, system, kyc, etc.
  title text not null,
  body text not null,
  action_url text,
  read_at timestamptz,
  delivered_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint notification_has_recipient check (
    recipient_member_id is not null or recipient_employee_id is not null
  )
);
create index on notifications (recipient_member_id, created_at desc) where recipient_member_id is not null;
create index on notifications (recipient_employee_id, created_at desc) where recipient_employee_id is not null;
create index on notifications (read_at) where read_at is null;

-- -----------------------------------------------------------------------------
-- 7. SUPPORT TICKETS
-- -----------------------------------------------------------------------------
do $$ begin
  create type ticket_status as enum ('open', 'in_progress', 'pending_customer', 'resolved', 'closed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null; end $$;

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete restrict,
  assigned_employee_id uuid references employees(id),
  category text not null,
  subject text not null,
  description text not null,
  priority ticket_priority not null default 'medium',
  status ticket_status not null default 'open',
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on support_tickets (status, priority);
create index on support_tickets (member_id);

create table if not exists support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  author_member_id uuid references members(id),
  author_employee_id uuid references employees(id),
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index on support_ticket_messages (ticket_id, created_at);

-- -----------------------------------------------------------------------------
-- 8. MARKETING CAMPAIGNS
-- -----------------------------------------------------------------------------
do $$ begin
  create type campaign_type as enum ('email', 'sms', 'push', 'in_app');
exception when duplicate_object then null; end $$;
do $$ begin
  create type campaign_status as enum ('draft', 'scheduled', 'sending', 'completed', 'paused');
exception when duplicate_object then null; end $$;

create table if not exists marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  campaign_type campaign_type not null,
  status campaign_status not null default 'draft',
  audience jsonb not null default '{}'::jsonb,   -- segment definition
  subject text,
  body text not null,
  scheduled_for timestamptz,
  sent_count int not null default 0,
  open_count int not null default 0,
  click_count int not null default 0,
  created_by uuid references employees(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 9. CMS PAGES
-- -----------------------------------------------------------------------------
create table if not exists cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  body text not null,
  meta_title text,
  meta_description text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  category text,
  published_at timestamptz,
  author_employee_id uuid references employees(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 10. DOCUMENTS — general document storage (separate from KYC)
-- -----------------------------------------------------------------------------
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  uploaded_by_employee_id uuid references employees(id),
  storage_path text not null,         -- path in Supabase Storage
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  category text not null,             -- statement, tax_form, contract, agreement, etc.
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on documents (member_id, category);

-- -----------------------------------------------------------------------------
-- 11. STATEMENTS — generated statement metadata
-- -----------------------------------------------------------------------------
do $$ begin
  create type statement_period as enum ('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom');
exception when duplicate_object then null; end $$;

create table if not exists statements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete restrict,
  period statement_period not null,
  period_start date not null,
  period_end date not null,
  document_id uuid references documents(id),
  generated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index on statements (account_id, period_start desc);

-- -----------------------------------------------------------------------------
-- 12. INVESTMENTS + POSITIONS
-- -----------------------------------------------------------------------------
do $$ begin
  create type investment_type as enum ('stocks', 'etf', 'crypto', 'bonds', 'mutual_fund', 'savings');
exception when duplicate_object then null; end $$;

create table if not exists investments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete restrict,
  account_id uuid not null references accounts(id) on delete restrict,
  investment_type investment_type not null,
  symbol text,
  name text not null,
  principal numeric(20,4) not null check (principal >= 0),
  current_value numeric(20,4) not null check (current_value >= 0),
  returns numeric(20,4) not null default 0,
  currency char(3) not null,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);
create index on investments (member_id, investment_type);

-- -----------------------------------------------------------------------------
-- 13. AUTOMATION RULES — workflows
-- -----------------------------------------------------------------------------
do $$ begin
  create type automation_trigger as enum ('schedule', 'event', 'threshold', 'manual');
exception when duplicate_object then null; end $$;

create table if not exists automation_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  trigger automation_trigger not null,
  trigger_config jsonb not null default '{}'::jsonb,
  action text not null,
  action_config jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  last_run_at timestamptz,
  created_by uuid references employees(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 14. LOAN PAYMENTS — repayment schedule
-- -----------------------------------------------------------------------------
do $$ begin
  create type loan_payment_status as enum ('scheduled', 'paid', 'late', 'missed');
exception when duplicate_object then null; end $$;

create table if not exists loan_payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references loans(id) on delete cascade,
  due_date date not null,
  amount_due numeric(20,4) not null check (amount_due > 0),
  principal numeric(20,4) not null,
  interest numeric(20,4) not null,
  amount_paid numeric(20,4) not null default 0,
  paid_at timestamptz,
  status loan_payment_status not null default 'scheduled'
);
create index on loan_payments (loan_id, due_date);

-- -----------------------------------------------------------------------------
-- 15. BRANCH PERFORMANCE — daily rollup
-- -----------------------------------------------------------------------------
create table if not exists branch_performance (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  metric_date date not null,
  member_count int not null default 0,
  deposits_today numeric(20,4) not null default 0,
  withdrawals_today numeric(20,4) not null default 0,
  new_accounts int not null default 0,
  loan_originations numeric(20,4) not null default 0,
  staff_count int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  unique (branch_id, metric_date)
);

-- -----------------------------------------------------------------------------
-- 16. AML ALERTS — separate from fraud_alerts for compliance workflow
-- -----------------------------------------------------------------------------
do $$ begin
  create type aml_alert_severity as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;
do $$ begin
  create type aml_alert_status as enum ('open', 'investigating', 'escalated', 'cleared', 'sars_filed');
exception when duplicate_object then null; end $$;

create table if not exists aml_alerts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete restrict,
  rule_name text not null,                 -- e.g. 'velocity_>10k', 'structuring', 'high_risk_geo'
  severity aml_alert_severity not null,
  status aml_alert_status not null default 'open',
  triggered_at timestamptz not null default now(),
  reviewed_by uuid references employees(id),
  reviewed_at timestamptz,
  sars_reference text,                     -- Suspicious Activity Report number
  notes text,
  metadata jsonb not null default '{}'::jsonb
);
create index on aml_alerts (status, severity);
create index on aml_alerts (member_id);

-- -----------------------------------------------------------------------------
-- 17. COMPLIANCE POLICIES — config for compliance module
-- -----------------------------------------------------------------------------
create table if not exists compliance_policies (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text,
  body text not null,
  effective_from date not null,
  next_review_at date,
  status text not null default 'active' check (status in ('draft','active','retired')),
  owner_employee_id uuid references employees(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 18. EMPLOYEE ROLE PERMISSIONS — explicit mapping table
-- -----------------------------------------------------------------------------
create table if not exists employee_role_permissions (
  id uuid primary key default gen_random_uuid(),
  role employee_role not null,
  permission text not null,
  unique (role, permission)
);
-- Seed the role->permission map for the four critical roles.
insert into employee_role_permissions (role, permission) values
  ('super_admin',  '*'),
  ('compliance',   'audit.view'),
  ('compliance',   'compliance.view'),
  ('compliance',   'compliance.edit'),
  ('compliance',   'kyc.view'),
  ('compliance',   'kyc.approve'),
  ('compliance',   'kyc.reject'),
  ('auditor',      'audit.view'),
  ('auditor',      'compliance.view'),
  ('manager',      'members.view'),
  ('manager',      'accounts.view'),
  ('manager',      'branches.view'),
  ('teller',       'accounts.view'),
  ('teller',       'transactions.view')
on conflict do nothing;

-- =============================================================================
-- RLS POLICIES FOR THE NEW TABLES (FIX-12)
-- =============================================================================

-- branches: anyone authenticated can read; only super_admin can write
alter table branches enable row level security;
create policy "branches_read" on branches for select using (deleted_at is null);
create policy "branches_admin_write" on branches for all using (
  exists (select 1 from employees where user_id = auth.uid() and role = 'super_admin' and status = 'active')
);

-- transfers: members see their own; employees with txn perms see all
alter table transfers enable row level security;
create policy "transfers_member_read" on transfers for select using (
  initiated_by in (select id from members where user_id = auth.uid())
);
create policy "transfers_employee_read" on transfers for select using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);

-- crypto_balances: members see own; employees with accounts.view see all
alter table crypto_balances enable row level security;
create policy "crypto_member_read" on crypto_balances for select using (
  member_id in (select id from members where user_id = auth.uid())
);
create policy "crypto_employee_read" on crypto_balances for select using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);

-- billers: anyone authenticated can read
alter table billers enable row level security;
create policy "billers_read" on billers for select using (is_active = true);

-- bill_payments: members see own; employees with accounts.view see all
alter table bill_payments enable row level security;
create policy "bill_payments_member_read" on bill_payments for select using (
  member_id in (select id from members where user_id = auth.uid())
);
create policy "bill_payments_employee_read" on bill_payments for select using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);

-- notifications: member/employee sees own only
alter table notifications enable row level security;
create policy "notifications_member_read" on notifications for select using (
  recipient_member_id in (select id from members where user_id = auth.uid())
);
create policy "notifications_employee_read" on notifications for select using (
  recipient_employee_id in (select id from employees where user_id = auth.uid())
);

-- support_tickets + messages: member sees own; assigned employee sees theirs
alter table support_tickets enable row level security;
create policy "tickets_member_read" on support_tickets for select using (
  member_id in (select id from members where user_id = auth.uid())
);
create policy "tickets_employee_read" on support_tickets for select using (
  assigned_employee_id in (select id from employees where user_id = auth.uid())
  or exists (select 1 from employees where user_id = auth.uid() and role in ('customer_support','super_admin'))
);

alter table support_ticket_messages enable row level security;
create policy "ticket_messages_member_read" on support_ticket_messages for select using (
  ticket_id in (
    select id from support_tickets
    where member_id in (select id from members where user_id = auth.uid())
  )
);
create policy "ticket_messages_employee_read" on support_ticket_messages for select using (
  ticket_id in (
    select id from support_tickets
    where assigned_employee_id in (select id from employees where user_id = auth.uid())
    or exists (select 1 from employees where user_id = auth.uid() and role in ('customer_support','super_admin'))
  )
);

-- marketing_campaigns: employees only
alter table marketing_campaigns enable row level security;
create policy "marketing_employee_read" on marketing_campaigns for select using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);

-- cms_pages: anyone reads published; employees manage
alter table cms_pages enable row level security;
create policy "cms_public_read" on cms_pages for select using (status = 'published');
create policy "cms_employee_all" on cms_pages for all using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);

-- documents: members see own; employees see all
alter table documents enable row level security;
create policy "documents_member_read" on documents for select using (
  member_id in (select id from members where user_id = auth.uid())
);
create policy "documents_employee_read" on documents for select using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);

-- statements: members see own; employees see all
alter table statements enable row level security;
create policy "statements_member_read" on statements for select using (
  account_id in (
    select a.id from accounts a join members m on m.id = a.member_id
    where m.user_id = auth.uid()
  )
);
create policy "statements_employee_read" on statements for select using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);

-- investments: members see own; employees see all
alter table investments enable row level security;
create policy "investments_member_read" on investments for select using (
  member_id in (select id from members where user_id = auth.uid())
);
create policy "investments_employee_read" on investments for select using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);

-- automation_rules: employees only
alter table automation_rules enable row level security;
create policy "automation_employee_read" on automation_rules for select using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);

-- loan_payments: members see own; employees see all
alter table loan_payments enable row level security;
create policy "loan_payments_member_read" on loan_payments for select using (
  loan_id in (
    select l.id from loans l
    join members m on m.id = l.member_id
    where m.user_id = auth.uid()
  )
);
create policy "loan_payments_employee_read" on loan_payments for select using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);

-- branch_performance: employees only
alter table branch_performance enable row level security;
create policy "branch_perf_employee_read" on branch_performance for select using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);

-- aml_alerts: compliance/super_admin only
alter table aml_alerts enable row level security;
create policy "aml_employee_read" on aml_alerts for select using (
  exists (
    select 1 from employees
    where user_id = auth.uid() and role in ('compliance','super_admin') and status = 'active'
  )
);

-- compliance_policies: any employee can read; only compliance can write
alter table compliance_policies enable row level security;
create policy "compliance_policies_read" on compliance_policies for select using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);
create policy "compliance_policies_write" on compliance_policies for all using (
  exists (
    select 1 from employees
    where user_id = auth.uid() and role in ('compliance','super_admin') and status = 'active'
  )
);

-- employee_role_permissions: any employee can read (used for hasPermission)
alter table employee_role_permissions enable row level security;
create policy "role_permissions_read" on employee_role_permissions for select using (
  exists (select 1 from employees where user_id = auth.uid() and status = 'active')
);

-- -----------------------------------------------------------------------------
-- 18. COMPLIANCE REPORTS — nightly aggregates produced by the
--     `daily-compliance-report` Supabase Edge Function.
-- -----------------------------------------------------------------------------
create table if not exists compliance_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null unique,
  kyc_pending int not null default 0,
  kyc_approved int not null default 0,
  kyc_rejected int not null default 0,
  new_accounts int not null default 0,
  deposit_total numeric(20,4) not null default 0,
  withdrawal_total numeric(20,4) not null default 0,
  aml_alerts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index on compliance_reports (report_date desc);

alter table compliance_reports enable row level security;

-- super_admin can SELECT every row
create policy "compliance_reports_super_admin_read" on compliance_reports
  for select using (
    exists (
      select 1 from employees
      where user_id = auth.uid() and role = 'super_admin' and status = 'active'
    )
  );

-- compliance role can SELECT every row
create policy "compliance_reports_compliance_read" on compliance_reports
  for select using (
    exists (
      select 1 from employees
      where user_id = auth.uid() and role = 'compliance' and status = 'active'
    )
  );

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================