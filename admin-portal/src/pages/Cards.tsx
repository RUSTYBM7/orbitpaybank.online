import { useEffect, useState } from 'react';
import { CreditCard, Plus, Search, Lock, Unlock, RefreshCw, MapPin, Eye, Copy, MoreVertical } from 'lucide-react';
import * as api from '@/lib/api';

const cardNetworks = ['Visa', 'Mastercard', 'Amex', 'Discover'];
const cardTypes = ['Debit', 'Credit', 'Corporate', 'Prepaid'];

export default function Cards() {
  const [cards, setCards] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterNetwork, setFilterNetwork] = useState('all');
  const [issueOpen, setIssueOpen] = useState(false);
  const [form, setForm] = useState({ memberId: '', type: 'Debit', network: 'Visa', variant: 'virtual' });
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    api.cardsApi.getAll().then((r: any) => setCards(r.data || []));
    api.membersApi.getAll().then((r: any) => setMembers((r.data || []).slice(0, 100)));
  }, []);

  const filtered = cards.filter(c =>
    (filterNetwork === 'all' || c.network === filterNetwork) &&
    (!search || c.memberName?.toLowerCase().includes(search.toLowerCase()) || c.last4?.includes(search))
  );

  const issue = async () => {
    if (!form.memberId) return;
    const res: any = await api.cardsApi.issue({ ...form, member: members.find((m: any) => m.id === form.memberId) });
    if (res.success) {
      setCards([res.data, ...cards]);
      setIssueOpen(false);
    }
  };

  const toggleFreeze = async (id: string) => {
    await api.cardsApi.freeze(id);
    setCards(cards.map(c => c.id === id ? { ...c, status: c.status === 'frozen' ? 'active' : 'frozen' } : c));
  };
  const replace = async (id: string) => await api.cardsApi.replace(id);
  const pinReset = async (id: string) => await api.cardsApi.resetPin(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Cards Management</h1>
          <p className="text-slate-400 mt-1">Issue, freeze, replace, set travel notices, reset PIN</p>
        </div>
        <button onClick={() => setIssueOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Issue Card
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Cards', value: cards.length, color: 'blue' },
          { label: 'Active', value: cards.filter((c: any) => c.status === 'active').length, color: 'emerald' },
          { label: 'Frozen', value: cards.filter((c: any) => c.status === 'frozen').length, color: 'cyan' },
          { label: 'Replacement Pending', value: cards.filter((c: any) => c.replacementPending).length, color: 'amber' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase">{s.label}</p>
            <p className={`text-2xl font-bold text-${s.color}-400 mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by member or last 4..."
            className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm" />
        </div>
        <select value={filterNetwork} onChange={(e) => setFilterNetwork(e.target.value)}
          className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm">
          <option value="all">All networks</option>
          {cardNetworks.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <div className="text-sm text-slate-400 flex items-center">
          {cardTypes.map(t => <span key={t} className="px-2 py-1 bg-slate-700 rounded text-xs mr-1">{t}</span>)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, 30).map(c => (
          <div key={c.id} className={`rounded-2xl p-5 relative overflow-hidden ${
            c.status === 'frozen'
              ? 'bg-gradient-to-br from-cyan-900/40 to-slate-900 border border-cyan-700/30'
              : 'bg-gradient-to-br from-slate-700/60 to-slate-900 border border-slate-700'
          }`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-slate-300 uppercase">{c.network} {c.type}</p>
                <p className="text-lg text-white font-bold">{c.memberName}</p>
              </div>
              <div className="w-10 h-7 bg-gradient-to-r from-amber-300 to-yellow-500 rounded-md" />
            </div>
            <div className="font-mono text-white tracking-wider text-sm">
              **** **** **** {c.last4}
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Expires</p>
                <p className="text-sm text-white">{c.expiry}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                c.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
              }`}>{c.status}</span>
            </div>
            <div className="flex gap-1 mt-3">
              <button onClick={() => toggleFreeze(c.id)}
                className="flex-1 py-1.5 text-xs bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center gap-1">
                {c.status === 'frozen' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {c.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
              </button>
              <button onClick={() => replace(c.id)} className="flex-1 py-1.5 text-xs bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center gap-1">
                <RefreshCw className="w-3 h-3" />Replace
              </button>
              <button onClick={() => pinReset(c.id)} className="flex-1 py-1.5 text-xs bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center gap-1">
                <Eye className="w-3 h-3" />PIN
              </button>
              <button className="flex-1 py-1.5 text-xs bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />Travel
              </button>
            </div>
          </div>
        ))}
      </div>

      {issueOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setIssueOpen(false)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Issue New Card</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Member</label>
                <select value={form.memberId} onChange={(e) => setForm({...form, memberId: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
                  <option value="">Select member...</option>
                  {members.map((m: any) => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {cardTypes.map(t => (
                    <label key={t} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer ${form.type === t ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-900/30 border-slate-700'}`}>
                      <input type="radio" checked={form.type === t} onChange={() => setForm({...form, type: t})} />
                      <span className="text-sm text-white">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Network</label>
                <div className="grid grid-cols-2 gap-2">
                  {cardNetworks.map(n => (
                    <label key={n} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer ${form.network === n ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-900/30 border-slate-700'}`}>
                      <input type="radio" checked={form.network === n} onChange={() => setForm({...form, network: n})} />
                      <span className="text-sm text-white">{n}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Variant</label>
                <div className="grid grid-cols-2 gap-2">
                  {['virtual', 'physical'].map(v => (
                    <label key={v} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer ${form.variant === v ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-900/30 border-slate-700'}`}>
                      <input type="radio" checked={form.variant === v} onChange={() => setForm({...form, variant: v})} />
                      <span className="text-sm text-white capitalize">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-2">
              <button onClick={() => setIssueOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg">Cancel</button>
              <button onClick={issue} disabled={!form.memberId} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">Issue Card</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
