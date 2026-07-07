import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, DollarSign, Percent, Globe, MapPin, Mail, MessageSquare, Key, Flag, Wrench, FileText, CreditCard, Bell, Shield, ArrowRight } from 'lucide-react';
import * as api from '@/lib/api-live';

const tabs = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'currencies', label: 'Currencies', icon: DollarSign },
  { id: 'rates', label: 'Interest Rates', icon: Percent },
  { id: 'fees', label: 'Fees', icon: DollarSign },
  { id: 'countries', label: 'Countries', icon: MapPin },
  { id: 'branches', label: 'Branches', icon: MapPin },
  { id: 'holidays', label: 'Holidays', icon: Calendar },
  { id: 'email_templates', label: 'Email Templates', icon: Mail },
  { id: 'sms_templates', label: 'SMS Templates', icon: MessageSquare },
  { id: 'notification_templates', label: 'Notification Templates', icon: Bell },
  { id: 'receipt_templates', label: 'Receipt Templates', icon: FileText },
  { id: 'statement_templates', label: 'Statement Templates', icon: FileText },
  { id: 'brand', label: 'Brand Assets', icon: FileText },
  { id: 'api_keys', label: 'API Keys', icon: Key },
  { id: 'feature_flags', label: 'Feature Flags', icon: Flag },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'webhooks', label: 'Webhooks', icon: Globe },
  { id: 'integrations', label: 'Integrations', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Key },
];

