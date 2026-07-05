import { motion } from 'framer-motion';
import {
  Users, CreditCard, DollarSign, TrendingUp, Activity,
  Shield, AlertCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const stats = [
  { label: 'Total Members', value: '24,856', change: '+12.5%', icon: Users, color: 'emerald' },
  { label: 'Active Cards', value: '18,432', change: '+8.2%', icon: CreditCard, color: 'blue' },
  { label: 'Total Assets', value: '$2.4B', change: '+15.3%', icon: DollarSign, color: 'purple' },
  { label: 'Loan Portfolio', value: '$890M', change: '+6.8%', icon: TrendingUp, color: 'amber' },
];

const recentTransactions = [
  { id: 1, user: 'Sarah Mitchell', type: 'Deposit', amount: 5000, date: '2 min ago', status: 'completed' },
  { id: 2, user: 'James Wilson', type: 'Withdrawal', amount: 2500, date: '5 min ago', status: 'completed' },
  { id: 3, user: 'Emily Chen', type: 'Transfer', amount: 1500, date: '12 min ago', status: 'pending' },
  { id: 4, user: 'Michael Brown', type: 'Loan Payment', amount: 850, date: '18 min ago', status: 'completed' },
  { id: 5, user: 'Lisa Anderson', type: 'Card Payment', amount: 320, date: '25 min ago', status: 'completed' },
];

const alerts = [
  { id: 1, type: 'warning', message: '3 accounts pending verification' },
  { id: 2, type: 'info', message: 'Scheduled maintenance at 2:00 AM EST' },
  { id: 3, type: 'success', message: 'All systems operational' },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              <span className="flex items-center text-emerald-400 text-sm">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {stat.change}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'Deposit' ? 'bg-emerald-500/20' :
                    tx.type === 'Withdrawal' ? 'bg-red-500/20' :
                    tx.type === 'Transfer' ? 'bg-blue-500/20' :
                    'bg-amber-500/20'
                  }`}>
                    {tx.type === 'Deposit' ? <ArrowDownRight className="w-5 h-5 text-emerald-400" /> :
                     tx.type === 'Withdrawal' ? <ArrowUpRight className="w-5 h-5 text-red-400" /> :
                     <TrendingUp className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div>
                    <p className="text-white font-medium">{tx.user}</p>
                    <p className="text-slate-400 text-sm">{tx.type} • {tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === 'Withdrawal' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {tx.type === 'Withdrawal' ? '-' : '+'}${tx.amount.toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & System Status */}
        <div className="space-y-6">
          {/* Alerts */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Alerts</h2>
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                  alert.type === 'warning' ? 'bg-amber-500/10' :
                  alert.type === 'info' ? 'bg-blue-500/10' :
                  'bg-emerald-500/10'
                }`}>
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.type === 'warning' ? 'bg-amber-400' :
                    alert.type === 'info' ? 'bg-blue-400' :
                    'bg-emerald-400'
                  }`} />
                  <p className="text-slate-300 text-sm">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Security</h2>
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Firewall</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">SSL Certificate</span>
                <span className="text-emerald-400">Valid</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Audit</span>
                <span className="text-slate-300">2 days ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Threats Blocked</span>
                <span className="text-white font-medium">1,247</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
