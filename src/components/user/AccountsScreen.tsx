import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassSurface, GlassCard, GlassBadge, GlassButton, GlassInput } from '@/components/glass';
import { PhotoHero, TEMPLATE_PHOTOS } from '@/components/bright';
import { useStore } from '@/store';
import {
  Wallet, Plus, PiggyBank, Building2, Check,
  Star, Copy, Eye, EyeOff, TrendingUp, Lock, Sparkles, Bot, TrendingDown, Target
} from 'lucide-react';

const aiAccountInsights = [
  { text: "You're saving 12% more than last month", icon: TrendingUp, color: 'emerald' },
  { text: "Consider setting aside $200 for emergency fund", icon: Target, color: 'amber' },
  { text: "Your savings rate is higher than 65% of users", icon: Sparkles, color: 'cyan' },
  { text: "You could earn $45 more with a higher-yield savings account", icon: PiggyBank, color: 'violet' },
];

export default function AccountsScreen() {
  const navigate = useNavigate();
  const { bankAccounts, user, addBankAccount, setPrimaryAccount } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedType, setSelectedType] = useState<'checking' | 'savings' | null>(null);
  const [currentInsight, setCurrentInsight] = useState(0);
  const [aiTypingText, setAiTypingText] = useState('');

  // AI typing effect for account insights
  useEffect(() => {
    const insight = aiAccountInsights[currentInsight];
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= insight.text.length) {
        setAiTypingText(insight.text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);

    const switchInterval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % aiAccountInsights.length);
    }, 8000);

    return () => {
      clearInterval(typeInterval);
      clearInterval(switchInterval);
    };
  }, [currentInsight]);

  const userAccounts = bankAccounts.filter((a) => a.userId === user?.id);
  const totalBalance = userAccounts.reduce((sum, a) => sum + a.balance, 0);

  const checkingAccounts = userAccounts.filter((a) => a.type === 'checking');
  const savingsAccounts = userAccounts.filter((a) => a.type === 'savings');

  const accountColors = [
    { id: 'mint', gradient: 'from-[#A8E6CF] to-[#88D4AB]' },
    { id: 'purple', gradient: 'from-[#DDA0DD] to-[#C48BC4]' },
    { id: 'gold', gradient: 'from-[#F4F7C0] to-[#E5EB8A]' },
    { id: 'navy', gradient: 'from-[#1a1a2e] to-[#16213e]' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAccountNumber = (num: string) => {
    return `${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8)}`;
  };

  const currentInsightData = aiAccountInsights[currentInsight];

  return (
    <div className="p-5 space-y-5 animate-fade-in pb-6">
      {/* Hero photo — template /imgs/ library */}
      <PhotoHero
        imageUrl={TEMPLATE_PHOTOS.accounts.hero}
        eyebrow="Accounts"
        title="All your money, one orbit"
        description="Checking, savings, and credit in a single dashboard — balances, statements, and transfers at a glance."
        accent="emerald"
        ctaLabel="Open new account"
        onCta={() => setShowCreateModal(true)}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-800">My Accounts</h1>
          <p className="text-sm text-emerald-800/50">Manage your finances</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-800 text-white rounded-full text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Account
        </motion.button>
      </div>

      {/* AI Account Insights Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="ai-widget p-4 rounded-2xl"
      >
        <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-2">
              <currentInsightData.icon className={`w-4 h-4 ${
                currentInsightData.color === 'emerald' ? 'text-emerald-500' :
                currentInsightData.color === 'amber' ? 'text-amber-500' :
                currentInsightData.color === 'cyan' ? 'text-cyan-500' :
                'text-violet-500'
              }`} />
              <p className="text-sm text-emerald-800/80 flex-1">
                {aiTypingText}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="ml-1"
                >
                  |
                </motion.span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Total Balance Card */}
      <GlassCard intensity="high" className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#A8E6CF]/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#DDA0DD]/30 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-emerald-800/60">Total Balance</p>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <motion.h2
            key={totalBalance}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-emerald-800 mb-4"
          >
            {showBalance ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
          </motion.h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full">
              <Building2 className="w-4 h-4 text-emerald-800/60" />
              <span className="text-sm font-medium text-emerald-800">{checkingAccounts.length} Checking</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full">
              <PiggyBank className="w-4 h-4 text-emerald-800/60" />
              <span className="text-sm font-medium text-emerald-800">{savingsAccounts.length} Savings</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Accounts List */}
      <div className="space-y-4">
        {userAccounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Wallet className="w-16 h-16 mx-auto text-emerald-800/20 mb-4" />
            <p className="text-emerald-800/50 mb-4">No accounts yet</p>
            <GlassButton onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Account
            </GlassButton>
          </motion.div>
        ) : (
          userAccounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accountColors.find(c => c.id === account.color)?.gradient || 'from-[#1a1a2e] to-[#16213e]'} flex items-center justify-center`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {account.type === 'checking' ? (
                        <Building2 className="w-6 h-6 text-white" />
                      ) : (
                        <PiggyBank className="w-6 h-6 text-white" />
                      )}
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-emerald-800">{account.name}</h3>
                        {account.isPrimary && (
                          <Star className="w-4 h-4 text-[#F4F7C0] fill-[#F4F7C0]" />
                        )}
                      </div>
                      <p className="text-xs text-emerald-800/50 capitalize">{account.type} Account</p>
                    </div>
                  </div>
                  <GlassBadge
                    variant={account.status === 'active' ? 'green' : 'red'}
                    size="sm"
                  >
                    {account.status}
                  </GlassBadge>
                </div>

                {/* Account Number */}
                <div className="flex items-center justify-between p-3 bg-emerald-800/5 rounded-xl mb-4">
                  <div>
                    <p className="text-xs text-emerald-800/50 mb-1">Account Number</p>
                    <p className="text-sm font-mono text-emerald-800">
                      {showBalance ? formatAccountNumber(account.accountNumber) : '•••• •••• ••••'}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(account.accountNumber)}
                    className="p-2 hover:bg-emerald-800/10 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-emerald-800/40" />
                  </motion.button>
                </div>

                {/* Balance and Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-emerald-800/50 mb-1">Balance</p>
                    <p className="text-lg font-bold text-emerald-800">
                      {showBalance ? `$${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-800/50 mb-1">Interest Rate</p>
                    <p className="text-lg font-bold text-[#2ECC71]">{account.interestRate}%</p>
                  </div>
                </div>

                {/* Routing Number */}
                <div className="mt-4 pt-4 border-t border-[#0A0A0A]/10">
                  <p className="text-xs text-emerald-800/50">Routing Number</p>
                  <p className="text-sm font-mono text-emerald-800/70">{account.routingNumber}</p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {!account.isPrimary && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPrimaryAccount(account.id)}
                      className="flex-1 py-2.5 border border-[#0A0A0A]/20 rounded-xl text-sm font-medium text-emerald-800/60 hover:bg-emerald-800/5 transition-colors"
                    >
                      Set as Primary
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {}}
                    className="flex-1 py-2.5 bg-emerald-800 text-white rounded-xl text-sm font-medium"
                  >
                    View Details
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      {/* Savings Benefits */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#A8E6CF]" />
          <h3 className="font-medium text-emerald-800">Savings Benefits</h3>
          <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">AI Recommended</span>
        </div>
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#A8E6CF]/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-[#2ECC71]" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">Competitive Interest Rates</p>
              <p className="text-xs text-emerald-800/50">Earn up to 4.5% APY on your savings</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#A8E6CF]/20 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-[#2ECC71]" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">FDIC Insured</p>
              <p className="text-xs text-emerald-800/50">Your deposits are protected up to $250,000</p>
            </div>
          </motion.div>
        </div>
      </GlassCard>

      {/* Create Account Modal - Fixed Footer */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full bg-white rounded-t-3xl flex flex-col"
              style={{ maxHeight: '92vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-emerald-100/50">
                <div className="w-12 h-1 bg-emerald-800/20 rounded-full mx-auto mb-4" />
                <h2 className="text-xl font-bold text-emerald-800">Create New Account</h2>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
                {/* Account Type Selection */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { id: 'checking', name: 'Checking', icon: Building2, desc: 'For daily transactions' },
                    { id: 'savings', name: 'Savings', icon: PiggyBank, desc: 'Grow your money' },
                  ].map((type) => (
                    <motion.button
                      key={type.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedType(type.id as 'checking' | 'savings')}
                      className={`p-4 rounded-2xl border-2 transition-all text-center ${
                        selectedType === type.id
                          ? 'border-[#A8E6CF] bg-[#A8E6CF]/10'
                          : 'border-[#0A0A0A]/10'
                      }`}
                    >
                      <type.icon className={`w-8 h-8 mx-auto mb-2 ${selectedType === type.id ? 'text-[#2ECC71]' : 'text-emerald-800/40'}`} />
                      <h3 className="font-medium text-emerald-800">{type.name}</h3>
                      <p className="text-xs text-emerald-800/50">{type.desc}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  <GlassInput
                    label="Account Name"
                    placeholder="e.g., Emergency Fund"
                  />
                  <div>
                    <label className="block text-sm font-medium text-emerald-800 mb-2">Initial Deposit</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800/40">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-[#0A0A0A]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Interest Rate Preview */}
                {selectedType && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-[#A8E6CF]/10 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-800/60">Estimated APY</span>
                      <span className="text-lg font-bold text-[#2ECC71]">
                        {selectedType === 'savings' ? '4.5%' : '0.5%'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Fixed Footer - ALWAYS VISIBLE */}
              <div
                className="flex-shrink-0 px-5 py-4 border-t border-emerald-100/50 bg-white"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 24px)' }}
              >
                <div className="flex gap-3">
                  <GlassButton
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    className="flex-1"
                    disabled={!selectedType}
                    onClick={() => {
                      setShowCreateModal(false);
                    }}
                  >
                    Create Account
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
