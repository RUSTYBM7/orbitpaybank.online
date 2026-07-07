import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, GlassButton, GlassBadge } from '@/components/glass';
import { PhotoHero, TEMPLATE_PHOTOS } from '@/components/bright';
import { useStore } from '@/store';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bitcoin,
  Check,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  QrCode,
  RefreshCw,
  Send,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap
} from 'lucide-react';;
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

type CryptoTab = 'portfolio' | 'prices';
type ActionTab = 'deposit' | 'withdraw' | 'send' | 'receive';

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  color: string;
  icon: React.ReactNode;
  chartData: { time: string; price: number }[];
  address: string;
}

const cryptoAssets: CryptoAsset[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 0.15,
    price: 67540,
    change24h: 2.34,
    color: '#F4F7C0',
    icon: <Bitcoin className="w-5 h-5" />,
    chartData: [
      { time: '00:00', price: 66200 }, { time: '04:00', price: 65800 },
      { time: '08:00', price: 67100 }, { time: '12:00', price: 66800 },
      { time: '16:00', price: 67900 }, { time: '20:00', price: 67540 },
    ],
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 2.5,
    price: 3450,
    change24h: -1.23,
    color: '#A8E6CF',
    icon: <div className="w-5 h-5 rounded-full bg-[#627EEA]" />,
    chartData: [
      { time: '00:00', price: 3500 }, { time: '04:00', price: 3420 },
      { time: '08:00', price: 3480 }, { time: '12:00', price: 3400 },
      { time: '16:00', price: 3460 }, { time: '20:00', price: 3450 },
    ],
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    balance: 25,
    price: 145,
    change24h: 5.67,
    color: '#DDA0DD',
    icon: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195]" />,
    chartData: [
      { time: '00:00', price: 138 }, { time: '04:00', price: 140 },
      { time: '08:00', price: 142 }, { time: '12:00', price: 143 },
      { time: '16:00', price: 146 }, { time: '20:00', price: 145 },
    ],
    address: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
  },
];

const cryptoTransactions = [
  { id: 'ctx1', type: 'deposit' as const, asset: 'BTC', amount: 0.05, usdValue: 3377, time: '2 hours ago', txHash: '0x1234...5678' },
  { id: 'ctx2', type: 'withdrawal' as const, asset: 'ETH', amount: 0.5, usdValue: 1725, time: 'Yesterday', txHash: '0xabcd...ef01' },
  { id: 'ctx3', type: 'deposit' as const, asset: 'SOL', amount: 10, usdValue: 1450, time: '2 days ago', txHash: '4ERt...xYZa' },
  { id: 'ctx4', type: 'send' as const, asset: 'BTC', amount: 0.01, usdValue: 675, time: '3 days ago', txHash: '0x9876...5432' },
  { id: 'ctx5', type: 'receive' as const, asset: 'BTC', amount: 0.02, usdValue: 1350, time: '4 days ago', txHash: '0xdef0...abc1' },
];

