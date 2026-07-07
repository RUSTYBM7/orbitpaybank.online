import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, GlassButton, GlassBadge } from '@/components/glass';
import {
  Receipt, Download, Share2, Check, Clock, CreditCard,
  User, ArrowRight, QrCode, Copy, CheckCheck, Printer
} from 'lucide-react';

interface TransactionReceipt {
  id: string;
  reference: string;
  timestamp: Date;
  type: 'transfer' | 'payment' | 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  fee: number;
  sender: {
    name: string;
    account: string;
  };
  recipient: {
    name: string;
    account: string;
    bank?: string;
  };
  status: 'completed' | 'pending' | 'failed';
  description: string;
  category?: string;
}

interface ReceiptGeneratorProps {
  transaction: TransactionReceipt;
  onClose?: () => void;
}

export default function ReceiptGenerator({ transaction, onClose }: ReceiptGeneratorProps) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const copyReference = () => {
    navigator.clipboard.writeText(transaction.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Create a simple HTML receipt for printing/downloading
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OrbitPay Receipt - ${transaction.reference}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #0A0A0A; }
            .logo span { color: #A8E6CF; }
            .divider { border-top: 1px dashed #ccc; margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { color: #666; }
            .value { font-weight: 500; }
            .amount { font-size: 32px; font-weight: bold; text-align: center; margin: 20px 0; }
            .amount.positive { color: #2ECC71; }
            .amount.negative { color: #FF6B6B; }
            .status { text-align: center; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
            .qr { width: 120px; height: 120px; margin: 20px auto; background: #f0f0f0; display: flex; align-items: center; justify-content: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Orbit<span>Pay</span></div>
            <p style="color: #666; font-size: 12px;">Credit Union</p>
          </div>
          <div class="divider"></div>
          <div class="row">
            <span class="label">Reference</span>
            <span class="value">${transaction.reference}</span>
          </div>
          <div class="row">
            <span class="label">Date & Time</span>
            <span class="value">${transaction.timestamp.toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Transaction Type</span>
            <span class="value">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
          </div>
          <div class="divider"></div>
          <div class="amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
            ${transaction.amount > 0 ? '+' : ''}${transaction.currency} ${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div class="divider"></div>
          <div class="row">
            <span class="label">From</span>
            <span class="value">${transaction.sender.name}<br><small>${transaction.sender.account}</small></span>
          </div>
          <div style="text-align: center; margin: 10px 0;">↓</div>
          <div class="row">
            <span class="label">To</span>
            <span class="value">${transaction.recipient.name}<br><small>${transaction.recipient.account}</small></span>
          </div>
          <div class="divider"></div>
          <div class="row">
            <span class="label">Description</span>
            <span class="value">${transaction.description}</span>
          </div>
          ${transaction.fee > 0 ? `
          <div class="row">
            <span class="label">Fee</span>
            <span class="value">${transaction.currency} ${transaction.fee.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="status">
            <span style="display: inline-block; padding: 6px 16px; background: ${transaction.status === 'completed' ? '#d4edda' : transaction.status === 'pending' ? '#fff3cd' : '#f8d7da'}; color: ${transaction.status === 'completed' ? '#155724' : transaction.status === 'pending' ? '#856404' : '#721c24'}; border-radius: 20px; font-size: 12px; font-weight: 500;">
              ${transaction.status.toUpperCase()}
            </span>
          </div>
          <div class="qr">QR Code</div>
          <div class="footer">
            <p>Thank you for using OrbitPay Credit Union</p>
            <p>For support, contact support@orbitpaybank.online</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OrbitPay_Receipt_${transaction.reference}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'OrbitPay Receipt',
          text: `Transaction ${transaction.reference}: ${transaction.currency} ${Math.abs(transaction.amount).toLocaleString()}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleDownload();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>OrbitPay Receipt - ${transaction.reference}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 400px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #0A0A0A; }
              .logo span { color: #A8E6CF; }
              .divider { border-top: 1px dashed #ccc; margin: 20px 0; }
              .row { display: flex; justify-content: space-between; margin: 10px 0; }
              .label { color: #666; }
              .value { font-weight: 500; }
              .amount { font-size: 32px; font-weight: bold; text-align: center; margin: 20px 0; }
              .amount.positive { color: #2ECC71; }
              .amount.negative { color: #FF6B6B; }
              .status { text-align: center; margin: 20px 0; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Orbit<span>Pay</span></div>
              <p style="color: #666; font-size: 12px;">Credit Union</p>
            </div>
            <div class="divider"></div>
            <div class="row">
              <span class="label">Reference</span>
              <span class="value">${transaction.reference}</span>
            </div>
            <div class="row">
              <span class="label">Date & Time</span>
              <span class="value">${transaction.timestamp.toLocaleString()}</span>
            </div>
            <div class="divider"></div>
            <div class="amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
              ${transaction.currency} ${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div class="divider"></div>
            <div class="row">
              <span class="label">From</span>
              <span class="value">${transaction.sender.name}<br><small>${transaction.sender.account}</small></span>
            </div>
            <div style="text-align: center; margin: 10px 0;">↓</div>
            <div class="row">
              <span class="label">To</span>
              <span class="value">${transaction.recipient.name}<br><small>${transaction.recipient.account}</small></span>
            </div>
            <div class="divider"></div>
            <div class="row">
              <span class="label">Description</span>
              <span class="value">${transaction.description}</span>
            </div>
            ${transaction.fee > 0 ? `
            <div class="row">
              <span class="label">Fee</span>
              <span class="value">${transaction.currency} ${transaction.fee.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="status">
              <span style="display: inline-block; padding: 6px 16px; background: ${transaction.status === 'completed' ? '#d4edda' : transaction.status === 'pending' ? '#fff3cd' : '#f8d7da'}; color: ${transaction.status === 'completed' ? '#155724' : transaction.status === 'pending' ? '#856404' : '#721c24'}; border-radius: 20px; font-size: 12px; font-weight: 500;">
                ${transaction.status.toUpperCase()}
              </span>
            </div>
            <div class="footer">
              <p>Thank you for using OrbitPay Credit Union</p>
              <p>For support, contact support@orbitpaybank.online</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <motion.div
      ref={receiptRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl overflow-hidden max-w-sm mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#A8E6CF] to-[#DDA0DD] p-6 text-center">
        <div className="flex items-center justify-center gap-1 text-xl font-bold text-[#0A0A0A] mb-1">
          Orbit<span className="text-white">Pay</span>
        </div>
        <p className="text-xs text-[#0A0A0A]/60">Credit Union</p>
        <div className="mt-4">
          <GlassBadge
            variant={transaction.status === 'completed' ? 'green' : transaction.status === 'pending' ? 'yellow' : 'red'}
            size="sm"
          >
            {transaction.status === 'completed' && <Check className="w-3 h-3 mr-1" />}
            {transaction.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
            {transaction.status.toUpperCase()}
          </GlassBadge>
        </div>
      </div>

      {/* Amount */}
      <div className="p-6 text-center border-b border-dashed border-[#0A0A0A]/10">
        <p className="text-sm text-[#0A0A0A]/50 mb-1">
          {transaction.type === 'transfer' ? 'Transfer' : transaction.type === 'payment' ? 'Payment' : transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
        </p>
        <p className={`text-4xl font-light ${transaction.amount > 0 ? 'text-[#2ECC71]' : 'text-[#FF6B6B]'}`}>
          {transaction.amount > 0 ? '+' : ''}{transaction.currency} {Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        {transaction.fee > 0 && (
          <p className="text-xs text-[#0A0A0A]/40 mt-1">Fee: {transaction.currency} {transaction.fee.toFixed(2)}</p>
        )}
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        {/* Reference */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#0A0A0A]/40" />
            <span className="text-xs text-[#0A0A0A]/50">Reference</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#0A0A0A]">{transaction.reference}</span>
            <button
              onClick={copyReference}
              className="p-1 hover:bg-[#F7F9F4] rounded"
            >
              {copied ? (
                <CheckCheck className="w-4 h-4 text-[#2ECC71]" />
              ) : (
                <Copy className="w-4 h-4 text-[#0A0A0A]/40" />
              )}
            </button>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0A0A0A]/40" />
            <span className="text-xs text-[#0A0A0A]/50">Date & Time</span>
          </div>
          <span className="text-xs text-[#0A0A0A]">
            {transaction.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
            {transaction.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* From/To */}
        <div className="p-4 bg-[#F7F9F4] rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#A8E6CF]/30 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-[#0A0A0A]/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#0A0A0A]/50 mb-0.5">From</p>
              <p className="text-sm font-medium text-[#0A0A0A] truncate">{transaction.sender.name}</p>
              <p className="text-xs text-[#0A0A0A]/40">{transaction.sender.account}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-[#0A0A0A]/20 rotate-90" />
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#DDA0DD]/30 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 text-[#0A0A0A]/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#0A0A0A]/50 mb-0.5">To</p>
              <p className="text-sm font-medium text-[#0A0A0A] truncate">{transaction.recipient.name}</p>
              <p className="text-xs text-[#0A0A0A]/40">{transaction.recipient.account}</p>
              {transaction.recipient.bank && (
                <p className="text-xs text-[#0A0A0A]/30">{transaction.recipient.bank}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F4F7C0]/30 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-4 h-4 text-[#0A0A0A]/60" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#0A0A0A]/50 mb-0.5">Description</p>
            <p className="text-sm text-[#0A0A0A]">{transaction.description}</p>
          </div>
        </div>

        {/* QR Code Toggle */}
        <button
          onClick={() => setShowQr(!showQr)}
          className="w-full flex items-center justify-between p-3 bg-[#F7F9F4] rounded-xl"
        >
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#0A0A0A]/40" />
            <span className="text-sm text-[#0A0A0A]">Verification</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#A8E6CF]">
            {showQr ? 'Hide' : 'Show'} QR
          </div>
        </button>

        {showQr && (
          <div className="flex justify-center p-4 bg-white rounded-xl">
            <div className="w-24 h-24 bg-[#F7F9F4] rounded-xl flex items-center justify-center">
              <QrCode className="w-16 h-16 text-[#0A0A0A]/20" />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-5 pt-0 flex gap-3">
        <GlassButton variant="default" className="flex-1" onClick={handlePrint}>
          <Printer className="w-4 h-4" />
        </GlassButton>
        <GlassButton variant="default" className="flex-1" onClick={handleDownload}>
          <Download className="w-4 h-4" />
        </GlassButton>
        <GlassButton variant="gradient" className="flex-1" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
        </GlassButton>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 text-center">
        <p className="text-xs text-[#0A0A0A]/30">
          Thank you for using OrbitPay Credit Union
        </p>
        <p className="text-xs text-[#0A0A0A]/20">
          support@orbitpaybank.online
        </p>
      </div>
    </motion.div>
  );
}

// Helper function to generate a receipt from a transaction
export function generateReceiptFromTransaction(transaction: {
  id: string;
  userId: string;
  recipientId?: string;
  recipientName?: string;
  senderName?: string;
  type: string;
  amount: number;
  currency: string;
  fee?: number;
  description: string;
  status: string;
  timestamp: Date;
}): TransactionReceipt {
  const reference = `OP${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return {
    id: transaction.id,
    reference,
    timestamp: transaction.timestamp,
    type: transaction.type as TransactionReceipt['type'],
    amount: transaction.amount,
    currency: transaction.currency,
    fee: transaction.fee || 0,
    sender: {
      name: transaction.senderName || 'OrbitPay User',
      account: `****${transaction.userId.slice(-4)}`,
    },
    recipient: {
      name: transaction.recipientName || 'Unknown',
      account: transaction.recipientId ? `****${transaction.recipientId.slice(-4)}` : '',
    },
    status: transaction.status as TransactionReceipt['status'],
    description: transaction.description,
  };
}
