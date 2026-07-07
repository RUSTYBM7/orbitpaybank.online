import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Forbidden from './pages/Forbidden';
import RequireAuth from './components/RequireAuth';
import type { Permission } from './store/authStore';

// Lazy-load all admin pages so the initial bundle stays small
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Members = lazy(() => import('./pages/Members'));
const Accounts = lazy(() => import('./pages/Accounts'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Cards = lazy(() => import('./pages/Cards'));
const Loans = lazy(() => import('./pages/Loans'));
const KYC = lazy(() => import('./pages/KYC'));
const Fraud = lazy(() => import('./pages/Fraud'));
const Branches = lazy(() => import('./pages/Branches'));
const Employees = lazy(() => import('./pages/Employees'));
const Financial = lazy(() => import('./pages/Financial'));
const Marketing = lazy(() => import('./pages/Marketing'));
const CMS = lazy(() => import('./pages/CMS'));
const Compliance = lazy(() => import('./pages/Compliance'));
const Audit = lazy(() => import('./pages/Audit'));
const Reports = lazy(() => import('./pages/Reports'));
const Support = lazy(() => import('./pages/Support'));
const Documents = lazy(() => import('./pages/Documents'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const MfaSettings = lazy(() => import('./pages/MfaSettings'));
const Communications = lazy(() => import('./pages/Communications'));
const Verification = lazy(() => import('./pages/Verification'));
const Statements = lazy(() => import('./pages/Statements'));
const Investments = lazy(() => import('./pages/Investments'));
const Impersonation = lazy(() => import('./pages/Impersonation'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Automation = lazy(() => import('./pages/Automation'));

// Minimal inline loading spinner — keeps bundle size small
const Loader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500">Loading module...</p>
    </div>
  </div>
);

// Route → required permission catalog (FIX-06 RBAC).
// Maps each admin route to the Permission an admin needs to access it.
// super_admin has all permissions via the authStore hasPermission() check,
// so admins with fewer permissions get bounced to /403.
const ROUTE_PERMISSIONS: Record<string, Permission> = {
  dashboard: 'system.view',
  members: 'members.view',
  accounts: 'accounts.view',
  transactions: 'transactions.view',
  cards: 'cards.view',
  loans: 'loans.view',
  kyc: 'kyc.view',
  fraud: 'fraud.view',
  branches: 'branches.view',
  employees: 'employees.view',
  financial: 'financial.view',
  marketing: 'marketing.view',
  cms: 'cms.view',
  compliance: 'compliance.view',
  audit: 'audit.view',
  reports: 'reports.view',
  support: 'support.view',
  documents: 'documents.view',
  notifications: 'notifications.view',
  settings: 'settings.view',
  'settings/mfa': 'settings.edit',
  communications: 'notifications.view',
  verification: 'kyc.view',
  statements: 'accounts.view',
  investments: 'financial.view',
  impersonation: 'system.configure',
  'ai-assistant': 'system.view',
  automation: 'system.configure',
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />
      <Route path="/*" element={<Layout />}>
        <Route
          index
          element={
            <Suspense fallback={<Loader />}>
              <Dashboard />
            </Suspense>
          }
        />
        {[
          { path: 'dashboard', el: <Dashboard /> },
          { path: 'members', el: <Members /> },
          { path: 'accounts', el: <Accounts /> },
          { path: 'transactions', el: <Transactions /> },
          { path: 'cards', el: <Cards /> },
          { path: 'loans', el: <Loans /> },
          { path: 'kyc', el: <KYC /> },
          { path: 'fraud', el: <Fraud /> },
          { path: 'branches', el: <Branches /> },
          { path: 'employees', el: <Employees /> },
          { path: 'financial', el: <Financial /> },
          { path: 'marketing', el: <Marketing /> },
          { path: 'cms', el: <CMS /> },
          { path: 'compliance', el: <Compliance /> },
          { path: 'audit', el: <Audit /> },
          { path: 'reports', el: <Reports /> },
          { path: 'support', el: <Support /> },
          { path: 'documents', el: <Documents /> },
          { path: 'notifications', el: <Notifications /> },
          { path: 'settings', el: <Settings /> },
          { path: 'settings/mfa', el: <MfaSettings /> },
          { path: 'communications', el: <Communications /> },
          { path: 'verification', el: <Verification /> },
          { path: 'statements', el: <Statements /> },
          { path: 'investments', el: <Investments /> },
          { path: 'impersonation', el: <Impersonation /> },
          { path: 'ai-assistant', el: <AIAssistant /> },
          { path: 'automation', el: <Automation /> },
        ].map((r) => (
          <Route
            key={r.path}
            path={r.path}
            element={
              <RequireAuth permission={ROUTE_PERMISSIONS[r.path]}>
                <Suspense fallback={<Loader />}>{r.el}</Suspense>
              </RequireAuth>
            }
          />
        ))}
      </Route>
    </Routes>
  );
}

export default App;