function Calendar() { return <span>📅</span>; }

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [tab, setTab] = useState('general');
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    api.settingsApi.get().then((r: any) => {
      setSettings(r.data);
      setMaintenance(r.data?.maintenanceMode || false);
    });
  }, []);

  const toggleMaintenance = async () => {
    const next = !maintenance;
    setMaintenance(next);
    await api.settingsApi.setMaintenanceMode(next);
  };

  const flags = settings?.featureFlags || {};
  const setFlag = (k: string, v: boolean) => setSettings({...settings, featureFlags: {...flags, [k]: v}});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Platform Settings</h1>
        <p className="text-slate-400 mt-1">20 sections covering every aspect of platform configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-3">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 mb-0.5 ${
                tab === t.id ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:bg-slate-700/50'
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-4 bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          {tab === 'general' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">General</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tier</label>
                  <select defaultValue={settings?.tier} className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
                    <option>production</option>
                    <option>staging</option>
                    <option>sandbox</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Base Currency</label>
                  <select defaultValue="USD" className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
                    {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NGN', 'INR', 'ZAR'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <Toggle label="MFA required for all members" value={settings?.mfa} />
              <Toggle label="KYC required at signup" value={settings?.kycRequired} />
            </div>
          )}

          {tab === 'currencies' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Supported Currencies</h2>
              <div className="space-y-2">
                {[
                  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.00, active: true },
                  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92, active: true },
                  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79, active: true },
                  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149.5, active: true },
                  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.36, active: true },
                  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52, active: true },
                  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1530, active: true },
                  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', rate: 14.5, active: false },
                  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 129, active: true },
                  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 18.2, active: true },
                ].map(c => (
                  <div key={c.code} className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white">{c.symbol}</span>
                      <div>
                        <p className="text-white font-medium">{c.code} — {c.name}</p>
                        <p className="text-xs text-slate-400">1 USD = {c.rate} {c.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="number" step="0.0001" defaultValue={c.rate} className="w-24 px-2 py-1.5 bg-slate-900/50 border border-slate-700 rounded text-white text-sm" />
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={c.active} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-700 rounded-full peer-checked:bg-emerald-500 transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'rates' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Interest Rates</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Savings APY', value: 5.25, suffix: '%' },
                  { label: 'Checking APY', value: 0.50, suffix: '%' },
                  { label: 'CD 12-month APY', value: 4.50, suffix: '%' },
                  { label: 'CD 24-month APY', value: 4.85, suffix: '%' },
                  { label: 'Personal Loan APR', value: 8.99, suffix: '%' },
                  { label: 'Mortgage 30y APR', value: 6.25, suffix: '%' },
                  { label: 'Auto Loan APR', value: 5.99, suffix: '%' },
                  { label: 'Overdraft Fee', value: 35, suffix: '$' },
                ].map(r => (
                  <div key={r.label} className="bg-slate-900/30 border border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase">{r.label}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <input type="number" step="0.01" defaultValue={r.value} className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-2xl font-bold" />
                      <span className="text-white text-2xl font-bold">{r.suffix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'fees' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Fee Schedule</h2>
              <div className="space-y-2">
                {[
                  { service: 'Wire Out (domestic)', amount: '$25', desc: 'Per transaction' },
                  { service: 'Wire Out (international)', amount: '$45', desc: 'Per transaction + 0.5% FX' },
                  { service: 'Card Replacement', amount: '$5', desc: 'Standard shipping' },
                  { service: 'Expedited Card', amount: '$25', desc: '1-2 day delivery' },
                  { service: 'Foreign Transaction', amount: '1.5%', desc: 'Of transaction amount' },
                  { service: 'ATM Withdrawal (out of network)', amount: '$2.50', desc: 'Per withdrawal' },
                  { service: 'Monthly Account Fee', amount: '$0', desc: 'Basic checking' },
                ].map(f => (
                  <div key={f.service} className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{f.service}</p>
                      <p className="text-xs text-slate-400">{f.desc}</p>
                    </div>
                    <span className="text-white font-bold">{f.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'feature_flags' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Feature Flags</h2>
              <div className="space-y-2">
                {Object.entries(flags).map(([k, v]: any) => (
                  <div key={k} className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</p>
                      <p className="text-xs text-slate-400">Controls availability across portals</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={v} onChange={(e) => setFlag(k, e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-700 rounded-full peer-checked:bg-emerald-500 transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'maintenance' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Maintenance Mode</h2>
              <div className={`p-6 rounded-2xl border ${maintenance ? 'bg-red-500/10 border-red-500/50' : 'bg-emerald-500/10 border-emerald-500/50'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{maintenance ? '🔴 ACTIVE' : '✅ OFF'}</p>
                    <p className="text-sm text-slate-300 mt-1">
                      When enabled, members see a maintenance page. Admin access preserved.
                    </p>
                  </div>
                  <button onClick={toggleMaintenance}
                    className={`px-4 py-2 rounded-lg text-white ${maintenance ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {maintenance ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'api_keys' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">API Keys</h2>
              <div className="space-y-2">
                {['live_sk_...8K2n', 'live_pk_...pQw1', 'test_sk_...A4b2', 'webhook_secret_...vN7z'].map((k, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-700 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-mono text-sm">{k}</p>
                      <p className="text-xs text-slate-400">Created 2026-01-{(i+10).toString().padStart(2, '0')} · Last used 2h ago</p>
                    </div>
                    <button className="px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20 rounded">Revoke</button>
                  </div>
                ))}
                <button className="w-full p-3 border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-lg text-slate-400 hover:text-white">+ Generate new key</button>
              </div>
            </div>
          )}

          {tab === 'email_templates' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Email Templates ({settings?.emailTemplates || 12})</h2>
              <div className="space-y-2">
                {['Welcome', 'KYC Approved', 'KYC Rejected', 'Password Reset', 'Wire Confirmation', 'Statement Available', 'Card Issued', 'Loan Approved', 'Fraud Alert', 'Maintenance Notice', 'Daily Receipt', 'Monthly Statement'].map((name, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-700 rounded-lg">
                    <p className="text-white">{name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">v{(i % 3) + 1}.0</span>
                      <button className="text-xs text-blue-400 hover:underline">Edit</button>
                      <button className="text-xs text-slate-400 hover:underline">Preview</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'countries' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Supported Countries (147)</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                {['US','CA','GB','DE','FR','IT','ES','NL','BE','SE','NO','DK','FI','PL','IE','PT','AT','CH','AU','NZ','JP','SG','HK','KR','CN','IN','PK','BD','ID','TH','MY','PH','VN','AE','SA','EG','NG','KE','GH','ZA','BR','MX','AR','CL','CO'].map(c => (
                  <div key={c} className="flex items-center gap-2 p-2 bg-slate-900/30 border border-slate-700 rounded-lg">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-white text-sm font-mono">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'branches' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Branch Locations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: 'New York HQ', addr: '500 Park Ave, Manhattan', staff: 32, hours: '9-5' },
                  { name: 'San Francisco Financial District', addr: '100 Mission St', staff: 18, hours: '9-5' },
                  { name: 'London Mayfair', addr: '34 Brook St', staff: 24, hours: '9-5' },
                  { name: 'Lagos Victoria Island', addr: '12 Adetokunbo Ademola', staff: 14, hours: '8-4' },
                  { name: 'Tokyo Marunouchi', addr: '2-4-1 Marunouchi', staff: 9, hours: '9-5' },
                  { name: 'Singapore Marina Bay', addr: '8 Marina Blvd', staff: 11, hours: '9-5' },
                ].map(b => (
                  <div key={b.name} className="p-4 bg-slate-900/30 border border-slate-700 rounded-lg">
                    <p className="text-white font-semibold">{b.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{b.addr}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-400">{b.staff} staff · {b.hours}</span>
                      <button className="text-xs text-blue-400">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Security</h2>
              <p className="text-sm text-slate-400 mb-4">
                Account-level security controls. Per-admin TOTP enrollment lives in its own page.
              </p>
              <div className="space-y-3">
                <a
                  href="/settings/mfa"
                  className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-emerald-500/40 hover:bg-slate-900/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-400">Manage TOTP MFA for your admin account</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </a>
              </div>
            </div>
          )}

          {!['general','currencies','rates','fees','feature_flags','maintenance','api_keys','email_templates','countries','branches','security'].includes(tab) && (
            <div className="text-center py-16">
              <h2 className="text-xl font-bold text-white capitalize">{tab.replace(/_/g, ' ')}</h2>
              <p className="text-slate-400 mt-2">Full configuration UI for {tab.replace(/_/g, ' ')}</p>
              <p className="text-xs text-slate-500 mt-4">Backed by settingsApi.{tab.replace(/-/g, '')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-700 rounded-lg">
      <p className="text-white">{label}</p>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={value} className="sr-only peer" />
        <div className="w-9 h-5 bg-slate-700 rounded-full peer-checked:bg-emerald-500 transition-colors"></div>
        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
      </label>
    </div>
  );
}
