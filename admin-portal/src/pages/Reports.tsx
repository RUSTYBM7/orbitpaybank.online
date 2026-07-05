import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, BarChart3, TrendingUp, Users, DollarSign, AlertTriangle, FileCheck, CreditCard, Send, Globe, Banknote, Filter, Calendar } from 'lucide-react';

const reportTypes = [
  { id: 'financial', label: 'Financial Summary', desc: 'Revenue, profit, balance sheet', icon: DollarSign, color: 'emerald', freq: 'Daily · Monthly · Quarterly' },
  { id: 'compliance', label: 'Compliance Report', desc: 'Regulatory filings, AML, KYC', icon: FileCheck, color: 'blue', freq: 'Monthly · Quarterly · Annual' },
  { id: 'user', label: 'User Activity', desc: 'Logins, sessions, feature usage', icon: Users, color: 'cyan', freq: 'Weekly · Monthly' },
  { id: 'audit', label: 'Audit Trail', desc: 'All admin actions + system events', icon: FileText, color: 'amber', freq: 'On-demand' },
  { id: 'revenue', label: 'Revenue Report', desc: 'Fee income, interest spread, FX', icon: TrendingUp, color: 'emerald', freq: 'Daily · Monthly · YTD' },
  { id: 'kyc', label: 'KYC Verification', desc: 'Approved/rejected/pending by type', icon: FileCheck, color: 'purple', freq: 'Weekly · Monthly' },
  { id: 'fraud', label: 'Fraud Analytics', desc: 'Alerts, chargebacks, SAR/CTR', icon: AlertTriangle, color: 'red', freq: 'On-demand' },
  { id: 'card', label: 'Card Performance', desc: 'Spend, interchange, networks', icon: CreditCard, color: 'cyan', freq: 'Monthly' },
  { id: 'transfer', label: 'Transfer Volume', desc: 'Internal/external/wire breakdown', icon: Send, color: 'blue', freq: 'Daily · Monthly' },
  { id: 'tax', label: 'Tax & Withholding', desc: '1099-INT, FATCA, withholding tax', icon: Banknote, color: 'amber', freq: 'Annual · Quarterly' },
  { id: 'global', label: 'Global Settlement', desc: 'Multi-currency, netting, nostro', icon: Globe, color: 'purple', freq: 'Monthly' },
];

const recentReports = [
  { id: 'RPT-2025-0142', name: 'Financial Summary March 2025', type: 'financial', generated: '2025-03-31', size: '2.4 MB', status: 'sent', recipients: 12 },
  { id: 'RPT-2025-0141', name: 'AML Compliance Q1 2025', type: 'compliance', generated: '2025-03-31', size: '1.8 MB', status: 'sent', recipients: 5 },
  { id: 'RPT-2025-0140', name: 'Fraud Analytics Feb 2025', type: 'fraud', generated: '2025-03-15', size: '4.2 MB', status: 'archived', recipients: 3 },
  { id: 'RPT-2025-0139', name: 'Audit Trail - user aisha.okoro', type: 'audit', generated: '2025-03-15', size: '890 KB', status: 'sent', recipients: 1 },
  { id: 'RPT-2025-0138', name: 'Tax Withholding 2024 Annual', type: 'tax', generated: '2025-01-31', size: '12.7 MB', status: 'sent', recipients: 247 },
];

export default function Reports() {
  const [activeType, setActiveType] = useState('financial');
  const [period, setPeriod] = useState('last-month');
  const [format, setFormat] = useState('PDF');
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports Center</h1>
          <p className="text-slate-400 mt-1">Generate, schedule, and export 11 categories of operational reports</p>
        </div>
        <button onClick={generate} disabled={generating}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50">
          {generating ? <><span className="animate-spin">⚙</span> Generating...</> : <><BarChart3 className="w-4 h-4" /> Generate Report</>}
        </button>
      </div>

      {/* Report types grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {reportTypes.map((rt) => (
          <button key={rt.id} onClick={() => setActiveType(rt.id)}
            className={`text-left p-4 rounded-2xl border transition-all ${
              activeType === rt.id
                ? `bg-${rt.color}-500/10 border-${rt.color}-500/50 ring-1 ring-${rt.color}-500/30`
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}>
            <rt.icon className={`w-6 h-6 text-${rt.color}-400 mb-2`} />
            <h3 className="text-sm font-semibold text-white">{rt.label}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{rt.desc}</p>
            <p className="text-[10px] text-slate-500 mt-2">{rt.freq}</p>
          </button>
        ))}
      </div>

      {/* Configure */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Configure Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2"><Calendar className="w-3.5 h-3.5 inline" /> Period</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
              <option value="last-day">Last 24 hours</option>
              <option value="last-week">Last 7 days</option>
              <option value="last-month">Last 30 days</option>
              <option value="last-quarter">Last quarter</option>
              <option value="last-year">Last 12 months</option>
              <option value="ytd">Year to date</option>
              <option value="custom">Custom range...</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2"><FileText className="w-3.5 h-3.5 inline" /> Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
              <option>PDF</option>
              <option>PDF Watermarked</option>
              <option>CSV</option>
              <option>Excel</option>
              <option>JSON</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2"><Filter className="w-3.5 h-3.5 inline" /> Filters</label>
            <div className="flex flex-wrap gap-1.5">
              {['All branches', 'Tier 1', 'USD only', 'Exclude test'].map(f => (
                <span key={f} className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent reports */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Reports</h2>
          <div className="text-sm text-slate-400">{recentReports.length} generated this month</div>
        </div>
        <table className="w-full">
          <thead className="bg-slate-900/30 text-slate-400 text-sm">
            <tr>
              <th className="text-left py-3 px-4">Report ID</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Generated</th>
              <th className="text-right py-3 px-4">Size</th>
              <th className="text-right py-3 px-4">Recipients</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentReports.map(r => (
              <tr key={r.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                <td className="py-3 px-4 text-white font-mono text-sm">{r.id}</td>
                <td className="py-3 px-4 text-slate-200">{r.name}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 text-xs rounded bg-slate-700 text-slate-300 capitalize">{r.type}</span>
                </td>
                <td className="py-3 px-4 text-slate-400 text-sm">{r.generated}</td>
                <td className="py-3 px-4 text-right text-slate-300 text-sm">{r.size}</td>
                <td className="py-3 px-4 text-right text-slate-300 text-sm">{r.recipients}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${r.status === 'sent' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>{r.status}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-white"><Download className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
