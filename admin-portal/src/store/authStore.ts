import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { verifyToken, verifyBackupCode } from '@/lib/mfa';

// Types
export type Permission =
  | 'members.view' | 'members.create' | 'members.edit' | 'members.delete' | 'members.suspend'
  | 'accounts.view' | 'accounts.create' | 'accounts.edit' | 'accounts.freeze' | 'accounts.close'
  | 'transactions.view' | 'transactions.create' | 'transactions.reverse' | 'transactions.export'
  | 'cards.view' | 'cards.create' | 'cards.activate' | 'cards.freeze' | 'cards.block'
  | 'loans.view' | 'loans.create' | 'loans.approve' | 'loans.reject'
  | 'kyc.view' | 'kyc.approve' | 'kyc.reject' | 'kyc.request_docs'
  | 'fraud.view' | 'fraud.investigate' | 'fraud.resolve' | 'fraud.escalate'
  | 'branches.view' | 'branches.create' | 'branches.edit'
  | 'employees.view' | 'employees.create' | 'employees.edit' | 'employees.delete'
  | 'financial.view' | 'financial.export'
  | 'marketing.view' | 'marketing.create' | 'marketing.edit' | 'marketing.delete'
  | 'cms.view' | 'cms.create' | 'cms.edit' | 'cms.delete'
  | 'compliance.view' | 'compliance.edit'
  | 'audit.view' | 'audit.export'
  | 'reports.view' | 'reports.create' | 'reports.export'
  | 'support.view' | 'support.create' | 'support.assign' | 'support.resolve'
  | 'documents.view' | 'documents.upload' | 'documents.delete' | 'documents.download'
  | 'notifications.view' | 'notifications.send'
  | 'settings.view' | 'settings.edit' | 'settings.users' | 'settings.roles'
  | 'system.view' | 'system.configure';

export type Role =
  | 'super_admin'
  | 'system_admin'
  | 'operations_manager'
  | 'compliance_officer'
  | 'risk_manager'
  | 'customer_support'
  | 'finance_officer'
  | 'loan_officer'
  | 'branch_manager'
  | 'card_operations'
  | 'fraud_analyst'
  | 'kyc_officer'
  | 'marketing_manager'
  | 'content_manager'
  | 'auditor'
  | 'read_only_analyst';

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  permissions: Permission[];
  avatar?: string;
  lastLogin: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  status: 'active' | 'inactive' | 'locked';
  department: string;
  branch: string;
  createdAt: string;
}

export interface Session {
  id: string;
  adminId: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface LoginAttempt {
  email: string;
  ip: string;
  timestamp: string;
  success: boolean;
  userAgent: string;
}

// Audit Log Entry Type
interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  module: string;
  details: string;
  ip: string;
  date: string;
}

