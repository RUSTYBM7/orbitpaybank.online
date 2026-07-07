import { create } from 'zustand';
import * as api from '@/lib/api';

// Types (for backward compatibility)
export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended' | 'closed';
  kycStatus: 'verified' | 'pending' | 'rejected' | 'not_submitted';
  joinDate: string;
  branch: string;
  branchId?: string;
  accountCount: number;
  totalBalance: number;
  lastLogin: string;
}

export interface Account {
  id: string;
  memberId: string;
  memberName: string;
  type: 'savings' | 'checking' | 'business' | 'joint' | 'student' | 'youth' | 'premium' | 'retirement';
  accountNumber: string;
  balance: number;
  status: 'active' | 'frozen' | 'closed' | 'dormant';
  interestRate: number;
  openedDate: string;
  branch: string;
  branchId?: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  type: 'transfer' | 'withdrawal' | 'deposit' | 'payment' | 'refund';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  description: string;
  reference: string;
}

export interface Card {
  id: string;
  memberId: string;
  memberName: string;
  type: 'debit' | 'credit' | 'virtual';
  last4: string;
  network: 'Visa' | 'Mastercard' | 'Amex';
  status: 'active' | 'frozen' | 'blocked' | 'expired' | 'pending';
  limit: number;
  used: number;
  expiryDate: string;
}

export interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  type: 'personal' | 'home' | 'auto' | 'business' | 'student';
  amount: number;
  balance: number;
  rate: number;
  term: number;
  status: 'active' | 'pending' | 'approved' | 'rejected' | 'defaulted' | 'paid_off';
  startDate: string;
  nextPayment: string;
  progress: number;
}

export interface KYCApplication {
  id: string;
  memberId: string;
  memberName: string;
  email: string;
  type: 'new_account' | 'upgrade' | 'kyc_refresh';
  submittedDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_docs';
  riskScore: number;
  documents: { type: string; status: string }[];
}

export interface FraudAlert {
  id: string;
  memberId: string;
  memberName: string;
  type: 'suspicious_activity' | 'aml' | 'velocity' | 'geo_anomaly' | 'sanctions';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  amount: number;
  date: string;
  description: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  manager: string;
  staffCount: number;
  memberCount: number;
  totalDeposits: number;
  status: 'active' | 'inactive';
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  branch: string;
  branchId?: string;
  status: 'active' | 'on_leave' | 'inactive';
  joinDate: string;
  lastActive: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  date: string;
}

export interface SupportTicket {
  id: string;
  memberId: string;
  memberName: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  category: string;
  assignedTo: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  audience: any;
  sentCount: number;
  openRate: number;
  clickRate: number;
  scheduledAt: string;
  createdAt: string;
}

export interface ContentPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceItem {
  id: string;
  type: string;
  requirement: string;
  description?: string;
  status: 'compliant' | 'pending' | 'non_compliant';
  dueDate: string;
  lastReviewed: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  module: string;
  details: string;
  ip: string;
  date: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingKYC: number;
  activeLoans: number;
  openFraudAlerts: number;
  totalAccounts: number;
  activeCards: number;
  totalBalance: number;
  recentTransactions: Transaction[];
}

