import { useEffect, useState } from 'react';
import { Briefcase, Plus, Search, CheckCircle, XCircle, DollarSign, Calendar, AlertCircle, TrendingDown, FileText } from 'lucide-react';
import * as api from '@/lib/api';

export default function Loans() {
  const [loans, setLoans] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [form, setForm] = useState({ memberId: '', principal: 10000, termMonths: 12, rate: 8.5, type: 'personal', collateral: '' });

  useEffect(() => {
    api.loansApi.getAll().then((r: any) => setLoans(r.data || []));
    api.membersApi.getAll().then((r: any) => setMembers((r.data || []).slice(0, 100)));
  }, []);

  const filtered = loans.filter(l =>
    (filterStatus === 'all' || l.status === filterStatus) &&
    (!search || l.memberName?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPortfolio = loans.reduce((s, l) => s + (l.outstandingBalance || l.amount || 0), 0);
  const activeValue = loans.filter(l => l.status === 'active').reduce((s, l) => s + (l.outstandingBalance || 0), 0);
  const delinquentValue = loans.filter(l => l.status === 'delinquent').reduce((s, l) => s + (l.outstandingBalance || 0), 0);

  const approve = async (id: string) => {
    await api.loansApi.updateStatus(id, 'active');
    setLoans(loans.map(l => l.id === id ? { ...l, status: 'active' } : l));
  };
  const reject = async (id: string) => {
    await api.loansApi.updateStatus(id, 'rejected');
    setLoans(loans.map(l => l.id === id ? { ...l, status: 'rejected' } : l));
  };
  const disburse = async (id: string) => await api.loansApi.disburse(id);
  const restructure = async (id: string) => await api.loansApi.restructure(id);
  const flag = async (id: string) => await api.loansApi.sendToCollections(id);

  const create = async () => {
    const res: any = await api.loansApi.apply({ ...form, member: members.find((m: any) => m.id === form.memberId) });
    if (res.success) {
      setLoans([res.data, ...loans]);
      setCreateOpen(false);
    }
  };

  const statusColor = (s: string) => ({
    pending: 'bg-amber-500/20 text-amber-300',
    approved: 'bg-blue-500/20 text-blue-300',
    active: 'bg-emerald-500/20 text-emerald-300',
    delinquent: 'bg-orange-500/20 text-orange-300',
    default: 'bg-red-500/20 text-red-300',
    paid_off: 'bg-purple-500/20 text-purple-300',
    rejected: 'bg-slate-700 text-slate-300',
  }[s] || 'bg-slate-700 text-slate-300');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Loans</h1>
          <p className="text-slate-400 mt-1">Apply, approve, disburse, restructure, collections</p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Loan Application
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase">Total Portfolio</p>
          <p className="text-2xl font-bold text-white mt-1">${(totalPortfolio / 1e6).toFixed(2)}M</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase">Active</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">${(activeValue / 1e6).toFixed(2)}M</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase">Delinquent</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">${(delinquentValue / 1e6).toFixed(2)}M</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase">Default</p>
          <p className="text-2xl font-bold text-red-400 mt-1">${((totalPortfolio - activeValue - delinquentValue) / 1e6).toFixed(2)}M</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by member..."
            className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm">
          <option value="all">All status</option>
          {['pending', 'approved', 'active', 'delinquent', 'default', 'paid_off', 'rejected'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/30 text-slate-400 text-sm">
            <tr>
              <th className="text-left py-3 px-4">Loan ID</th>
              <th className="text-left py-3 px-4">Member</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-right py-3 px-4">Principal</th>
              <th className="text-right py-3 px-4">Outstanding</th>
              <th className="text-right py-3 px-4">Rate</th>
              <th className="text-left py-3 px-4">Next Payment</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map(l => (
              <tr key={l.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                <td className="py-3 px-4 text-white font-mono text-xs">{l.id?.slice(0, 10)}...</td>
                <td className="py-3 px-4 text-slate-200 text-sm">{l.memberName}</td>
                <td className="py-3 px-4 text-slate-300 text-sm capitalize">{l.loanType || l.type}</td>
                <td className="py-3 px-4 text-right text-white">${(l.principal || l.amount || 0).toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-slate-300">${(l.outstandingBalance || 0).toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-slate-300">{l.interestRate}%</td>
                <td className="py-3 px-4 text-slate-400 text-sm">{l.nextPaymentDate ? new Date(l.nextPaymentDate).toLocaleDateString() : '—'}</td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 text-xs rounded-full ${statusColor(l.status)}`}>{l.status}</span></td>
                <td className="py-3 px-4 text-right">
                  <div className="flex gap-1 justify-end">
                    {l.status === 'pending' && (
                      <>
                        <button onClick={() => approve(l.id)} className="p-1.5 text-emerald-400 hover:bg-slate-700 rounded">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => reject(l.id)} className="p-1.5 text-red-400 hover:bg-slate-700 rounded">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {l.status === 'approved' && (
                      <button onClick={() => disburse(l.id)} className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded">
                        Disburse
                      </button>
                    )}
                    {l.status === 'active' && (
                      <>
                        <button onClick={() => restructure(l.id)} className="p-1.5 text-blue-400 hover:bg-slate-700 rounded" title="Restructure">
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button onClick={() => flag(l.id)} className="p-1.5 text-orange-400 hover:bg-slate-700 rounded" title="Collections">
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button className="p-1.5 text-slate-400 hover:bg-slate-700 rounded">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setCreateOpen(false)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700"><h2 className="text-xl font-bold text-white">New Loan Application</h2></div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Member</label>
                <select value={form.memberId} onChange={(e) => setForm({...form, memberId: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
                  <option value="">Select member...</option>
                  {members.map((m: any) => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                  <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
                    {['personal', 'auto', 'mortgage', 'business', 'student', 'home_equity'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Principal ($)</label>
                  <input type="number" value={form.principal} onChange={(e) => setForm({...form, principal: +e.target.value})}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Term (months)</label>
                  <input type="number" value={form.termMonths} onChange={(e) => setForm({...form, termMonths: +e.target.value})}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Interest Rate (%)</label>
                  <input type="number" step="0.1" value={form.rate} onChange={(e) => setForm({...form, rate: +e.target.value})}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Collateral (optional)</label>
                <input value={form.collateral} onChange={(e) => setForm({...form, collateral: e.target.value})}
                  placeholder="Vehicle, property, savings..."
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500" />
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-sm text-slate-300">
                <p className="text-xs text-slate-400 uppercase mb-1">Estimated monthly payment</p>
                <p className="text-xl font-bold text-white">
                  ${((form.principal * (form.rate / 100 / 12)) / (1 - Math.pow(1 + form.rate / 100 / 12, -form.termMonths))).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-2">
              <button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">Cancel</button>
              <button onClick={create} disabled={!form.memberId} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">Submit Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