// Role to Permissions Mapping
const rolePermissions: Record<Role, Permission[]> = {
  super_admin: [
    'members.view', 'members.create', 'members.edit', 'members.delete', 'members.suspend',
    'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.freeze', 'accounts.close',
    'transactions.view', 'transactions.create', 'transactions.reverse', 'transactions.export',
    'cards.view', 'cards.create', 'cards.activate', 'cards.freeze', 'cards.block',
    'loans.view', 'loans.create', 'loans.approve', 'loans.reject',
    'kyc.view', 'kyc.approve', 'kyc.reject', 'kyc.request_docs',
    'fraud.view', 'fraud.investigate', 'fraud.resolve', 'fraud.escalate',
    'branches.view', 'branches.create', 'branches.edit',
    'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
    'financial.view', 'financial.export',
    'marketing.view', 'marketing.create', 'marketing.edit', 'marketing.delete',
    'cms.view', 'cms.create', 'cms.edit', 'cms.delete',
    'compliance.view', 'compliance.edit',
    'audit.view', 'audit.export',
    'reports.view', 'reports.create', 'reports.export',
    'support.view', 'support.create', 'support.assign', 'support.resolve',
    'documents.view', 'documents.upload', 'documents.delete', 'documents.download',
    'notifications.view', 'notifications.send',
    'settings.view', 'settings.edit', 'settings.users', 'settings.roles',
    'system.view', 'system.configure',
  ],
  system_admin: [
    'members.view', 'members.edit',
    'accounts.view', 'accounts.edit', 'accounts.freeze',
    'transactions.view', 'transactions.export',
    'cards.view', 'cards.activate', 'cards.freeze', 'cards.block',
    'loans.view',
    'kyc.view', 'kyc.approve', 'kyc.reject', 'kyc.request_docs',
    'fraud.view', 'fraud.investigate', 'fraud.resolve',
    'branches.view', 'employees.view', 'employees.create', 'employees.edit',
    'financial.view', 'financial.export',
    'compliance.view',
    'audit.view', 'audit.export',
    'reports.view', 'reports.create', 'reports.export',
    'support.view', 'support.assign', 'support.resolve',
    'documents.view', 'documents.download',
    'notifications.view', 'notifications.send',
    'settings.view', 'settings.edit', 'settings.users', 'settings.roles',
  ],
  operations_manager: [
    'members.view', 'members.create', 'members.edit', 'members.suspend',
    'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.freeze', 'accounts.close',
    'transactions.view', 'transactions.create', 'transactions.reverse',
    'cards.view', 'cards.create', 'cards.activate', 'cards.freeze',
    'loans.view', 'loans.create', 'loans.approve',
    'kyc.view', 'kyc.approve', 'kyc.reject',
    'fraud.view',
    'branches.view', 'branches.edit',
    'employees.view',
    'financial.view',
    'compliance.view',
    'reports.view', 'reports.create',
    'support.view', 'support.assign',
    'documents.view', 'documents.upload',
    'notifications.view',
    'settings.view',
  ],
  compliance_officer: [
    'members.view', 'members.edit',
    'accounts.view',
    'transactions.view', 'transactions.export',
    'kyc.view', 'kyc.approve', 'kyc.reject', 'kyc.request_docs',
    'fraud.view', 'fraud.investigate', 'fraud.resolve', 'fraud.escalate',
    'branches.view',
    'employees.view',
    'financial.view', 'financial.export',
    'compliance.view', 'compliance.edit',
    'audit.view', 'audit.export',
    'reports.view', 'reports.create', 'reports.export',
    'documents.view', 'documents.upload', 'documents.download',
    'notifications.view',
    'settings.view',
  ],
  risk_manager: [
    'members.view', 'members.edit',
    'accounts.view', 'accounts.freeze',
    'transactions.view', 'transactions.export',
    'cards.view', 'cards.freeze', 'cards.block',
    'loans.view', 'loans.reject',
    'kyc.view', 'kyc.reject',
    'fraud.view', 'fraud.investigate', 'fraud.resolve', 'fraud.escalate',
    'branches.view',
    'employees.view',
    'financial.view', 'financial.export',
    'reports.view', 'reports.create', 'reports.export',
    'documents.view', 'documents.download',
    'notifications.view',
    'settings.view',
  ],
  customer_support: [
    'members.view', 'members.edit',
    'accounts.view',
    'transactions.view',
    'cards.view', 'cards.freeze',
    'loans.view',
    'kyc.view',
    'fraud.view',
    'branches.view',
    'employees.view',
    'support.view', 'support.create', 'support.resolve',
    'documents.view', 'documents.download',
    'notifications.view',
  ],
  finance_officer: [
    'members.view',
    'accounts.view',
    'transactions.view', 'transactions.create', 'transactions.reverse', 'transactions.export',
    'cards.view',
    'loans.view', 'loans.create',
    'financial.view', 'financial.export',
    'reports.view', 'reports.create', 'reports.export',
    'documents.view', 'documents.upload', 'documents.download',
    'notifications.view',
    'settings.view',
  ],
  loan_officer: [
    'members.view', 'members.edit',
    'accounts.view',
    'transactions.view',
    'cards.view',
    'loans.view', 'loans.create', 'loans.approve', 'loans.reject',
    'kyc.view',
    'branches.view',
    'employees.view',
    'reports.view', 'reports.create',
    'documents.view', 'documents.upload', 'documents.download',
    'notifications.view',
    'settings.view',
  ],
  branch_manager: [
    'members.view', 'members.create', 'members.edit', 'members.suspend',
    'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.freeze',
    'transactions.view',
    'cards.view', 'cards.activate', 'cards.freeze',
    'loans.view', 'loans.create',
    'kyc.view', 'kyc.approve', 'kyc.reject',
    'fraud.view',
    'branches.view', 'branches.edit',
    'employees.view', 'employees.create', 'employees.edit',
    'financial.view',
    'support.view', 'support.assign', 'support.resolve',
    'documents.view', 'documents.upload',
    'notifications.view',
    'settings.view',
  ],
  card_operations: [
    'members.view',
    'accounts.view',
    'transactions.view',
    'cards.view', 'cards.create', 'cards.activate', 'cards.freeze', 'cards.block',
    'loans.view',
    'kyc.view',
    'fraud.view',
    'reports.view',
    'documents.view',
    'notifications.view',
    'settings.view',
  ],
  fraud_analyst: [
    'members.view',
    'accounts.view',
    'transactions.view', 'transactions.export',
    'cards.view', 'cards.freeze', 'cards.block',
    'loans.view',
    'kyc.view',
    'fraud.view', 'fraud.investigate', 'fraud.resolve', 'fraud.escalate',
    'reports.view', 'reports.create',
    'documents.view', 'documents.download',
    'notifications.view',
    'settings.view',
  ],
  kyc_officer: [
    'members.view', 'members.edit',
    'accounts.view',
    'transactions.view',
    'cards.view',
    'loans.view',
    'kyc.view', 'kyc.approve', 'kyc.reject', 'kyc.request_docs',
    'fraud.view',
    'reports.view',
    'documents.view', 'documents.upload', 'documents.download',
    'notifications.view',
    'settings.view',
  ],
  marketing_manager: [
    'members.view',
    'accounts.view',
    'transactions.view',
    'cards.view',
    'loans.view',
    'kyc.view',
    'branches.view',
    'financial.view',
    'marketing.view', 'marketing.create', 'marketing.edit', 'marketing.delete',
    'cms.view', 'cms.create', 'cms.edit',
    'reports.view', 'reports.create',
    'documents.view', 'documents.upload',
    'notifications.view', 'notifications.send',
    'settings.view',
  ],
  content_manager: [
    'members.view',
    'accounts.view',
    'transactions.view',
    'cards.view',
    'loans.view',
    'kyc.view',
    'marketing.view', 'marketing.create', 'marketing.edit', 'marketing.delete',
    'cms.view', 'cms.create', 'cms.edit', 'cms.delete',
    'documents.view', 'documents.upload',
    'notifications.view', 'notifications.send',
    'settings.view',
  ],
  auditor: [
    'members.view',
    'accounts.view',
    'transactions.view', 'transactions.export',
    'cards.view',
    'loans.view',
    'kyc.view',
    'fraud.view',
    'branches.view',
    'employees.view',
    'financial.view', 'financial.export',
    'compliance.view',
    'audit.view', 'audit.export',
    'reports.view', 'reports.export',
    'support.view',
    'documents.view', 'documents.download',
    'notifications.view',
    'settings.view',
  ],
  read_only_analyst: [
    'members.view',
    'accounts.view',
    'transactions.view',
    'cards.view',
    'loans.view',
    'kyc.view',
    'fraud.view',
    'branches.view',
    'employees.view',
    'financial.view',
    'compliance.view',
    'audit.view',
    'reports.view',
    'support.view',
    'documents.view',
    'notifications.view',
    'settings.view',
  ],
};

