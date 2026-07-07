import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassSurface, GlassBadge, GlassCard } from '@/components/glass';
import { BrandLogo } from '@/components/branding/BrandLogo';
import { useStore } from '@/store';
import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  Bell,
  Bitcoin,
  Bot,
  ChartLine,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Headphones,
  PiggyBank,
  Plus,
  QrCode,
  Receipt,
  Send,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Wallet,
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { user, transactions, currencyRates, notifications } = useStore();
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [aiTypingText, setAiTypingText] = useState('');
  const [financialHealth, setFinancialHealth] = useState(87);
  const [currentTime, setCurrentTime] = useState(new Date());

  if (!user) return null;

  const userTransactions = transactions.filter((t) => t.userId === user.id).slice(0, 6);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const balanceMap: Record<string, number> = {
    USD: user.balanceUsd,
    EUR: user.balanceEur,
    GBP: user.balanceGbp,
    BTC: user.balanceBtc,
  };

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    BTC: '₿',
  };

  const weeklyChange = 421.03;

  const aiInsights = [
    "Your spending is 12% below average this month",
    "Consider adding $500 to savings for better returns",
    "Great job! You're on track to reach your goals",
    "You've saved $150 more than last month"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomInsight = aiInsights[Math.floor(Math.random() * aiInsights.length)];
      setAiTypingText('');
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex <= randomInsight.length) {
          setAiTypingText(randomInsight.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 25);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    { icon: <Send className="w-5 h-5" />, label: 'Send', action: () => navigate('/app/transfer') },
    { icon: <Download className="w-5 h-5" />, label: 'Receive', action: () => navigate('/app/transfer') },
    { icon: <QrCode className="w-5 h-5" />, label: 'Scan QR', action: () => {} },
    { icon: <Receipt className="w-5 h-5" />, label: 'Pay Bills', action: () => navigate('/app/bills') },
  ];

  const secondaryActions = [
    { icon: <CreditCard className="w-5 h-5" />, label: 'Cards', action: () => navigate('/app/cards') },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Invest', action: () => navigate('/app/invest') },
    { icon: <Bitcoin className="w-5 h-5" />, label: 'Crypto', action: () => navigate('/app/crypto') },
    { icon: <ArrowDownLeft className="w-5 h-5" />, label: 'History', action: () => navigate('/app/transfer') },
  ];

  const savingsData = [
    { value: 35, label: 'Food' },
    { value: 25, label: 'Transport' },
    { value: 20, label: 'Shopping' },
    { value: 15, label: 'Entertainment' },
    { value: 5, label: 'Other' },
  ];

  const balanceChartData = [
    { value: 24000 },
    { value: 25500 },
    { value: 24800 },
    { value: 26200 },
    { value: 25800 },
    { value: 26887 },
  ];

  return (
    <div className="p-5 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {/* OrbitPay Logo */}
          <BrandLogo variant="compact" className="h-8" />
        </motion.div>

        <div className="flex items-center gap-2">
          {/* Support Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/app/support')}
            className="relative w-11 h-11 glass-button rounded-xl flex items-center justify-center z-50"
          >
            <Headphones className="w-5 h-5 text-emerald-800" />
          </motion.button>

          {/* Notifications - Fixed with proper click handler and z-index */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/app/chat')}
            className="relative w-11 h-11 glass-button rounded-xl flex items-center justify-center z-50"
          >
            <Bell className="w-5 h-5 text-emerald-800" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rose-400 to-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-lg"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>

      {/* User Welcome Card - Clickable to profile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 cursor-pointer hover:bg-white/20 transition-all"
        onClick={() => navigate('/app/profile')}
      >
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.fullName}
            className="w-12 h-12 rounded-full border-2 border-emerald-200 cursor-pointer"
          />
          <div className="flex-1">
            <p className="text-xs text-emerald-600/60">Welcome back,</p>
            <p className="text-lg font-semibold text-emerald-800">{user.fullName.split(' ')[0]}</p>
          </div>
          <GlassBadge variant="mint" size="sm">{user.tier.toUpperCase()}</GlassBadge>
        </div>
      </motion.div>

      {/* AI Insights Widget - Now positioned BELOW the Balance Card */}

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard intensity="high" className="p-6 relative overflow-hidden">
          {/* Dynamic Background */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-300/60 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-teal-300/50 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <GlassBadge variant="yellow" size="sm">
                {selectedCurrency}
              </GlassBadge>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBalance(!showBalance)}
                  className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm"
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-emerald-600/50 mb-1">
                1 {selectedCurrency} = {selectedCurrency === 'USD' ? '1.00' : (1 / (currencyRates.find(r => r.code === selectedCurrency)?.rate || 1)).toFixed(2)} USD
              </p>
              <div className="flex items-end gap-3">
                <h1 className="text-4xl font-light text-emerald-800 tracking-tight">
                  {showBalance
                    ? `${currencySymbols[selectedCurrency]}${balanceMap[selectedCurrency]?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : '••••••'}
                </h1>
                {showBalance && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-12 flex-1 max-w-[120px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={balanceChartData}>
                        <defs>
                          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#A8E6CF" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#A8E6CF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#A8E6CF"
                          strokeWidth={2}
                          fill="url(#balanceGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <motion.span
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 text-sm font-medium text-emerald-700 flex items-center gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                +${weeklyChange.toFixed(2)}
              </motion.span>
              <span className="text-xs text-emerald-600/40">this week</span>
            </div>

            {/* Quick Actions - Primary */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {quickActions.map((action, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.action}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/25 hover:bg-white/35 backdrop-blur-sm transition-all border border-white/20"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center text-emerald-800 shadow-sm">
                    {action.icon}
                  </div>
                  <span className="text-[10px] font-medium text-emerald-800">{action.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-4 gap-2">
              {secondaryActions.map((action, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.action}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-white/15 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center text-emerald-700/70 backdrop-blur-sm">
                    {action.icon}
                  </div>
                  <span className="text-[9px] text-emerald-600/60">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* AI Insights Widget - Positioned BELOW Balance Card, ABOVE Financial Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="ai-widget p-4 rounded-2xl"
      >
        <div className="flex items-start gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bot className="w-5 h-5 text-white" />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-semibold text-cyan-600">AI Financial Advisor</p>
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <p className="text-sm text-emerald-700/80 h-5">
              {aiTypingText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block ml-0.5"
              >|</motion.span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Financial Health Score & Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        {/* Financial Health Score */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-emerald-600/50">Financial Health</p>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold text-emerald-800">{financialHealth}</span>
            <span className="text-sm text-emerald-600/40 mb-1">/100</span>
          </div>
          <div className="mt-2 h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${financialHealth}%` }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
            />
          </div>
          <p className="text-[10px] text-emerald-600 mt-1">Excellent score!</p>
        </GlassCard>

        {/* Weekly Spending */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-emerald-600/50">Weekly Spent</p>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold text-emerald-800">$1,245</span>
            <span className="text-sm text-emerald-500 mb-1">-8%</span>
          </div>
          <p className="text-[10px] text-emerald-600/40 mt-1">$155 less than last week</p>
        </GlassCard>
      </motion.div>

      {/* Spending Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                <ChartLine className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-medium text-emerald-800">Spending Categories</p>
            </div>
            <span className="text-xs text-emerald-600/40">This month</span>
          </div>
          <div className="space-y-3">
            {savingsData.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-emerald-600/50 w-16">{item.label}</span>
                <div className="flex-1 h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg,
                        ${['#A8E6CF', '#DDA0DD', '#F4F7C0', '#C8D9C4', '#FFB6C1'][i]} 0%,
                        ${['#7BCFB5', '#C48DC8', '#E8EB8A', '#A8C49A', '#FF9AAA'][i]} 100%)`
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-emerald-800 w-10 text-right">{item.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Savings & Budgets Quick View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 gap-3"
      >
        <GlassCard className="p-4 cursor-pointer card-hover" onClick={() => navigate('/app/accounts')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-emerald-600/50">Savings</p>
              <p className="text-lg font-semibold text-emerald-800">$15,000</p>
            </div>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
            />
          </div>
          <p className="text-[10px] text-emerald-600/40 mt-1">75% of monthly goal</p>
        </GlassCard>

        <GlassCard className="p-4 cursor-pointer card-hover" onClick={() => navigate('/app/accounts')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-emerald-600/50">Insurance</p>
              <p className="text-lg font-semibold text-emerald-800">Protected</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-6 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-purple-500" />
            ))}
          </div>
          <p className="text-[10px] text-emerald-600/40 mt-1">All assets covered</p>
        </GlassCard>
      </motion.div>

      {/* Currency Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium text-emerald-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Multi-Currency
          </h2>
          <button className="text-sm text-emerald-600/50 hover:text-emerald-800">Manage</button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-5 px-5">
          {currencyRates.map((rate, i) => (
            <motion.button
              key={rate.code}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCurrency(rate.code)}
              className={`flex-shrink-0 glass-card px-4 py-3 min-w-[110px] text-left transition-all ${
                selectedCurrency === rate.code ? 'ring-2 ring-emerald-400 shadow-lg' : ''
              }`}
            >
              <p className="text-xs text-emerald-600/50">{rate.name}</p>
              <p className="text-lg font-medium text-emerald-800">{rate.code}</p>
              <p className="text-sm text-emerald-700/70 flex items-center gap-1">
                {rate.change > 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <ArrowDownLeft className="w-3 h-3 text-rose-500" />
                )}
                {rate.rate.toFixed(2)}
              </p>
            </motion.button>
          ))}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            whileTap={{ scale: 0.97 }}
            className="flex-shrink-0 glass-card px-4 py-3 min-w-[100px] flex flex-col items-center justify-center"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-1 shadow-lg">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-emerald-600/50">Add</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="pb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium text-emerald-800 flex items-center gap-2">
            Recent Activity
          </h2>
          <button
            onClick={() => navigate('/app/transfer')}
            className="text-sm text-emerald-600/50 hover:text-emerald-800 flex items-center gap-1 group"
          >
            See All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="space-y-2.5">
          {userTransactions.map((txn, i) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.05 }}
              onClick={() => navigate(`/app/transaction/${txn.id}`)}
              className="glass-card px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/25 transition-all group"
            >
              <motion.div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  txn.amount > 0
                    ? 'bg-gradient-to-br from-emerald-100 to-green-100'
                    : 'bg-gradient-to-br from-rose-100 to-red-100'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {txn.recipientAvatar ? (
                  <img src={txn.recipientAvatar} alt="" className="w-11 h-11 rounded-xl" />
                ) : (
                  <TrendingUp className={`w-5 h-5 ${txn.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
                )}
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-800 truncate group-hover:text-emerald-800/80">
                  {txn.recipientName || txn.description}
                </p>
                <p className="text-xs text-emerald-600/40">{txn.description}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${
                  txn.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString('en-US', { style: 'currency', currency: txn.currency })}
                </p>
                <GlassBadge
                  variant={txn.status === 'completed' ? 'green' : txn.status === 'pending' ? 'yellow' : 'red'}
                  size="sm"
                >
                  {txn.status}
                </GlassBadge>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
