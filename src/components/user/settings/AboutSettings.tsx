import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard, GlassBadge } from '@/components/glass';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Mail,
  MessageCircle,
  Phone,
  Star
} from 'lucide-react';;

export default function AboutSettings() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const helpOptions = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      icon: <HelpCircle className="w-5 h-5" />,
      action: () => showToast('Opening FAQ...', 'success'),
    },
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get help from our team',
      icon: <MessageCircle className="w-5 h-5" />,
      action: () => navigate('/app/support'),
    },
    {
      id: 'phone',
      title: 'Call Us',
      description: '1-800-ORBITPAY',
      icon: <Phone className="w-5 h-5" />,
      action: () => showToast('Opening phone...', 'success'),
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'support@orbitpaybank.online',
      icon: <Mail className="w-5 h-5" />,
      action: () => showToast('Opening email...', 'success'),
    },
  ];

  const legalOptions = [
    {
      id: 'terms',
      title: 'Terms of Service',
      description: 'Last updated: January 2024',
      icon: <FileText className="w-5 h-5" />,
      action: () => showToast('Opening Terms of Service...', 'success'),
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      description: 'How we protect your data',
      icon: <FileText className="w-5 h-5" />,
      action: () => showToast('Opening Privacy Policy...', 'success'),
    },
    {
      id: 'licenses',
      title: 'Open Source Licenses',
      description: 'Third-party software attributions',
      icon: <FileText className="w-5 h-5" />,
      action: () => showToast('Opening Licenses...', 'success'),
    },
    {
      id: 'cookies',
      title: 'Cookie Policy',
      description: 'How we use cookies',
      icon: <FileText className="w-5 h-5" />,
      action: () => showToast('Opening Cookie Policy...', 'success'),
    },
  ];

  return (
    <div className="p-5 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/app/settings')}
          className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5 text-emerald-800 rotate-180" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-emerald-800">Help & About</h1>
          <p className="text-sm text-emerald-800/50">Get support and learn more</p>
        </div>
      </div>

      {/* App Info */}
      <GlassCard className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-2xl font-bold text-white">OP</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-emerald-800">OrbitPay Credit Union</h2>
            <p className="text-sm text-emerald-800/70">Version 2.0.0 (Build 2024.07)</p>
            <div className="flex items-center gap-2 mt-2">
              <GlassBadge variant="green" size="sm">Production</GlassBadge>
              <GlassBadge variant="mint" size="sm">Stable</GlassBadge>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Rate App */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-emerald-800">Enjoying OrbitPay?</p>
            <p className="text-xs text-emerald-800/60">Rate us on the App Store</p>
          </div>
          <button
            onClick={() => showToast('Thank you for your support!', 'success')}
            className="px-4 py-2 bg-amber-500 text-white rounded-full text-sm font-medium"
          >
            Rate App
          </button>
        </div>
      </GlassCard>

      {/* Help & Support */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-emerald-800/60 uppercase tracking-wider">Help & Support</h3>
        {helpOptions.map((option) => (
          <GlassCard key={option.id} className="p-4">
            <button
              onClick={option.action}
              className="w-full flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                {option.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-emerald-800">{option.title}</p>
                <p className="text-xs text-emerald-800/60">{option.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-800/40" />
            </button>
          </GlassCard>
        ))}
      </div>

      {/* Legal */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-emerald-800/60 uppercase tracking-wider">Legal</h3>
        {legalOptions.map((option) => (
          <GlassCard key={option.id} className="p-4">
            <button
              onClick={option.action}
              className="w-full flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                {option.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-emerald-800">{option.title}</p>
                <p className="text-xs text-emerald-800/60">{option.description}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-emerald-800/40" />
            </button>
          </GlassCard>
        ))}
      </div>

      {/* Certifications */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold text-emerald-800/60 uppercase tracking-wider mb-4">Certifications & Compliance</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs font-medium text-emerald-800">FDIC Insured</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs font-medium text-emerald-800">NCUA</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs font-medium text-emerald-800">SOC 2</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs font-medium text-emerald-800">PCI DSS</p>
          </div>
        </div>
      </GlassCard>

      {/* Footer */}
      <div className="text-center py-6 space-y-2">
        <p className="text-sm text-emerald-800/60">© 2024 OrbitPay Credit Union</p>
        <p className="text-xs text-emerald-800/40">All rights reserved. Member FDIC.</p>
        <p className="text-xs text-emerald-800/30">Made with security in mind</p>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-24 left-4 right-4 z-[200] p-4 rounded-2xl shadow-lg flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </motion.div>
      )}
    </div>
  );
}