// Mock Admin Data
const mockAdmins: Admin[] = [
  {
    id: 'ADM001',
    email: 'admin@orbitpay.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'super_admin',
    permissions: rolePermissions['super_admin'],
    avatar: undefined,
    lastLogin: '2024-01-15 08:00',
    failedLoginAttempts: 0,
    mfaEnabled: true,
    mfaSecret: 'JBSWY3DPEHPK3PXP',
    status: 'active',
    department: 'IT',
    branch: 'Main Branch',
    createdAt: '2022-01-01',
  },
  {
    id: 'ADM002',
    email: 'compliance@orbitpay.com',
    firstName: 'Amanda',
    lastName: 'Compliance',
    role: 'compliance_officer',
    permissions: rolePermissions['compliance_officer'],
    lastLogin: '2024-01-15 09:30',
    failedLoginAttempts: 0,
    mfaEnabled: true,
    status: 'active',
    department: 'Compliance',
    branch: 'Main Branch',
    createdAt: '2022-06-15',
  },
  {
    id: 'ADM003',
    email: 'ops@orbitpay.com',
    firstName: 'Operations',
    lastName: 'Manager',
    role: 'operations_manager',
    permissions: rolePermissions['operations_manager'],
    lastLogin: '2024-01-15 10:00',
    failedLoginAttempts: 0,
    mfaEnabled: false,
    status: 'active',
    department: 'Operations',
    branch: 'Main Branch',
    createdAt: '2022-09-01',
  },
  {
    id: 'ADM004',
    email: 'risk@orbitpay.com',
    firstName: 'Risk',
    lastName: 'Analyst',
    role: 'risk_manager',
    permissions: rolePermissions['risk_manager'],
    lastLogin: '2024-01-14 16:00',
    failedLoginAttempts: 0,
    mfaEnabled: true,
    status: 'active',
    department: 'Risk',
    branch: 'Main Branch',
    createdAt: '2023-01-10',
  },
  {
    id: 'ADM005',
    email: 'support@orbitpay.com',
    firstName: 'Support',
    lastName: 'Agent',
    role: 'customer_support',
    permissions: rolePermissions['customer_support'],
    lastLogin: '2024-01-15 11:00',
    failedLoginAttempts: 0,
    mfaEnabled: false,
    status: 'active',
    department: 'Support',
    branch: 'Main Branch',
    createdAt: '2023-03-20',
  },
];

