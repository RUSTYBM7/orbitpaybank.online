import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassSurface, GlassCard, GlassBadge, GlassButton, GlassInput } from '@/components/glass';
import { PhotoHero, TEMPLATE_PHOTOS } from '@/components/bright';
import { useStore } from '@/store';
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Info,
  Pause,
  Play,
  Plus,
  Repeat,
  Trash2,
  X
} from 'lucide-react';;

export default function ScheduledScreen() {
  const navigate = useNavigate();
  const { scheduledTransfers, user, updateScheduledTransfer, deleteScheduledTransfer } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const userTransfers = scheduledTransfers.filter((t) => t.userId === user?.id);
  const activeTransfers = userTransfers.filter((t) => t.status === 'active');
  const pausedTransfers = userTransfers.filter((t) => t.status === 'paused');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Every day';
      case 'weekly': return 'Every week';
      case 'biweekly': return 'Every 2 weeks';
      case 'monthly': return 'Every month';
      default: return frequency;
    }
  };

  const getNextRunDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleTogglePause = (transferId: string, currentStatus: string) => {
    updateScheduledTransfer(transferId, {
      status: currentStatus === 'active' ? 'paused' : 'active'
    });
  };

  return (
    <div className="p-5 space-y-5 animate-fade-in pb-6">
      {/* Hero photo — template /imgs/ library */}
      <PhotoHero
        imageUrl={TEMPLATE_PHOTOS.scheduled.hero}
        eyebrow="Scheduled"
        title="Plan every dollar ahead"
        description="Recurring transfers, future-dated payments, and budget auto-rules that run themselves."
        accent="emerald"
        ctaLabel="Schedule a transfer"
        onCta={() => setShowCreateModal(true)}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Scheduled</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] text-white rounded-full text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </motion.button>
      </div>

      {/* Info Card */}
      <GlassCard className="p-4 bg-gradient-to-r from-[#A8E6CF]/20 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A8E6CF] flex items-center justify-center">
            <Repeat className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-[#0A0A0A]">Auto-Transfer Setup</p>
            <p className="text-xs text-[#0A0A0A]/60">Schedule recurring transfers automatically</p>
          </div>
        </div>
      </GlassCard>

      {/* Active Transfers */}
      {activeTransfers.length > 0 && (
        <div>
          <h3 className="font-medium text-[#0A0A0A] mb-3">Active Schedules</h3>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {activeTransfers.map((transfer, index) => (
                <motion.div
                  key={transfer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#2ECC71]/10 flex items-center justify-center">
                          <ArrowRight className="w-6 h-6 text-[#2ECC71]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#0A0A0A]">{transfer.toAccountName}</h4>
                          <p className="text-xs text-[#0A0A0A]/50">
                            {getFrequencyLabel(transfer.frequency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleTogglePause(transfer.id, transfer.status)}
                          className="w-9 h-9 rounded-full bg-[#F4F7C0] flex items-center justify-center"
                        >
                          <Pause className="w-4 h-4 text-[#0A0A0A]" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteScheduledTransfer(transfer.id)}
                          className="w-9 h-9 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 text-[#FF6B6B]" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F7F9F4] rounded-xl mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#0A0A0A]/60">Amount</span>
                        <span className="text-lg font-bold text-[#0A0A0A]">
                          {formatCurrency(transfer.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#0A0A0A]/50">Account</span>
                        <span className="text-xs text-[#0A0A0A]">•••• {transfer.toAccountNumber.slice(-4)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#0A0A0A]/10">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-[#0A0A0A]/40" />
                        <span className="text-xs text-[#0A0A0A]/60">
                          Next: {getNextRunDate(transfer.nextRunDate)}
                        </span>
                      </div>
                      <GlassBadge variant="green" size="sm">Active</GlassBadge>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Paused Transfers */}
      {pausedTransfers.length > 0 && (
        <div>
          <h3 className="font-medium text-[#0A0A0A] mb-3">Paused</h3>
          <div className="space-y-3">
            {pausedTransfers.map((transfer) => (
              <GlassCard key={transfer.id} className="p-4 opacity-60">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#F4F7C0] flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-[#0A0A0A]/40" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#0A0A0A]">{transfer.toAccountName}</h4>
                      <p className="text-xs text-[#0A0A0A]/50">
                        {formatCurrency(transfer.amount)} - {getFrequencyLabel(transfer.frequency)}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleTogglePause(transfer.id, transfer.status)}
                    className="w-9 h-9 rounded-full bg-[#2ECC71]/10 flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 text-[#2ECC71]" />
                  </motion.button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {userTransfers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Clock className="w-16 h-16 mx-auto text-[#0A0A0A]/20 mb-4" />
          <p className="text-[#0A0A0A]/50 mb-4">No scheduled transfers yet</p>
          <GlassButton onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Schedule
          </GlassButton>
        </motion.div>
      )}

      {/* Create Schedule Modal */}
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
              <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-gray-100">
                <div className="w-12 h-1 bg-[#0A0A0A]/20 rounded-full mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#0A0A0A]">Schedule Transfer</h2>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
                <div className="space-y-4">
                  <GlassInput
                    label="Recipient Name"
                    placeholder="Enter recipient name"
                  />
                  <GlassInput
                    label="Account Number"
                    placeholder="Enter account number"
                  />
                  <GlassInput
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    prefix="$"
                  />

                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Frequency</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['daily', 'weekly', 'biweekly', 'monthly'].map((freq) => (
                        <motion.button
                          key={freq}
                          whileTap={{ scale: 0.95 }}
                          className="py-2 px-3 rounded-xl border border-[#0A0A0A]/10 text-sm font-medium text-[#0A0A0A]/60 hover:bg-[#F7F9F4] transition-colors capitalize"
                        >
                          {freq === 'biweekly' ? '2 Weeks' : freq}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <GlassInput
                    label="Start Date"
                    type="date"
                  />
                  <GlassInput
                    label="End Date (Optional)"
                    type="date"
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
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton className="flex-1" onClick={() => setShowCreateModal(false)}>
                    Create Schedule
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