export default function CryptoScreen() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<CryptoTab>('portfolio');
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(cryptoAssets[0]);
  const [actionTab, setActionTab] = useState<ActionTab>('deposit');
  const [showActionModal, setShowActionModal] = useState<ActionTab | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);

  if (!user) return null;

  const totalPortfolioValue = cryptoAssets.reduce((sum, asset) => sum + asset.balance * asset.price, 0);
  const totalChange = cryptoAssets.reduce((sum, asset) => sum + (asset.balance * asset.price * asset.change24h / 100), 0);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleAction = (action: ActionTab) => {
    setShowActionModal(action);
  };

  return (
    <div className="p-5 space-y-5 animate-fade-in">
      {/* Hero photo — template /imgs/ library */}
      <PhotoHero
        imageUrl={TEMPLATE_PHOTOS.crypto.hero}
        eyebrow="Crypto"
        title="Trade. Earn. Hold."
        description="BTC, ETH, and 200+ tokens — buy, sell, swap, and stake from the same wallet that powers your bank."
        accent="cyan"
        ctaLabel="Explore markets"
        onCta={() => navigate('/app/invest')}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-emerald-800">Crypto</h1>
          <p className="text-sm text-emerald-800/50">Manage your digital assets</p>
        </div>
        <div className="flex gap-1 glass-pill p-1">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'portfolio' ? 'bg-emerald-800 text-white' : 'text-emerald-800/40'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'prices' ? 'bg-emerald-800 text-white' : 'text-emerald-800/40'
            }`}
          >
            Prices
          </button>
        </div>
      </div>

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <>
          {/* Total Portfolio Value Card */}
          <GlassCard intensity="high" className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-[#A8E6CF]/50 rounded-full blur-3xl" />
              <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-[#DDA0DD]/40 rounded-full blur-3xl" />
              <div className="absolute top-[40%] left-[30%] w-32 h-32 bg-[#F4F7C0]/30 rounded-full blur-2xl" />
            </div>
            <div className="relative z-10">
              <p className="text-sm text-emerald-800/50 mb-1">Total Portfolio Value</p>
              <h2 className="text-4xl font-light text-emerald-800 mb-2">
                ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-2">
                <GlassBadge variant={totalChange >= 0 ? 'green' : 'red'} size="sm">
                  {totalChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)} today
                </GlassBadge>
              </div>
            </div>
          </GlassCard>

          {/* Asset Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
            {cryptoAssets.map((asset) => (
              <motion.button
                key={asset.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAsset(asset)}
                className={`flex-shrink-0 px-4 py-3 rounded-2xl border-2 transition-all ${
                  selectedAsset.id === asset.id
                    ? 'border-[#0A0A0A] bg-emerald-800/5'
                    : 'border-transparent bg-white/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${asset.color}30` }}
                  >
                    <span style={{ color: asset.color }}>{asset.icon}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-emerald-800">{asset.symbol}</p>
                    <p className="text-xs text-emerald-800/40">
                      ${(asset.balance * asset.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Selected Asset Detail */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${selectedAsset.color}30` }}
                >
                  <span style={{ color: selectedAsset.color }}>{selectedAsset.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-800">{selectedAsset.name}</p>
                  <p className="text-xs text-emerald-800/40">{selectedAsset.symbol}</p>
                </div>
              </div>
              <GlassBadge variant={selectedAsset.change24h >= 0 ? 'green' : 'red'} size="sm">
                {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h}%
              </GlassBadge>
            </div>

            <p className="text-3xl font-medium text-emerald-800 mb-1">
              ${(selectedAsset.balance * selectedAsset.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-emerald-800/50 mb-4">
              {selectedAsset.balance} {selectedAsset.symbol} @ ${selectedAsset.price.toLocaleString()}
            </p>

            {/* Mini Chart */}
            <div className="h-32 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedAsset.chartData}>
                  <defs>
                    <linearGradient id={`gradient-${selectedAsset.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={selectedAsset.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={selectedAsset.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={selectedAsset.color}
                    strokeWidth={2.5}
                    fill={`url(#gradient-${selectedAsset.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2">
            <GlassButton
              variant="default"
              className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
              onClick={() => handleAction('deposit')}
            >
              <Download className="w-5 h-5 text-[#2ECC71]" />
              <span className="text-xs">Buy</span>
            </GlassButton>
            <GlassButton
              variant="default"
              className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
              onClick={() => handleAction('withdraw')}
            >
              <ArrowUpRight className="w-5 h-5 text-[#FF6B6B]" />
              <span className="text-xs">Sell</span>
            </GlassButton>
            <GlassButton
              variant="default"
              className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
              onClick={() => handleAction('send')}
            >
              <Send className="w-5 h-5 text-emerald-800/60" />
              <span className="text-xs">Send</span>
            </GlassButton>
            <GlassButton
              variant="default"
              className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
              onClick={() => handleAction('receive')}
            >
              <Download className="w-5 h-5 text-[#A8E6CF]" />
              <span className="text-xs">Receive</span>
            </GlassButton>
          </div>

          {/* Cash Loan Promo */}
          <GlassCard className="p-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#DDA0DD]/60 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#DDA0DD]/30 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-emerald-800" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-emerald-800">Crypto Loan</p>
                <p className="text-xs text-emerald-800/50">Borrow against your crypto</p>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-800/30" />
            </div>
          </GlassCard>

          {/* Recent Crypto Transactions */}
          <div>
            <h3 className="font-medium text-emerald-800 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {cryptoTransactions.map((txn) => (
                <GlassCard key={txn.id} className="px-4 py-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    txn.type === 'deposit' || txn.type === 'receive'
                      ? 'bg-[#2ECC71]/15'
                      : 'bg-[#FF6B6B]/10'
                  }`}>
                    {txn.type === 'deposit' ? (
                      <ArrowDownRight className="w-5 h-5 text-[#2ECC71]" />
                    ) : txn.type === 'receive' ? (
                      <Download className="w-5 h-5 text-[#2ECC71]" />
                    ) : txn.type === 'send' ? (
                      <Send className="w-5 h-5 text-[#FF6B6B]" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-[#FF6B6B]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-800 capitalize">
                      {txn.type} {txn.asset}
                    </p>
                    <p className="text-xs text-emerald-800/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {txn.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      txn.type === 'deposit' || txn.type === 'receive' ? 'text-[#2ECC71]' : 'text-[#FF6B6B]'
                    }`}>
                      {txn.type === 'deposit' || txn.type === 'receive' ? '+' : '-'}{txn.amount} {txn.asset}
                    </p>
                    <p className="text-xs text-emerald-800/40">${txn.usdValue.toLocaleString()}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Prices Tab */}
      {activeTab === 'prices' && (
        <div className="space-y-4 pb-6">
          <div className="space-y-2">
            {cryptoAssets.map((asset) => (
              <GlassCard key={asset.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${asset.color}30` }}
                  >
                    <span style={{ color: asset.color }}>{asset.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-800">{asset.name}</p>
                    <p className="text-xs text-emerald-800/40">{asset.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-800">
                      ${asset.price.toLocaleString()}
                    </p>
                    <GlassBadge
                      variant={asset.change24h >= 0 ? 'green' : 'red'}
                      size="sm"
                    >
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </GlassBadge>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end"
            onClick={() => setShowActionModal(null)}
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
                <h2 className="text-xl font-bold text-emerald-800">
                  {showActionModal === 'deposit' && 'Buy Crypto'}
                  {showActionModal === 'withdraw' && 'Sell Crypto'}
                  {showActionModal === 'send' && 'Send Crypto'}
                  {showActionModal === 'receive' && 'Receive Crypto'}
                </h2>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
                {/* Action Type Tabs */}
                <div className="flex gap-2 mb-6">
                  {(['deposit', 'withdraw', 'send', 'receive'] as const).map((action) => (
                    <button
                      key={action}
                      onClick={() => setActionTab(action)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                        actionTab === action
                          ? 'bg-emerald-800 text-white'
                          : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-emerald-800/60'
                      }`}
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </button>
                  ))}
</div>

                {/* Asset Selection */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-emerald-800 mb-2">Asset</p>
                  <div className="flex gap-2">
                    {cryptoAssets.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center ${
                          selectedAsset.id === asset.id
                            ? 'border-[#0A0A0A] bg-emerald-800/5'
                            : 'border-transparent bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
                        }`}
                      >
                        <span className="text-sm">{asset.symbol}</span>
                        <span className="text-xs text-emerald-800/40">{asset.balance}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-emerald-800 mb-2">
                    {showActionModal === 'send' || showActionModal === 'receive' ? 'Amount' : 'Amount in USD'}
                  </p>
                  <div className="flex items-center gap-2 p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl">
                    <DollarSign className="w-5 h-5 text-emerald-800/40" />
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-transparent outline-none text-lg text-emerald-800"
                    />
                    <span className="text-sm text-emerald-800/40">
                      {showActionModal === 'send' || showActionModal === 'receive' ? selectedAsset.symbol : 'USD'}
                    </span>
                  </div>
                  {transferAmount && (
                    <p className="text-xs text-emerald-800/40 mt-1">
                      ≈ {selectedAsset.symbol} {(Number(transferAmount) / selectedAsset.price).toFixed(6)}
                    </p>
                  )}
                </div>

                {/* Recipient Address (for Send) */}
                {showActionModal === 'send' && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-emerald-800 mb-2">Recipient Address</p>
                    <div className="flex items-center gap-2 p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl">
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Enter wallet address"
                        className="flex-1 bg-transparent outline-none text-sm text-emerald-800"
                      />
                      <QrCode className="w-5 h-5 text-emerald-800/40 cursor-pointer" />
                    </div>
                  </div>
                )}

                {/* Receive Address (for Receive) */}
                {showActionModal === 'receive' && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-emerald-800 mb-2">Your {selectedAsset.symbol} Address</p>
                    <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-emerald-800/40 truncate flex-1 mr-2">
                          {selectedAsset.address}
                        </p>
                        <button
                          onClick={() => copyAddress(selectedAsset.address)}
                          className="flex items-center gap-1 text-xs text-[#A8E6CF]"
                        >
                          {copiedAddress === selectedAsset.address ? (
                            <>
                              <Check className="w-4 h-4" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => setShowQrCode(!showQrCode)}
                        className="w-full mt-2 p-3 bg-white rounded-xl flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-5 h-5 text-emerald-800/60" />
                        <span className="text-sm text-emerald-800">
                          {showQrCode ? 'Hide QR Code' : 'Show QR Code'}
                        </span>
                      </button>
                      {showQrCode && (
                        <div className="mt-3 p-4 bg-white rounded-xl flex justify-center">
                          <div className="w-32 h-32 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl flex items-center justify-center">
                            <QrCode className="w-24 h-24 text-emerald-800/20" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Network Fee */}
                <GlassCard className="p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-800/40" />
                      <span className="text-sm text-emerald-800">Network Fee</span>
                    </div>
                    <span className="text-sm font-medium text-emerald-800">
                      ~$2.50
                    </span>
                  </div>
                </GlassCard>
              </div>

              {/* Fixed Footer - ALWAYS VISIBLE */}
              <div
                className="flex-shrink-0 px-5 py-4 border-t border-emerald-100/50 bg-white"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 24px)' }}
              >
                <div className="flex gap-3">
                  <GlassButton
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowActionModal(null)}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    variant="gradient"
                    className="flex-1"
                    onClick={() => setShowActionModal(null)}
                  >
                    {showActionModal === 'deposit' && 'Buy'}
                    {showActionModal === 'withdraw' && 'Sell'}
                    {showActionModal === 'send' && 'Send'}
                    {showActionModal === 'receive' && 'Done'}
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