// Store Interface
interface AdminState {
  // Data
  members: Member[];
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  loans: Loan[];
  kycApplications: KYCApplication[];
  fraudAlerts: FraudAlert[];
  branches: Branch[];
  employees: Employee[];
  notifications: Notification[];
  supportTickets: SupportTicket[];
  campaigns: Campaign[];
  contentPages: ContentPage[];
  complianceItems: ComplianceItem[];
  dashboardStats: DashboardStats | null;
  auditLogs: AuditLog[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions - Data Fetching
  fetchAll: () => Promise<void>;
  fetchMembers: (filters?: any) => Promise<void>;
  fetchAccounts: (filters?: any) => Promise<void>;
  fetchTransactions: (filters?: any) => Promise<void>;
  fetchCards: (filters?: any) => Promise<void>;
  fetchLoans: (filters?: any) => Promise<void>;
  fetchKYC: (filters?: any) => Promise<void>;
  fetchFraud: (filters?: any) => Promise<void>;
  fetchBranches: () => Promise<void>;
  fetchEmployees: (filters?: any) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchTickets: (filters?: any) => Promise<void>;
  fetchCampaigns: (filters?: any) => Promise<void>;
  fetchContent: (filters?: any) => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  fetchAuditLogs: (filters?: any) => Promise<void>;

  // Actions - Members
  addMember: (member: Omit<Member, 'id'>) => Promise<void>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  suspendMember: (id: string) => Promise<void>;
  reactivateMember: (id: string) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;

  // Actions - Accounts
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  freezeAccount: (id: string) => Promise<void>;
  unfreezeAccount: (id: string) => Promise<void>;
  closeAccount: (id: string) => Promise<void>;

  // Actions - Cards
  issueCard: (card: Omit<Card, 'id'>) => Promise<void>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  freezeCard: (id: string) => Promise<void>;
  unfreezeCard: (id: string) => Promise<void>;
  blockCard: (id: string) => Promise<void>;
  activateCard: (id: string) => Promise<void>;

  // Actions - Loans
  addLoan: (loan: Omit<Loan, 'id'>) => Promise<void>;
  updateLoan: (id: string, updates: Partial<Loan>) => Promise<void>;
  approveLoan: (id: string) => Promise<void>;
  rejectLoan: (id: string) => Promise<void>;

  // Actions - KYC
  approveKYC: (id: string, adminId: string) => Promise<void>;
  rejectKYC: (id: string, adminId: string, reason?: string) => Promise<void>;
  requestKYCDocs: (id: string) => Promise<void>;

  // Actions - Fraud
  investigateFraud: (id: string, adminId: string) => Promise<void>;
  resolveFraud: (id: string, notes?: string) => Promise<void>;
  markFraudFalsePositive: (id: string, reason?: string) => Promise<void>;

  // Actions - Transactions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  reverseTransaction: (id: string) => Promise<void>;

  // Actions - Tickets
  assignTicket: (id: string, adminId: string, adminName: string) => Promise<void>;
  resolveTicket: (id: string, notes?: string) => Promise<void>;

  // Actions - Notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Actions - Branches
  addBranch: (branch: Omit<Branch, 'id'>) => Promise<void>;
  updateBranch: (id: string, updates: Partial<Branch>) => Promise<void>;

  // Actions - Employees
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;

  // Actions - Content
  addContentPage: (page: Omit<ContentPage, 'id'>) => Promise<void>;
  updateContentPage: (id: string, updates: Partial<ContentPage>) => Promise<void>;

  // Actions - Compliance
  updateComplianceStatus: (id: string, status: string, notes?: string) => Promise<void>;

  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial Data
  members: [],
  accounts: [],
  transactions: [],
  cards: [],
  loans: [],
  kycApplications: [],
  fraudAlerts: [],
  branches: [],
  employees: [],
  notifications: [],
  supportTickets: [],
  campaigns: [],
  contentPages: [],
  complianceItems: [],
  dashboardStats: null,
  auditLogs: [],

  isLoading: false,
  error: null,

  // Fetch All Data
  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().fetchMembers(),
        get().fetchAccounts(),
        get().fetchTransactions(),
        get().fetchCards(),
        get().fetchLoans(),
        get().fetchKYC(),
        get().fetchFraud(),
        get().fetchBranches(),
        get().fetchEmployees(),
        get().fetchNotifications(),
        get().fetchTickets(),
        get().fetchCompliance(),
        get().fetchDashboardStats()
      ]);
    } catch (error) {
      set({ error: 'Failed to fetch data' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Data Fetching
  fetchMembers: async (filters) => {
    const result = await api.membersApi.getAll(filters);
    if (result.success && result.data) {
      set({ members: result.data });
    }
  },

  fetchAccounts: async (filters) => {
    const result = await api.accountsApi.getAll(filters);
    if (result.success && result.data) {
      set({ accounts: result.data });
    }
  },

  fetchTransactions: async (filters) => {
    const result = await api.transactionsApi.getAll(filters);
    if (result.success && result.data) {
      set({ transactions: result.data });
    }
  },

  fetchCards: async (filters) => {
    const result = await api.cardsApi.getAll(filters);
    if (result.success && result.data) {
      set({ cards: result.data });
    }
  },

  fetchLoans: async (filters) => {
    const result = await api.loansApi.getAll(filters);
    if (result.success && result.data) {
      set({ loans: result.data });
    }
  },

  fetchKYC: async (filters) => {
    const result = await api.kycApi.getAll(filters);
    if (result.success && result.data) {
      set({ kycApplications: result.data });
    }
  },

  fetchFraud: async (filters) => {
    const result = await api.fraudApi.getAll(filters);
    if (result.success && result.data) {
      set({ fraudAlerts: result.data });
    }
  },

  fetchBranches: async () => {
    const result = await api.branchesApi.getAll();
    if (result.success && result.data) {
      set({ branches: result.data });
    }
  },

  fetchEmployees: async (filters) => {
    const result = await api.employeesApi.getAll(filters);
    if (result.success && result.data) {
      set({ employees: result.data });
    }
  },

  fetchNotifications: async () => {
    const result = await api.notificationsApi.getAll();
    if (result.success && result.data) {
      set({ notifications: result.data });
    }
  },

  fetchTickets: async (filters) => {
    const result = await api.ticketsApi.getAll(filters);
    if (result.success && result.data) {
      set({ supportTickets: result.data });
    }
  },

  fetchCampaigns: async (filters) => {
    const result = await api.campaignsApi.getAll(filters);
    if (result.success && result.data) {
      set({ campaigns: result.data });
    }
  },

  fetchContent: async (filters) => {
    const result = await api.contentApi.getAll(filters);
    if (result.success && result.data) {
      set({ contentPages: result.data });
    }
  },

  fetchCompliance: async () => {
    const result = await api.complianceApi.getAll();
    if (result.success && result.data) {
      set({ complianceItems: result.data });
    }
  },

  fetchDashboardStats: async () => {
    const result = await api.dashboardApi.getStats();
    if (result.success && result.data) {
      set({ dashboardStats: result.data });
    }
  },

  fetchAuditLogs: async (filters) => {
    const result = await api.auditApi.getAll(filters);
    if (result.success && result.data) {
      set({ auditLogs: result.data });
    }
  },

  // Member Actions
  addMember: async (member) => {
    const result = await api.membersApi.create(member);
    if (result.success) {
      await get().fetchMembers();
    } else {
      set({ error: result.error || 'Failed to add member' });
    }
  },

  updateMember: async (id, updates) => {
    const result = await api.membersApi.update(id, updates);
    if (result.success) {
      await get().fetchMembers();
    } else {
      set({ error: result.error || 'Failed to update member' });
    }
  },

  suspendMember: async (id) => {
    const result = await api.membersApi.suspend(id);
    if (result.success) {
      await get().fetchMembers();
    } else {
      set({ error: result.error || 'Failed to suspend member' });
    }
  },

  reactivateMember: async (id) => {
    const result = await api.membersApi.reactivate(id);
    if (result.success) {
      await get().fetchMembers();
    } else {
      set({ error: result.error || 'Failed to reactivate member' });
    }
  },

  deleteMember: async (id) => {
    const result = await api.membersApi.delete(id);
    if (result.success) {
      await get().fetchMembers();
    } else {
      set({ error: result.error || 'Failed to delete member' });
    }
  },

  // Account Actions
  addAccount: async (account) => {
    const result = await api.accountsApi.create(account);
    if (result.success) {
      await get().fetchAccounts();
    } else {
      set({ error: result.error || 'Failed to add account' });
    }
  },

  updateAccount: async (id, updates) => {
    const result = await api.accountsApi.create({ ...updates } as any);
    if (result.success) {
      await get().fetchAccounts();
    } else {
      set({ error: result.error || 'Failed to update account' });
    }
  },

  freezeAccount: async (id) => {
    const result = await api.accountsApi.freeze(id);
    if (result.success) {
      await get().fetchAccounts();
    } else {
      set({ error: result.error || 'Failed to freeze account' });
    }
  },

  unfreezeAccount: async (id) => {
    const result = await api.accountsApi.unfreeze(id);
    if (result.success) {
      await get().fetchAccounts();
    } else {
      set({ error: result.error || 'Failed to unfreeze account' });
    }
  },

  closeAccount: async (id) => {
    const result = await api.accountsApi.close(id);
    if (result.success) {
      await get().fetchAccounts();
    } else {
      set({ error: result.error || 'Failed to close account' });
    }
  },

  // Card Actions
  issueCard: async (card) => {
    const result = await api.cardsApi.issue(card);
    if (result.success) {
      await get().fetchCards();
    } else {
      set({ error: result.error || 'Failed to issue card' });
    }
  },

  updateCard: async (id, updates) => {
    // Not implemented in API
    await get().fetchCards();
  },

  freezeCard: async (id) => {
    const result = await api.cardsApi.freeze(id);
    if (result.success) {
      await get().fetchCards();
    } else {
      set({ error: result.error || 'Failed to freeze card' });
    }
  },

  unfreezeCard: async (id) => {
    const result = await api.cardsApi.unfreeze(id);
    if (result.success) {
      await get().fetchCards();
    } else {
      set({ error: result.error || 'Failed to unfreeze card' });
    }
  },

  blockCard: async (id) => {
    const result = await api.cardsApi.block(id);
    if (result.success) {
      await get().fetchCards();
    } else {
      set({ error: result.error || 'Failed to block card' });
    }
  },

  activateCard: async (id) => {
    const result = await api.cardsApi.activate(id);
    if (result.success) {
      await get().fetchCards();
    } else {
      set({ error: result.error || 'Failed to activate card' });
    }
  },

  // Loan Actions
  addLoan: async (loan) => {
    // Not implemented in API
    await get().fetchLoans();
  },

  updateLoan: async (id, updates) => {
    // Not implemented in API
    await get().fetchLoans();
  },

  approveLoan: async (id) => {
    const result = await api.loansApi.approve(id);
    if (result.success) {
      await get().fetchLoans();
      await get().fetchDashboardStats();
    } else {
      set({ error: result.error || 'Failed to approve loan' });
    }
  },

  rejectLoan: async (id) => {
    const result = await api.loansApi.reject(id);
    if (result.success) {
      await get().fetchLoans();
    } else {
      set({ error: result.error || 'Failed to reject loan' });
    }
  },

  // KYC Actions
  approveKYC: async (id, adminId) => {
    const result = await api.kycApi.approve(id, adminId);
    if (result.success) {
      await get().fetchKYC();
      await get().fetchMembers();
      await get().fetchDashboardStats();
    } else {
      set({ error: result.error || 'Failed to approve KYC' });
    }
  },

  rejectKYC: async (id, adminId, reason) => {
    const result = await api.kycApi.reject(id, adminId, reason);
    if (result.success) {
      await get().fetchKYC();
    } else {
      set({ error: result.error || 'Failed to reject KYC' });
    }
  },

  requestKYCDocs: async (id) => {
    const result = await api.kycApi.requestDocs(id);
    if (result.success) {
      await get().fetchKYC();
    } else {
      set({ error: result.error || 'Failed to request documents' });
    }
  },

  // Fraud Actions
  investigateFraud: async (id, adminId) => {
    const result = await api.fraudApi.investigate(id, adminId);
    if (result.success) {
      await get().fetchFraud();
    } else {
      set({ error: result.error || 'Failed to investigate fraud' });
    }
  },

  resolveFraud: async (id, notes) => {
    const result = await api.fraudApi.resolve(id, notes);
    if (result.success) {
      await get().fetchFraud();
    } else {
      set({ error: result.error || 'Failed to resolve fraud' });
    }
  },

  markFraudFalsePositive: async (id, reason) => {
    const result = await api.fraudApi.markFalsePositive(id, reason);
    if (result.success) {
      await get().fetchFraud();
    } else {
      set({ error: result.error || 'Failed to mark as false positive' });
    }
  },

  // Transaction Actions
  addTransaction: async (transaction) => {
    // Not implemented in API
    await get().fetchTransactions();
  },

  reverseTransaction: async (id) => {
    const result = await api.transactionsApi.reverse(id);
    if (result.success) {
      await get().fetchTransactions();
    } else {
      set({ error: result.error || 'Failed to reverse transaction' });
    }
  },

  // Ticket Actions
  assignTicket: async (id, adminId, adminName) => {
    const result = await api.ticketsApi.assign(id, adminId, adminName);
    if (result.success) {
      await get().fetchTickets();
    } else {
      set({ error: result.error || 'Failed to assign ticket' });
    }
  },

  resolveTicket: async (id, notes) => {
    const result = await api.ticketsApi.resolve(id, notes);
    if (result.success) {
      await get().fetchTickets();
    } else {
      set({ error: result.error || 'Failed to resolve ticket' });
    }
  },

  // Notification Actions
  markNotificationRead: async (id) => {
    const result = await api.notificationsApi.markRead(id);
    if (result.success) {
      await get().fetchNotifications();
    }
  },

  markAllNotificationsRead: async () => {
    const result = await api.notificationsApi.markAllRead();
    if (result.success) {
      await get().fetchNotifications();
    }
  },

  // Branch Actions
  addBranch: async (branch) => {
    const result = await api.branchesApi.create(branch);
    if (result.success) {
      await get().fetchBranches();
    } else {
      set({ error: result.error || 'Failed to add branch' });
    }
  },

  updateBranch: async (id, updates) => {
    const result = await api.branchesApi.update(id, updates);
    if (result.success) {
      await get().fetchBranches();
    } else {
      set({ error: result.error || 'Failed to update branch' });
    }
  },

  // Employee Actions
  addEmployee: async (employee) => {
    const result = await api.employeesApi.create(employee);
    if (result.success) {
      await get().fetchEmployees();
    } else {
      set({ error: result.error || 'Failed to add employee' });
    }
  },

  updateEmployee: async (id, updates) => {
    const result = await api.employeesApi.update(id, updates);
    if (result.success) {
      await get().fetchEmployees();
    } else {
      set({ error: result.error || 'Failed to update employee' });
    }
  },

  // Content Actions
  addContentPage: async (page) => {
    const result = await api.contentApi.create(page);
    if (result.success) {
      await get().fetchContent();
    } else {
      set({ error: result.error || 'Failed to add page' });
    }
  },

  updateContentPage: async (id, updates) => {
    const result = await api.contentApi.update(id, updates);
    if (result.success) {
      await get().fetchContent();
    } else {
      set({ error: result.error || 'Failed to update page' });
    }
  },

  // Compliance Actions
  updateComplianceStatus: async (id, status, notes) => {
    const result = await api.complianceApi.updateStatus(id, status, notes);
    if (result.success) {
      await get().fetchCompliance();
    } else {
      set({ error: result.error || 'Failed to update compliance status' });
    }
  },

  // UI Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error })
}));

// Re-exports intentionally omitted — types are declared above.
// (Previously re-exported here, but TS2484 flagged them as duplicates
// since they were already exported in the same file.)
