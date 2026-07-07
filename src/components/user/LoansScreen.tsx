import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassSurface, GlassCard, GlassBadge, GlassButton, GlassInput } from '@/components/glass';
import { PhotoHero, TEMPLATE_PHOTOS } from '@/components/bright';
import { useStore } from '@/store';
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Car,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Filter,
  GraduationCap,
  Home,
  Percent,
  Plus,
  TrendingUp,
  User,
  Wallet,
  X
} from 'lucide-react';;

export default function LoansScreen() {
  const navigate = useNavigate();
  const { loans, user, loanPayments } = useStore();
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'history'>('active');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null);

  const userLoans = loans.filter((l) => l.userId === user?.id);
  const filteredLoans = userLoans.filter((l) => {
    if (activeTab === 'active') return l.status === 'active';
    if (activeTab === 'pending') return l.status === 'pending';
    return ['paid_off', 'rejected', 'defaulted'].includes(l.status);
  });

  const totalDebt = userLoans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.remainingBalance, 0);

  const totalMonthlyPayment = userLoans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.monthlyPayment, 0);

  const loanTypes = [
    { id: 'personal', name: 'Personal Loan', icon: User, rate: '8.5%', max: '$50,000', desc: 'Flexible funding for any purpose' },
    { id: 'home', name: 'Home Loan', icon: Home, rate: '4.2%', max: '$500,000', desc: 'Dream home financing made easy' },
    { id: 'auto', name: 'Auto Loan', icon: Car, rate: '5.9%', max: '$100,000', desc: 'Get your wheels today' },
    { id: 'student', name: 'Student Loan', icon: GraduationCap, rate: '3.8%', max: '$150,000', desc: 'Invest in your education' },
    { id: 'business', name: 'Business Loan', icon: Briefcase, rate: '7.2%', max: '$250,000', desc: 'Grow your business' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'paid_off': return 'lavender';
      case 'rejected':
      case 'defaulted': return 'red';
      default: return 'yellow';
    }
  };

  const getLoan = (type: string) => {
    const loanType = loanTypes.find((lt) => lt.id === type);
    return loanType?.icon || Wallet;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="p-5 space-y-5 animate-fade-in pb-6">
      {/* Hero photo — template /imgs/ library */}
      <PhotoHero
        imageUrl={TEMPLATE_PHOTOS.loans.hero}
        eyebrow="Lending"
        title="Loans that fit your life"
        description="Personal, auto, home, and small-business credit lines — pre-qualified in 60 seconds."
        accent="emerald"
        ctaLabel="See my offers"
        onCta={() => setShowApplyModal(true)}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">My Loans</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] text-white rounded-full text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Apply
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 bg-gradient-to-br from-[#FF6B6B]/10 to-transparent">
          <p className="text-xs text-[#0A0A0A]/50 mb-1">Total Outstanding</p>
          <p className="text-xl font-bold text-[#0A0A0A]">{formatCurrency(totalDebt)}</p>
        </GlassCard>
        <GlassCard className="p-4 bg-gradient-to-br from-[#A8E6CF]/10 to-transparent">
          <p className="text-xs text-[#0A0A0A]/50 mb-1">Monthly Payment</p>
          <p className="text-xl font-bold text-[#0A0A0A]">{formatCurrency(totalMonthlyPayment)}</p>
        </GlassCard>
      </div>

      {/* Tab Filter */}
      <div className="flex gap-2 p-1 bg-white/50 rounded-full">
        {(['active', 'pending', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-[#0A0A0A] text-white'
                : 'text-[#0A0A0A]/60 hover:text-[#0A0A0A]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Loans List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredLoans.map((loan, index) => {
            const Icon = getLoan(loan.type);
            const progress = ((loan.principal - loan.remainingBalance) / loan.principal) * 100;

            return (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-5">
                  {/* Loan Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#0A0A0A] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#0A0A0A]">{loan.name}</h3>
                        <p className="text-xs text-[#0A0A0A]/50 capitalize">{loan.type} Loan</p>
                      </div>
                    </div>
                    <GlassBadge variant={getStatusColor(loan.status)} size="sm">
                      {loan.status.replace('_', ' ')}
                    </GlassBadge>
                  </div>

                  {/* Loan Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#0A0A0A]/60">Original Amount</span>
                      <span className="text-sm font-medium text-[#0A0A0A]">{formatCurrency(loan.principal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#0A0A0A]/60">Interest Rate</span>
                      <span className="text-sm font-medium text-[#0A0A0A]">{loan.interestRate}% APR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#0A0A0A]/60">Term Length</span>
                      <span className="text-sm font-medium text-[#0A0A0A]">{loan.termMonths} months</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {loan.status === 'active' && (
                    <div className="mt-4 pt-4 border-t border-[#0A0A0A]/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#0A0A0A]/50">Repayment Progress</span>
                        <span className="text-xs font-medium text-[#0A0A0A]">{progress.toFixed(1)}% paid</span>
                      </div>
                      <div className="h-2 bg-[#0A0A0A]/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ delay: 0.5, duration: 1 }}
                          className="h-full bg-gradient-to-r from-[#A8E6CF] to-[#2ECC71] rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Next Payment */}
                  {loan.status === 'active' && (
                    <div className="mt-4 p-3 bg-[#F4F7C0]/50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#0A0A0A]/60" />
                          <span className="text-sm text-[#0A0A0A]/60">Next Payment</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#0A0A0A]">{formatCurrency(loan.nextPaymentAmount)}</p>
                          <p className="text-xs text-[#0A0A0A]/50">
                            Due {new Date(loan.nextPaymentDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {loan.status === 'active' && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 py-3 bg-[#0A0A0A] text-white rounded-xl font-medium"
                    >
                      Make Payment
                    </motion.button>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredLoans.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Wallet className="w-16 h-16 mx-auto text-[#0A0A0A]/20 mb-4" />
            <p className="text-[#0A0A0A]/50">No {activeTab} loans</p>
            {activeTab === 'active' && (
              <GlassButton className="mt-4" onClick={() => setShowApplyModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Apply for a Loan
              </GlassButton>
            )}
          </motion.div>
        )}
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end"
            onClick={() => setShowApplyModal(false)}
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
              <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-gray-100">
                <div className="w-12 h-1 bg-[#0A0A0A]/20 rounded-full mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#0A0A0A]">Apply for a Loan</h2>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
                <div className="space-y-3">
                  {loanTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedLoanType(type.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        selectedLoanType === type.id
                          ? 'border-[#A8E6CF] bg-[#A8E6CF]/10'
                          : 'border-[#0A0A0A]/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0A0A0A] flex items-center justify-center">
                          <type.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-[#0A0A0A]">{type.name}</h3>
                          <p className="text-xs text-[#0A0A0A]/50">{type.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#2ECC71]">{type.rate}</p>
                          <p className="text-xs text-[#0A0A0A]/50">Max {type.max}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <GlassInput
                    label="Loan Amount"
                    type="number"
                    placeholder="Enter amount"
                    prefix="$"
                  />
                  <GlassInput
                    label="Loan Term"
                    type="number"
                    placeholder="Enter months"
                    suffix="months"
                  />
                </div>
              </div>

              {/* Fixed Footer - ALWAYS VISIBLE */}
              <div
                className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 24px)' }}
              >
                <div className="flex gap-3">
                  <GlassButton
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton className="flex-1" onClick={() => {}}>
                    Apply Now
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