interface AuthState {
  // Auth State
  isAuthenticated: boolean;
  currentAdmin: Admin | null;
  currentSession: Session | null;
  sessions: Session[];
  loginAttempts: LoginAttempt[];
  auditLog: AuditLogEntry[];

  // MFA State
  pendingMFA: boolean;
  pendingEmail: string;
  pendingPassword: string;

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresMFA?: boolean }>;
  verifyMFA: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  logoutAllSessions: () => void;
  checkPermission: (permission: Permission) => boolean;
  checkRole: (roles: Role | Role[]) => boolean;

  // MFA enrollment (FIX-04b + admin-portal MFA enrollment UI).
  // Stores the TOTP secret on the currently-logged-in admin. Server-side
  // persistence (writing to the `employees.mfa_secret` column) is a follow-up
  // task — for now the secret is held in zustand + mirrored to localStorage.
  setMfaSecret: (secret: string) => void;

  // Session Management
  refreshSession: () => void;
  getActiveSessions: () => Session[];
  terminateSession: (sessionId: string) => void;

  // Admin Management
  getAdmins: () => Admin[];
  getAdmin: (id: string) => Admin | undefined;
  updateAdmin: (id: string, updates: Partial<Admin>) => void;
  createAdmin: (admin: Omit<Admin, 'id'>) => Admin;
  deleteAdmin: (id: string) => void;
  assignRole: (adminId: string, role: Role) => void;

  // Audit Logging
  logAction: (action: string, module: string, details: string) => void;
  getAuditLogs: () => Array<{ id: string; adminId: string; adminName: string; action: string; module: string; details: string; ip: string; date: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentAdmin: null,
      currentSession: null,
      sessions: [],
      loginAttempts: [],
      auditLog: [],
      pendingMFA: false,
      pendingEmail: '',
      pendingPassword: '',

      login: async (email: string, password: string) => {
        const state = get();

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Find admin by email
        const admin = mockAdmins.find(a => a.email.toLowerCase() === email.toLowerCase());

        // Check for locked account
        if (admin && admin.lockedUntil) {
          const lockedUntil = new Date(admin.lockedUntil);
          if (lockedUntil > new Date()) {
            return { success: false, error: `Account locked until ${lockedUntil.toLocaleString()}` };
          }
        }

        // Simulate password validation (in real app, this would be server-side)
        const validPasswords: Record<string, string> = {
          'admin@orbitpay.com': 'admin123',
          'compliance@orbitpay.com': 'compliance123',
          'ops@orbitpay.com': 'ops123',
          'risk@orbitpay.com': 'risk123',
          'support@orbitpay.com': 'support123',
        };

        if (!admin || validPasswords[email.toLowerCase()] !== password) {
          // Log failed attempt
          set(state => ({
            loginAttempts: [
              ...state.loginAttempts.slice(-99),
              {
                email,
                ip: '192.168.1.' + Math.floor(Math.random() * 255),
                timestamp: new Date().toISOString(),
                success: false,
                userAgent: navigator.userAgent,
              }
            ]
          }));

          // Check for multiple failed attempts
          const recentAttempts = state.loginAttempts.filter(
            a => a.email === email && !a.success &&
            new Date(a.timestamp).getTime() > Date.now() - 30 * 60 * 1000
          );

          if (recentAttempts.length >= 5) {
            return { success: false, error: 'Too many failed attempts. Account locked for 30 minutes.' };
          }

          return { success: false, error: 'Invalid email or password' };
        }

        // Check if MFA is enabled
        if (admin.mfaEnabled) {
          set({
            pendingMFA: true,
            pendingEmail: email,
            pendingPassword: password,
          });
          return { success: true, requiresMFA: true };
        }

        // Complete login
        // Inline completeLogin logic to avoid TDZ on store self-reference
        const session: Session = {
          id: `SES${Date.now()}`,
          adminId: admin.id,
          ip: '192.168.1.' + Math.floor(Math.random() * 255),
          userAgent: navigator.userAgent,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          isCurrent: true,
        };
        set(state => ({
          isAuthenticated: true,
          currentAdmin: admin,
          currentSession: session,
          sessions: [...state.sessions.filter(s => s.adminId !== admin.id), session],
        }));
        get().logAction('Login', 'Authentication', `Successful login`);
        return { success: true };
      },

      verifyMFA: async (code: string) => {
        const state = get();

        if (!state.pendingMFA) {
          return { success: false, error: 'No pending MFA verification' };
        }

        // Validate code format
        if (code.length !== 6 || !/^\d+$/.test(code)) {
          return { success: false, error: 'Invalid MFA code format. Enter 6 digits.' };
        }

        const admin = mockAdmins.find(a => a.email.toLowerCase() === state.pendingEmail.toLowerCase());
        if (!admin) {
          return { success: false, error: 'Admin not found' };
        }

        // Get the user's MFA secret
        const secret = admin.mfaSecret || 'JBSWY3DPEHPK3PXP';

        // Verify TOTP token
        const isValidToken = verifyToken(code, secret);

        // Also accept backup codes
        const isBackupCode = verifyBackupCode(code, []);

        if (!isValidToken && !isBackupCode) {
          return { success: false, error: 'Invalid verification code. Check your authenticator app.' };
        }

        // Complete login after MFA (inlined to avoid TDZ on store self-reference)
        const mfaSession: Session = {
          id: `SES${Date.now()}`,
          adminId: admin.id,
          ip: '192.168.1.' + Math.floor(Math.random() * 255),
          userAgent: navigator.userAgent,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          isCurrent: true,
        };
        set(state => ({
          isAuthenticated: true,
          currentAdmin: admin,
          currentSession: mfaSession,
          sessions: [...state.sessions.filter(s => s.adminId !== admin.id), mfaSession],
        }));
        get().logAction('Login', 'Authentication', `Successful login via MFA`);
        const result = { success: true };

        if (result.success) {
          set({ pendingMFA: false, pendingEmail: '', pendingPassword: '' });
          // Log MFA verification
          get().logAction('MFA_Verified', 'Authentication', isBackupCode ? 'Logged in with backup code' : 'Logged in with TOTP');
        }

        return result;
      },

      logout: () => {
        const state = get();
        if (state.currentAdmin) {
          get().logAction('Logout', 'Authentication', 'User logged out');
        }

        set({
          isAuthenticated: false,
          currentAdmin: null,
          currentSession: null,
        });
      },

      logoutAllSessions: () => {
        const state = get();
        if (state.currentAdmin) {
          get().logAction('Logout All Sessions', 'Authentication', 'All sessions terminated');
        }

        set({
          sessions: [],
          currentSession: null,
        });
      },

      checkPermission: (permission: Permission) => {
        const state = get();
        if (!state.currentAdmin) return false;
        return state.currentAdmin.permissions.includes(permission);
      },

      checkRole: (roles: Role | Role[]) => {
        const state = get();
        if (!state.currentAdmin) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(state.currentAdmin.role);
      },

      setMfaSecret: (secret: string) => {
    const state = get();
    if (!state.currentAdmin) return;
    set({
      currentAdmin: {
        ...state.currentAdmin,
        mfaSecret: secret,
        mfaEnabled: true,
      },
    });
    get().logAction('Enable MFA', 'Authentication', 'Admin enrolled TOTP MFA');
  },

  refreshSession: () => {
        set(state => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          } : null,
        }));
      },

      getActiveSessions: () => {
        const state = get();
        const now = new Date();
        return state.sessions.filter(s => new Date(s.expiresAt) > now);
      },

      terminateSession: (sessionId: string) => {
        const state = get();
        const session = state.sessions.find(s => s.id === sessionId);

        if (session) {
          get().logAction('Terminate Session', 'Authentication', `Session ${sessionId} terminated`);
        }

        set(state => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
        }));
      },

      getAdmins: () => mockAdmins,

      getAdmin: (id: string) => mockAdmins.find(a => a.id === id),

      updateAdmin: (id: string, updates: Partial<Admin>) => {
        const index = mockAdmins.findIndex(a => a.id === id);
        if (index !== -1) {
          mockAdmins[index] = { ...mockAdmins[index], ...updates };
          set({});
          get().logAction('Update Admin', 'Administration', `Updated admin ${id}`);
        }
      },

      createAdmin: (admin: Omit<Admin, 'id'>) => {
        const newAdmin: Admin = {
          ...admin,
          id: `ADM${String(mockAdmins.length + 1).padStart(3, '0')}`,
          permissions: rolePermissions[admin.role],
        };
        mockAdmins.push(newAdmin);
        set({});
        get().logAction('Create Admin', 'Administration', `Created new admin ${newAdmin.email}`);
        return newAdmin;
      },

      deleteAdmin: (id: string) => {
        const admin = mockAdmins.find(a => a.id === id);
        const index = mockAdmins.findIndex(a => a.id === id);

        if (index !== -1) {
          mockAdmins.splice(index, 1);
          set({});
          get().logAction('Delete Admin', 'Administration', `Deleted admin ${admin?.email}`);
        }
      },

      assignRole: (adminId: string, role: Role) => {
        const admin = mockAdmins.find(a => a.id === adminId);
        if (admin) {
          admin.role = role;
          admin.permissions = rolePermissions[role];
          set({});
          get().logAction('Assign Role', 'Administration', `Assigned role ${role} to admin ${adminId}`);
        }
      },

      logAction: (action: string, module: string, details: string) => {
        const state = get();
        const admin = state.currentAdmin;

        const logEntry = {
          id: `AUD${Date.now()}`,
          adminId: admin?.id || 'SYSTEM',
          adminName: admin ? `${admin.firstName} ${admin.lastName}` : 'System',
          action,
          module,
          details,
          ip: state.currentSession?.ip || '127.0.0.1',
          date: new Date().toISOString(),
        };

        // Add to audit logs
        set(s => ({
          auditLog: [logEntry, ...s.auditLog].slice(0, 1000)
        }));
      },

      getAuditLogs: () => {
        return get().auditLog;
      },
    }),
    {
      name: 'orbitpay-admin-auth',
      // FIX-10: persistence disabled by default. The previous `partialize` only
      // persisted UI-flag fields (no tokens), but persisting `isAuthenticated: true`
      // to localStorage lets an attacker forge a logged-in session via devtools.
      // The admin must re-authenticate on every page load until a real backend
      // issues a signed, httpOnly session cookie (post-FIX-11).
      // When a backend lands, re-enable with a `version` + signed token check:
      //   partialize: (state) => ({ isAuthenticated: !!state.currentSession?.signedToken }),
      storage: undefined, // no-op storage (Zustand treats this as "don't persist")
    }
  )
);

// Helper hook for checking permissions
export const usePermission = (permission: Permission) => {
  return useAuthStore(state => state.currentAdmin?.permissions.includes(permission) || false);
};

export const useHasRole = (roles: Role | Role[]) => {
  return useAuthStore(state => {
    if (!state.currentAdmin) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(state.currentAdmin.role);
  });
};
