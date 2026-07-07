// OrbitPay Admin Portal — Enterprise Sign In
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Shield, AlertCircle, Loader2,
  Server, KeyRound, Activity, Cpu, BarChart3, Users, Clock,
  ChevronLeft, Globe, Lock as LockIcon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const statuses = [
  { name: 'API', status: 'operational', value: '99.98%' },
  { name: 'Payments', status: 'operational', value: '99.99%' },
  { name: 'Auth', status: 'operational', value: '99.97%' },
  { name: 'Ledger', status: 'operational', value: '100.00%' },
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const { currentAdmin, login, verifyMFA, loginDemo, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('admin@orbitpay.demo');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stage, setStage] = useState<'creds' | 'mfa'>('creds');

  useEffect(() => {
    if (currentAdmin) navigate('/dashboard');
  }, [currentAdmin]);

  const handleCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      // FIX-14: if the admin doesn't have MFA enabled, login completes immediately.
      // If MFA is enabled, move to the MFA challenge stage.
      if (result?.success && !result?.requiresMFA) {
        navigate('/dashboard');
      } else if (result?.success && result?.requiresMFA) {
        setStage('mfa');
      }
    } catch {}
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    // FIX-14: wire to the real verifyMFA action from authStore.
    // Falls back to the demo "any 6 digits" path only when explicitly opted-in
    // (VITE_DEMO_ACCEPT_ANY_MFA=true in admin-portal/.env.local).
    const acceptAny =
      (import.meta.env.VITE_DEMO_ACCEPT_ANY_MFA as string | undefined) === 'true';
    if (acceptAny && mfaCode.length === 6) {
      navigate('/dashboard');
      return;
    }
    const result = await verifyMFA(mfaCode);
    if (result?.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex relative overflow-hidden">
      {/* Left: Login */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Brand */}
          <Link to="https://orbitpaybank.online" className="inline-flex items-center gap-2.5 mb-10 text-slate-400 hover:text-white transition">
            <ChevronLeft className="w-4 h-4" /> Back to OrbitPay
          </Link>

          <div className="flex items-center gap-2.5 mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur-md opacity-60" />
              <div className="relative w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-xl">
                <Server className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">OrbitPay Admin</p>
              <p className="text-cyan-400 text-xs font-medium tracking-wider uppercase">Enterprise Console</p>
            </div>
          </div>

          {/* Stages */}
          {stage === 'creds' && (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Sign In</h1>
              <p className="text-slate-400 mb-8">
                Authorized administrators only. All sessions are logged and monitored.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleCreds} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Work email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      required className="w-full pl-12 pr-4 py-3.5 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
                      placeholder="admin@orbitpay.demo" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-300">Password</label>
                    <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      required className="w-full pl-12 pr-12 py-3.5 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
                      placeholder="Enter your password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 text-white font-bold rounded-xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>) : (<>Continue <ArrowRight className="w-5 h-5" /></>)}
                </button>

                <button type="button" onClick={async () => { await loginDemo(); navigate('/dashboard'); }}
                  className="w-full py-3 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition text-sm">
                  Use demo admin account
                </button>
              </form>
            </>
          )}

          {stage === 'mfa' && (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">Two-factor authentication</h1>
              <p className="text-slate-400 mb-8">
                Enter the 6-digit code from your authenticator app for <span className="text-white">{email}</span>.
              </p>

              <form onSubmit={handleMfa} className="space-y-5">
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input key={i} type="text" maxLength={1}
                      value={mfaCode[i] || ''}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
                        const newCode = mfaCode.split('');
                        newCode[i] = v;
                        setMfaCode(newCode.join(''));
                        if (v && e.target.nextElementSibling && (e.target.nextElementSibling as HTMLInputElement).type === 'text') {
                          (e.target.nextElementSibling as HTMLInputElement).focus();
                        }
                      }}
                      className="w-12 h-14 bg-slate-900/70 border border-slate-800 rounded-xl text-white text-2xl font-bold text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition" />
                  ))}
                </div>
                <button type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2">
                  Verify & Login <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-center text-xs text-slate-500">
                  Enter the 6-digit code from your authenticator app. To accept any 6 digits in dev mode, set <code className="text-slate-400">VITE_DEMO_ACCEPT_ANY_MFA=true</code> in admin-portal/.env.local.
                </p>
              </form>
            </>
          )}

          <div className="mt-10 pt-8 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center">
              Protected by enterprise-grade encryption. All access is logged.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right: System status + stats */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-blue-900/40 via-slate-900 to-cyan-900/30 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 mb-8">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-blue-300">SOC2 Type II · ISO 27001 · PCI DSS Level 1</span>
            </div>

            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Run OrbitPay from a <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">mission control</span> built for enterprise.
            </h2>

            <p className="text-lg text-slate-300 mb-12">
              Manage 12,847 members, 5,234 accounts, and 8,421 daily transactions — all from one secure console.
            </p>

            {/* Live status */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">System status</h3>
                <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  All systems operational
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {statuses.map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="text-sm text-slate-300">{s.name}</span>
                    </div>
                    <span className="text-sm font-medium text-emerald-400">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Activity, label: 'Daily transactions', value: '8.4K', sub: '+5.2%' },
                { icon: Users, label: 'Active members', value: '12.8K', sub: '+184' },
                { icon: BarChart3, label: 'AUM', value: '$124M', sub: '+12%' },
              ].map((s, i) => (
                <div key={i} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
                  <s.icon className="w-5 h-5 text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-[10px] text-emerald-400">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> 99.99% uptime</div>
              <div className="flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" /> Hardware key support</div>
              <div className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> 24/7 monitoring</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
