import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Search, Download, Filter, AlertTriangle, User, Shield, CreditCard, Banknote, FileText, Eye, RefreshCw, Database, Bug } from 'lucide-react';
import * as api from '@/lib/api';

const actionTypes = [
  { category: 'Auth', actions: ['login', 'logout', 'login_failed', 'mfa_enabled', 'mfa_disabled', 'password_reset', 'password_changed', 'pin_reset', 'pin_changed', 'biometric_login', 'session_revoked', 'session_expired'] },
  { category: 'Members', actions: ['member_created', 'member_updated', 'member_suspended', 'member_restricted', 'member_banned', 'member_unsuspended', 'member_unbanned', 'member_archived', 'member_restored', 'member_merged', 'member_reopened', 'member_deleted', 'member_upgraded', 'member_downgraded', 'tier_changed', 'profile_updated'] },
  { category: 'Accounts', actions: ['account_opened', 'account_closed', 'account_frozen', 'account_unfrozen', 'account_hold', 'account_release', 'account_reserve', 'balance_adjusted', 'limits_changed', 'statement_sent'] },
  { category: 'Transactions', actions: ['txn_initiated', 'txn_completed', 'txn_pending', 'txn_failed', 'txn_reversed', 'txn_refunded', 'txn_held', 'txn_released', 'txn_retry', 'txn_cancelled', 'txn_approved', 'txn_rejected', 'txn_modified', 'receipt_resent', 'fraud_review'] },
  { category: 'Cards', actions: ['card_issued', 'card_activated', 'card_frozen', 'card_replaced', 'card_pin_reset', 'card_cancelled', 'card_limit_changed', 'travel_notice_added'] },
  { category: 'Loans', actions: ['loan_applied', 'loan_approved', 'loan_rejected', 'loan_disbursed', 'loan_payment_made', 'loan_restructured', 'loan_defaulted', 'loan_penalty', 'loan_collections', 'loan_paid_off'] },
  { category: 'KYC', actions: ['kyc_submitted', 'kyc_reviewed', 'kyc_approved', 'kyc_rejected', 'kyc_doc_uploaded', 'kyc_doc_verified', 'liveness_check_passed', 'address_verified', 'risk_score_changed', 'aml_screened', 'pep_screened', 'sanctions_screened'] },
  { category: 'Fraud', actions: ['fraud_alert_raised', 'fraud_alert_assigned', 'fraud_investigated', 'fraud_resolved', 'fraud_escalated', 'fraud_false_positive', 'account_blocked_fraud', 'chargeback_filed', 'chargeback_resolved'] },
  { category: 'Compliance', actions: ['compliance_report_generated', 'sar_filed', 'ctr_filed', 'audit_started', 'audit_completed', 'policy_published', 'policy_archived', 'regulation_updated'] },
  { category: 'Admin', actions: ['admin_login', 'admin_role_changed', 'admin_permission_granted', 'admin_permission_revoked', 'impersonation_started', 'impersonation_ended', 'settings_changed', 'feature_flag_toggled', 'maintenance_toggled', 'api_key_created', 'api_key_revoked'] },
];

const allActions = actionTypes.flatMap(g => g.actions);

const severityColors: any = {
  info: 'bg-blue-500/20 text-blue-300',
  warning: 'bg-amber-500/20 text-amber-300',
  critical: 'bg-red-500/20 text-red-300',
  success: 'bg-emerald-500/20 text-emerald-300',
};

export default function Audit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterActor, setFilterActor] = useState('all');
  const [liveMode, setLiveMode] = useState(true);

  useEffect(() => {
    api.auditApi.getAll({ limit: 500 }).then((r: any) => setLogs(r.data || []));
  }, []);

  // Real-time sim
  useEffect(() => {
    if (!liveMode) return;
    const t = setInterval(() => {
      const actions = ['txn_completed', 'login', 'fraud_alert_raised', 'kyc_submitted', 'card_issued', 'password_changed'];
      const a = actions[Math.floor(Math.random() * actions.length)];
      api.auditApi.getAll({ limit: 500, actionType: a }).then((r: any) => {
        if (r.data && r.data.length > 0) {
          setLogs(prev => [...r.data.slice(0, 1), ...prev].slice(0, 500));
        }
      });
    }, 4000);
    return () => clearInterval(t);
  }, [liveMode]);

  const filtered = logs.filter(l =>
    (filterAction === 'all' || l.actionType === filterAction) &&
    (filterSeverity === 'all' || l.severity === filterSeverity) &&
    (filterActor === 'all' || l.actorEmail?.includes(filterActor))
  ).filter(l =>
    !search ||
    l.actorEmail?.toLowerCase().includes(search.toLowerCase()) ||
    l.actionType?.toLowerCase().includes(search.toLowerCase()) ||
    l.resourceType?.toLowerCase().includes(search.toLowerCase()) ||
    l.resourceId?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: logs.length,
    critical: logs.filter(l => l.severity === 'critical').length,
    warnings: logs.filter(l => l.severity === 'warning').length,
    last24h: logs.filter(l => Date.now() - new Date(l.timestamp).getTime() < 24 * 3600 * 1000).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="text-slate-400 mt-1">Real-time immmutable record of every system action</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLiveMode(!liveMode)}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${liveMode ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700'}`}>
            <span className={`w-2 h-2 rounded-full ${liveMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            {liveMode ? 'Live' : 'Paused'}
          </button>
          <button className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Total Events</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Last 24h</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.last24h}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Critical</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.critical}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Warnings</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.warnings}</p>
        </div>
      </div>

      {/* Action categories */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Action types covered ({allActions.length})</h3>
        <div className="flex flex-wrap gap-1.5">
          {actionTypes.map(g => (
            <div key={g.category} className="flex items-center gap-1 mr-2">
              <span className="text-[10px] text-slate-500 uppercase">{g.category}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">{g.actions.length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..."
            className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm">
          <option value="all">All actions ({allActions.length})</option>
          {allActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm">
          <option value="all">All severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
          <option value="success">Success</option>
        </select>
        <select value={filterActor} onChange={(e) => setFilterActor(e.target.value)}
          className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm">
          <option value="all">All actors</option>
          <option value="admin">Admins</option>
          <option value="system">System</option>
          <option value="member">Members</option>
        </select>
      </div>

      {/* Log table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/30 text-slate-400 text-sm">
            <tr>
              <th className="text-left py-3 px-4">Timestamp</th>
              <th className="text-left py-3 px-4">Actor</th>
              <th className="text-left py-3 px-4">Action</th>
              <th className="text-left py-3 px-4">Resource</th>
              <th className="text-left py-3 px-4">IP</th>
              <th className="text-left py-3 px-4">Severity</th>
              <th className="text-left py-3 px-4">Hash</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map(l => (
              <tr key={l.id} className="border-t border-slate-700/50 hover:bg-slate-700/20 text-sm">
                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <div className="text-white">{l.actorEmail || l.actor}</div>
                  <div className="text-xs text-slate-500">{l.actorRole}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-white font-mono">{l.actionType}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="text-slate-300">{l.resourceType}</div>
                  <div className="text-xs text-slate-500 font-mono">{l.resourceId?.slice(0, 12)}...</div>
                </td>
                <td className="py-3 px-4 text-slate-400 font-mono text-xs">{l.ip}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${severityColors[l.severity]}`}>{l.severity}</span>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">{l.hash?.slice(0, 8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
