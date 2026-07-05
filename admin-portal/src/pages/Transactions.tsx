import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, MoreVertical, ArrowDownRight, ArrowUpRight, RefreshCw, X, Pause, CheckCircle, XCircle, FileEdit, Copy, Mail, Upload, AlertOctagon, Send, Edit2, Trash2, Eye, RotateCcw, DollarSign, Repeat, ShieldAlert, Flag } from 'lucide-react';
import * as api from '@/lib/api';

const allTxnTypes = ['deposit', 'withdrawal', 'transfer', 'card_purchase', 'card_refund', 'fee', 'interest', 'loan_disbursement', 'loan_repayment', 'wire_in', 'wire_out', 'reversal'];

const actionMenu: any[] = [
  { id: 'view', label: 'View Details', icon: Eye, group: 'View' },
  { id: 'edit', label: 'Edit Metadata', icon: Edit2, group: 'Edit' },
  { id: 'delete', label: 'Delete (if unposted)', icon: Trash2, group: 'Edit', danger: true },
  { id: 'duplicate', label: 'Duplicate', icon: Copy, group: 'Edit' },
  { id: 'clone', label: 'Clone as Template', icon: Copy, group: 'Edit' },
  { id: 'import_modify', label: 'Import & Modify', icon: Upload, group: 'Edit' },
  { id: 'modify', label: 'Modify Amount/Description', icon: FileEdit, group: 'Edit' },
  { id: 'reverse', label: 'Reverse Transaction', icon: RotateCcw, group: 'Lifecycle', danger: true },
  { id: 'refund', label: 'Issue Refund', icon: DollarSign, group: 'Lifecycle' },
  { id: 'approve', label: 'Approve', icon: CheckCircle, group: 'Lifecycle' },
  { id: 'reject', label: 'Reject', icon: XCircle, group: 'Lifecycle', danger: true },
  { id: 'cancel', label: 'Cancel Pending', icon: X, group: 'Lifecycle', danger: true },
  { id: 'hold', label: 'Place Hold', icon: Pause, group: 'Lifecycle' },
  { id: 'release', label: 'Release Hold', icon: CheckCircle, group: 'Lifecycle' },
  { id: 'retry', label: 'Retry Failed', icon: RefreshCw, group: 'Lifecycle' },
  { id: 'force_post', label: 'Force Complete', icon: ShieldAlert, group: 'Lifecycle', danger: true },
  { id: 'force_pending', label: 'Force to Pending', icon: Pause, group: 'Lifecycle' },
  { id: 'resend_receipt', label: 'Resend Receipt', icon: Mail, group: 'Notify' },
  { id: 'send_sms', label: 'Send SMS Confirmation', icon: Send, group: 'Notify' },
  { id: 'send_push', label: 'Send Push Notification', icon: Send, group: 'Notify' },
  { id: 'fraud_review', label: 'Send to Fraud Review', icon: AlertOctagon, group: 'Risk', danger: true },
  { id: 'mark_fraud', label: 'Flag as Fraud', icon: Flag, group: 'Risk', danger: true },
  { id: 'mark_recurring', label: 'Mark as Recurring', icon: Repeat, group: 'Edit' },
  { id: 'export', label: 'Export to File', icon: Download, group: 'Export' },
];

export default function Transactions() {
  const [txns, setTxns] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.transactionsApi.getAll({ limit: 200 }).then((r: any) => setTxns(r.data || []));
  }, []);

  const filtered = txns.filter(t =>
    (filterType === 'all' || t.txnType === filterType) &&
    (filterStatus === 'all' || t.status === filterStatus) &&
    (!search || t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.memberName?.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: txns.length,
    posted: txns.filter(t => t.status === 'posted').length,
    pending: txns.filter(t => t.status === 'pending').length,
    failed: txns.filter(t => t.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-slate-400 mt-1">Every transaction in OrbitPay — 24 actions available from row menu</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'Posted', value: stats.posted, color: 'emerald' },
          { label: 'Pending', value: stats.pending, color: 'amber' },
          { label: 'Failed', value: stats.failed, color: 'red' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase">{s.label}</p>
            <p className={`text-2xl font-bold text-${s.color}-400 mt-1`}>{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm">
            <option value="all">All types ({allTxnTypes.length})</option>
            {allTxnTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm">
            <option value="all">All status</option>
            <option value="posted">Posted</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
          </select>
          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm">
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">7 days</option>
            <option value="month">30 days</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden relative">
        <table className="w-full">
          <thead className="bg-slate-900/30 text-slate-400 text-sm">
            <tr>
              <th className="text-left py-3 px-4">Txn ID</th>
              <th className="text-left py-3 px-4">Member</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Description</th>
              <th className="text-right py-3 px-4">Amount</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 80).map(t => (
              <tr key={t.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                <td className="py-3 px-4 text-white font-mono text-xs">{t.id.slice(0, 10)}...</td>
                <td className="py-3 px-4 text-slate-200 text-sm">{t.memberName}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 text-xs rounded bg-slate-700 text-slate-300">{t.txnType}</span>
                </td>
                <td className="py-3 px-4 text-slate-300 text-sm">{t.description}</td>
                <td className={`py-3 px-4 text-right font-medium ${t.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                  {t.amount > 0 ? '+' : ''}{t.currency} {Math.abs(t.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    t.status === 'posted' ? 'bg-emerald-500/20 text-emerald-300' :
                    t.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                    t.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                    'bg-slate-700 text-slate-300'
                  }`}>{t.status}</span>
                </td>
                <td className="py-3 px-4 text-slate-400 text-xs whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-right relative">
                  <button onClick={() => { setSelected(t); setMenuOpen(!menuOpen); }}
                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {menuOpen && selected && (
          <div className="absolute right-4 top-16 z-40 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 max-h-[500px] overflow-y-auto">
            <p className="px-3 py-1 text-xs text-slate-400">Txn {selected.id.slice(0, 8)} — {selected.amount} {selected.currency}</p>
            {Object.entries(actionMenu.reduce((acc: any, a) => {
              acc[a.group] = [...(acc[a.group] || []), a];
              return acc;
            }, {})).map(([group, acts]: any) => (
              <div key={group} className="py-1">
                <p className="px-3 py-1 text-[10px] text-slate-500 uppercase font-medium">{group}</p>
                {acts.map((a: any) => (
                  <button key={a.id}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700/50 rounded flex items-center gap-2 ${a.danger ? 'text-red-300' : 'text-slate-200'}`}
                    onClick={() => setMenuOpen(false)}>
                    <a.icon className="w-3.5 h-3.5" /> {a.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
