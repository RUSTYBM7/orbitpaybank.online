import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Upload, Search, Eye, CheckCircle, XCircle, Clock, AlertCircle, User, Camera, ScanLine, FileCheck, ScrollText, MapPin } from 'lucide-react';
import * as api from '@/lib/api';

const docTypes = [
  { id: 'passport', label: 'Passport', icon: FileText },
  { id: 'national_id', label: 'National ID', icon: FileCheck },
  { id: 'drivers_license', label: 'Driver License', icon: FileText },
  { id: 'address_proof', label: 'Address Proof (utility bill)', icon: MapPin },
  { id: 'bank_statement', label: 'Bank Statement', icon: ScrollText },
  { id: 'proof_of_income', label: 'Proof of Income (pay stub / 1099)', icon: FileText },
  { id: 'tax_return', label: 'Tax Return', icon: ScrollText },
  { id: 'selfie', label: 'Selfie + Liveness', icon: Camera },
];

export default function KYC() {
  const [apps, setApps] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    api.kycApi.getAll().then((r: any) => {
      const list = r.data || [];
      setApps(list);
      setSelected(list[0]);
    });
  }, []);

  const filtered = apps.filter(a =>
    (filterStatus === 'all' || a.status === filterStatus) &&
    (!search || `${a.firstName} ${a.lastName}`.toLowerCase().includes(search.toLowerCase()))
  );

  const approve = async (id: string) => {
    await api.kycApi.updateStatus(id, 'approved');
    setApps(apps.map(a => a.id === id ? { ...a, status: 'approved' } : a));
  };
  const reject = async (id: string) => {
    await api.kycApi.updateStatus(id, 'rejected');
    setApps(apps.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">KYC / Identity Verification</h1>
        <p className="text-slate-400 mt-1">Review documents, OCR confidence, liveness, risk scoring</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {['pending', 'in_review', 'approved', 'rejected', 'expired'].map(s => {
          const count = apps.filter(a => a.status === s).length;
          return (
            <div key={s} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase">{s.replace('_', ' ')}</p>
              <p className="text-2xl font-bold text-white mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="p-4 border-b border-slate-700 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applications..."
                className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm">
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="max-h-[700px] overflow-y-auto">
            {filtered.map(a => (
              <button key={a.id} onClick={() => setSelected(a)}
                className={`w-full text-left p-3 border-b border-slate-700/50 hover:bg-slate-700/30 flex items-start gap-3 ${selected?.id === a.id ? 'bg-slate-700/40 border-l-2 border-l-emerald-500' : ''}`}>
                <img src={a.avatar} alt="" className="w-9 h-9 rounded-full bg-slate-700" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{a.firstName} {a.lastName}</span>
                    {a.status === 'approved' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {a.status === 'rejected' && <XCircle className="w-4 h-4 text-red-400" />}
                    {a.status === 'pending' && <Clock className="w-4 h-4 text-amber-400" />}
                    {a.status === 'in_review' && <AlertCircle className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-xs text-slate-400">{a.country} · Risk: {a.riskScore}</p>
                  <p className="text-[10px] text-slate-500">Submitted: {new Date(a.submittedAt).toLocaleDateString()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <img src={selected.avatar} alt="" className="w-14 h-14 rounded-full bg-slate-700" />
                  <div>
                    <h2 className="text-xl font-bold text-white">{selected.firstName} {selected.lastName}</h2>
                    <p className="text-sm text-slate-400">{selected.email} · {selected.phone}</p>
                    <p className="text-xs text-slate-500 mt-1">DOB: {selected.dob} · {selected.country}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Risk Score</p>
                  <p className={`text-2xl font-bold ${selected.riskScore < 30 ? 'text-emerald-400' : selected.riskScore < 70 ? 'text-amber-400' : 'text-red-400'}`}>{selected.riskScore}/100</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-900/30 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase">AML Screened</p>
                  <p className={`text-sm font-medium mt-1 ${selected.amlScreened ? 'text-emerald-400' : 'text-slate-500'}`}>{selected.amlScreened ? '✓ Passed' : 'Pending'}</p>
                </div>
                <div className="bg-slate-900/30 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase">PEP Check</p>
                  <p className={`text-sm font-medium mt-1 ${selected.pepCleared ? 'text-emerald-400' : 'text-amber-400'}`}>{selected.pepCleared ? '✓ Cleared' : 'Review'}</p>
                </div>
                <div className="bg-slate-900/30 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase">Sanctions</p>
                  <p className={`text-sm font-medium mt-1 ${selected.sanctionsCleared ? 'text-emerald-400' : 'text-red-400'}`}>{selected.sanctionsCleared ? '✓ Cleared' : 'Hit'}</p>
                </div>
                <div className="bg-slate-900/30 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase">Liveness</p>
                  <p className="text-sm font-medium mt-1 text-emerald-400">✓ Pass</p>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <button onClick={() => approve(selected.id)} disabled={selected.status === 'approved'}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => reject(selected.id)} disabled={selected.status === 'rejected'}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button className="px-4 py-2 bg-amber-500 text-white rounded-lg">Request More Info</button>
                <button className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg">Add Note</button>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Submitted Documents</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {docTypes.map(d => {
                    const has = ['passport', 'national_id', 'address_proof', 'selfie'].includes(d.id);
                    return (
                      <div key={d.id} className={`p-3 rounded-xl border ${has ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/30 border-slate-700'}`}>
                        <d.icon className={`w-5 h-5 mb-2 ${has ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <p className="text-xs text-slate-300 truncate">{d.label}</p>
                        {has ? (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>OCR confidence</span>
                              <span className="text-emerald-400">96%</span>
                            </div>
                            <div className="h-1 mt-1 bg-slate-700 rounded">
                              <div className="h-full bg-emerald-500 rounded" style={{ width: '96%' }} />
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-500 mt-1">Not submitted</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-white mb-3">Compliance Notes</h3>
                <textarea rows={2} placeholder="Add notes for this application..."
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm resize-none" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
