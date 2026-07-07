import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassSurface, GlassCard, GlassBadge, GlassButton, GlassInput } from '@/components/glass';
import { PhotoHero, TEMPLATE_PHOTOS } from '@/components/bright';
import { useStore } from '@/store';
import {
  Receipt, Plus, Calendar, Clock, Check, AlertCircle,
  Zap, Home, Tv, Phone, Car, GraduationCap, CreditCard, Bot, TrendingUp, Bell, Sparkles
} from 'lucide-react';

const aiBillInsights = [
  { text: "Your electricity bill is predicted to increase by 12% next month", icon: TrendingUp, color: 'amber' },
  { text: "3 bills are due within the next 5 days", icon: Bell, color: 'rose' },
  { text: "You're saving $15/mo by using autopay", icon: Sparkles, color: 'emerald' },
  { text: "Water bill usage is 8% lower than average", icon: Home, color: 'cyan' },
];

export default function BillsScreen() {
  const navigate = useNavigate();
  const { billPayments, user } = useStore();
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState<string | null>(null);
  const [currentInsight, setCurrentInsight] = useState(0);
  const [aiTypingText, setAiTypingText] = useState('');

  // AI typing effect for bill insights
  useEffect(() => {
    const insight = aiBillInsights[currentInsight];
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
      setCurrentInsight((prev) => (prev + 1) % aiBillInsights.length);
    }, 8000);

    return () => {
      clearInterval(typeInterval);
      clearInterval(switchInterval);
    };
  }, [currentInsight]);

  const userBills = billPayments.filter((b) => b.userId === user?.id);

  const billerCategories = [
    { id: 'electricity', name: 'Electricity', icon: Zap, color: 'bg-[#F4F7C0]' },
    { id: 'water', name: 'Water', icon: Home, color: 'bg-[#A8E6CF]' },
    { id: 'internet', name: 'Internet', icon: Tv, color: 'bg-[#DDA0DD]' },
    { id: 'phone', name: 'Phone', icon: Phone, color: 'bg-[#88D4AB]' },
    { id: 'car', name: 'Car Insurance', icon: Car, color: 'bg-[#E5EB8A]' },
    { id: 'student', name: 'Student Loan', icon: GraduationCap, color: 'bg-[#C48BC4]' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <GlassBadge variant="green" size="sm">Paid</GlassBadge>;
      case 'pending':
        return <GlassBadge variant="yellow" size="sm">Pending</GlassBadge>;
      case 'failed':
        return <GlassBadge variant="red" size="sm">Failed</GlassBadge>;
      default:
        return <GlassBadge variant="yellow" size="sm">{status}</GlassBadge>;
    }
  };

  const currentInsightData = aiBillInsights[currentInsight];

  // Calculate upcoming bills
  const upcomingBills = userBills.filter((b) => {
    if (!b.dueDate) return false;
    const daysUntilDue = Math.ceil((new Date(b.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  });

  return (
    <div className="p-5 space-y-5 animate-fade-in pb-6">
      {/* Hero photo — template /imgs/ library */}
      <PhotoHero
        imageUrl={TEMPLATE_PHOTOS.bills.hero}
        eyebrow="Bill Pay"
        title="Never miss a due date"
        description="Schedule rent, utilities, subscriptions — auto-pay, get reminders, and earn cashback on every bill."
        accent="mint"
        ctaLabel="Add a bill"
        onCta={() => setShowPayModal(true)}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-800">Pay Bills</h1>
          <p className="text-sm text-emerald-800/50">Manage your recurring payments</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPayModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-800 text-white rounded-full text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Pay Bill
        </motion.button>
      </div>

      {/* AI Bill Insights Banner */}
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
              <p className="text-xs font-semibold text-cyan-600">AI Bill Assistant</p>
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <div className="flex items-center gap-2">
              <currentInsightData.icon className={`w-4 h-4 ${
                currentInsightData.color === 'amber' ? 'text-amber-500' :
                currentInsightData.color === 'rose' ? 'text-rose-500' :
                currentInsightData.color === 'emerald' ? 'text-emerald-500' :
                'text-cyan-500'
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

      {/* Upcoming Bills Alert */}
      {upcomingBills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-4 border-l-4 border-amber-400"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800">
                {upcomingBills.length} bill{upcomingBills.length > 1 ? 's' : ''} due soon
              </p>
              <p className="text-xs text-emerald-800/50">
                Total: {formatCurrency(upcomingBills.reduce((sum, b) => sum + b.amount, 0))}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium"
            >
              Pay All
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Quick Pay Categories */}
      <div>
        <h3 className="font-medium text-emerald-800 mb-3">Quick Pay</h3>
        <div className="grid grid-cols-3 gap-3">
          {billerCategories.slice(0, 6).map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBiller(category.id)}
              className="flex flex-col items-center p-4 bg-white rounded-2xl border border-[#0A0A0A]/5 card-hover"
            >
              <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-2`}>
                <category.icon className="w-6 h-6 text-emerald-800" />
              </div>
              <span className="text-xs font-medium text-emerald-800">{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Bills */}
      <div>
        <h3 className="font-medium text-emerald-800 mb-3">Recent Bills</h3>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {userBills.length > 0 ? (
              userBills.map((bill, index) => (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-emerald-800/60" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-emerald-800">{bill.billerName}</h4>
                        <p className="text-xs text-emerald-800/50">
                          Account: {bill.accountNumber}
                        </p>
                        {bill.dueDate && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 mt-1"
                          >
                            <Calendar className="w-3 h-3 text-emerald-800/40" />
                            <span className={`text-xs ${
                              Math.ceil((new Date(bill.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 3
                                ? 'text-rose-500 font-medium'
                                : 'text-[#FF6B6B]'
                            }`}>
                              Due: {new Date(bill.dueDate).toLocaleDateString()}
                            </span>
                          </motion.div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-800">
                          {formatCurrency(bill.amount)}
                        </p>
                        {getStatusBadge(bill.status)}
                      </div>
                    </div>
                    {bill.status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-3 py-2 bg-emerald-800 text-white rounded-xl font-medium"
                      >
                        Pay Now
                      </motion.button>
                    )}
                  </GlassCard>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Receipt className="w-16 h-16 mx-auto text-emerald-800/20 mb-4" />
                <p className="text-emerald-800/50">No recent bills</p>
                <GlassButton className="mt-4" onClick={() => setShowPayModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Pay Your First Bill
                </GlassButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bill Payment Modal */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end"
            onClick={() => setShowPayModal(false)}
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
                <h2 className="text-xl font-bold text-emerald-800">Pay a Bill</h2>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
                {/* Biller Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-emerald-800 mb-2">Select Biller</label>
                  <div className="grid grid-cols-3 gap-2">
                    {billerCategories.map((category) => (
                      <motion.button
                        key={category.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedBiller(category.id)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedBiller === category.id
                            ? 'border-[#A8E6CF] bg-[#A8E6CF]/10'
                            : 'border-[#0A0A0A]/10'
                        }`}
                      >
                        <category.icon className={`w-6 h-6 mx-auto mb-1 ${
                          selectedBiller === category.id ? 'text-[#2ECC71]' : 'text-emerald-800/40'
                        }`} />
                        <span className="text-xs text-emerald-800">{category.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <GlassInput
                    label="Account Number"
                    placeholder="Enter biller account number"
                  />
                  <GlassInput
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    prefix="$"
                  />
                  <GlassInput
                    label="Payment Date"
                    type="date"
                  />
                </div>

                {/* Payment Summary */}
                <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-800/60">Bill Amount</span>
                    <span className="text-sm text-emerald-800">$0.00</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-800/60">Processing Fee</span>
                    <span className="text-sm text-emerald-800">$0.00</span>
                  </div>
                  <div className="border-t border-[#0A0A0A]/10 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-emerald-800">Total</span>
                      <span className="text-lg font-bold text-emerald-800">$0.00</span>
                    </div>
                  </div>
                </div>
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
                    onClick={() => setShowPayModal(false)}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    className="flex-1"
                    disabled={!selectedBiller}
                    onClick={() => {
                      setShowPayModal(false);
                    }}
                  >
                    Pay Bill
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
