import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, GlassButton, GlassBadge } from '@/components/glass';
import { useStore } from '@/store';
import {
  AlertCircle,
  Bot,
  Calendar,
  DollarSign,
  FileText,
  History,
  PieChart,
  Sliders,
  Sparkles,
  Sun,
  Target,
  TrendingDown,
  TrendingUp
} from 'lucide-react';;
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { PhotoHero, TEMPLATE_PHOTOS } from '@/components/bright';

const aiInvestmentInsights = [
  { text: "Your portfolio has outperformed 78% of similar investors", icon: TrendingUp, color: 'emerald' },
  { text: "Consider increasing crypto allocation by 5% for better diversification", icon: Sparkles, color: 'violet' },
  { text: "Market volatility expected next week - consider defensive positions", icon: AlertCircle, color: 'amber' },
  { text: "You're on track to reach your retirement goal 3 years early", icon: Target, color: 'cyan' },
];

const chartData = {
  '1W': [
    { day: 'Mon', value: 4200 }, { day: 'Tue', value: 4450 },
    { day: 'Wed', value: 4100 }, { day: 'Thu', value: 4800 },
    { day: 'Fri', value: 5100 }, { day: 'Sat', value: 5350 },
    { day: 'Sun', value: 5832 },
  ],
  '1M': [
    { day: 'W1', value: 3200 }, { day: 'W2', value: 3800 },
    { day: 'W3', value: 4500 }, { day: 'W4', value: 5832 },
  ],
  '6M': [
    { day: 'Jul', value: 1200 }, { day: 'Aug', value: 2100 },
    { day: 'Sep', value: 1800 }, { day: 'Oct', value: 3500 },
    { day: 'Nov', value: 4800 }, { day: 'Dec', value: 5832 },
  ],
  '1Y': [
    { day: 'Q1', value: 800 }, { day: 'Q2', value: 2200 },
    { day: 'Q3', value: 3500 }, { day: 'Q4', value: 5832 },
  ],
  'ALL': [
    { day: '2022', value: 200 }, { day: '2023', value: 1800 },
    { day: '2024', value: 5832 },
  ],
};

type TimeRange = '1W' | '1M' | '6M' | '1Y' | 'ALL';

export default function InvestmentScreen() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');
  const [oneTimeAmount, setOneTimeAmount] = useState(1000);
  const [monthlyAmount, setMonthlyAmount] = useState(200);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'history'>('overview');
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [currentInsight, setCurrentInsight] = useState(0);
  const [aiTypingText, setAiTypingText] = useState('');

  // AI typing effect for investment insights
  useEffect(() => {
    const insight = aiInvestmentInsights[currentInsight];
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
      setCurrentInsight((prev) => (prev + 1) % aiInvestmentInsights.length);
    }, 8000);

    return () => {
      clearInterval(typeInterval);
      clearInterval(switchInterval);
    };
  }, [currentInsight]);

  if (!user) return null;

  const earnings = 58.32;
  const totalInvested = 12500;
  const currentValue = totalInvested + earnings;
  const returnPercent = ((earnings / totalInvested) * 100).toFixed(2);

  const timeRanges: TimeRange[] = ['1W', '1M', '6M', '1Y', 'ALL'];

  const assetAllocation = [
    { name: 'Stocks', value: 45, color: '#A8E6CF' },
    { name: 'Bonds', value: 30, color: '#DDA0DD' },
    { name: 'Crypto', value: 15, color: '#F4F7C0' },
    { name: 'Cash', value: 10, color: '#88D4AB' },
  ];

  const investmentProducts = [
    { id: '1', name: 'Growth Portfolio', risk: 'High', return: '+12.5%', min: 500 },
    { id: '2', name: 'Balanced Fund', risk: 'Medium', return: '+8.2%', min: 250 },
    { id: '3', name: 'Safe Savings', risk: 'Low', return: '+4.5%', min: 100 },
  ];

  const investmentHistory = [
    { id: '1', date: '2024-01-15', type: 'Deposit', amount: 500, status: 'completed' },
    { id: '2', date: '2024-01-10', type: 'Purchase', amount: 1000, status: 'completed' },
    { id: '3', date: '2024-01-05', type: 'Withdrawal', amount: 200, status: 'pending' },
  ];

  const currentInsightData = aiInvestmentInsights[currentInsight];

  return (
    <div className="p-5 space-y-5 animate-fade-in">
      {/* Hero photo — template /imgs/ library */}
      <PhotoHero
        imageUrl={TEMPLATE_PHOTOS.investment.hero}
        eyebrow="AI-powered"
        title="Watch your savings grow"
        description="Diversified portfolios, real-time insights, and goal-based investing — all on autopilot."
        accent="emerald"
        ctaLabel="Start investing"
        onCta={() => navigate('/app/onboarding/wizard')}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-emerald-800">Investments</h1>
          <p className="text-sm text-emerald-800/50">Grow your wealth smartly</p>
        </div>
        <button className="p-2 rounded-full bg-white/50">
          <FileText className="w-5 h-5 text-emerald-800/60" />
        </button>
      </div>

      {/* AI Investment Insights Banner */}
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
              <p className="text-xs font-semibold text-cyan-600">AI Portfolio Advisor</p>
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
                currentInsightData.color === 'violet' ? 'text-violet-500' :
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

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-white/50 rounded-full">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'products', label: 'Products', icon: Target },
          { id: 'history', label: 'History', icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-800 text-white'
                : 'text-emerald-800/60'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
      {/* Risk Profile */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-[#A8E6CF]" />
          <h3 className="font-medium text-emerald-800">Risk Profile</h3>
          <span className="ml-auto text-xs text-emerald-800/40">AI Optimized</span>
        </div>
        <div className="flex gap-2">
          {(['conservative', 'moderate', 'aggressive'] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => setRiskProfile(risk)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                riskProfile === risk
                  ? 'bg-[#A8E6CF] text-emerald-800'
                  : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-emerald-800/40'
              }`}
            >
              {risk.charAt(0).toUpperCase() + risk.slice(1)}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Earnings Card */}
      <GlassCard intensity="high" className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4F7C0] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#A8E6CF] rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <GlassBadge variant="yellow" size="sm">
              <TrendingUp className="w-3 h-3" /> +${earnings}/week
            </GlassBadge>
          </div>
          <p className="text-sm text-emerald-800/50 mb-1">You have earned</p>
          <motion.h2
            key={earnings}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-4xl font-light text-emerald-800 mb-3"
          >
            ${earnings.toFixed(2)}
          </motion.h2>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-emerald-800/40">Total Invested</p>
              <p className="text-lg font-medium text-emerald-800">${totalInvested.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-800/40">Current Value</p>
              <p className="text-lg font-medium text-[#2ECC71]">${currentValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-800/40">Return</p>
              <p className="text-lg font-medium text-[#2ECC71]">+{returnPercent}%</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Chart */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-emerald-800">Performance</h3>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">+12.5%</span>
          </div>
          <div className="flex gap-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-emerald-800 text-white'
                    : 'text-emerald-800/40 hover:text-emerald-800/70'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData[timeRange]}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A8E6CF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A8E6CF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#0A0A0A', opacity: 0.4 }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#A8E6CF"
                strokeWidth={2.5}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Investment Sliders */}
      <div className="space-y-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#A8E6CF]" />
              <span className="font-medium text-emerald-800">One-Time Investment</span>
            </div>
            <span className="text-lg font-medium text-emerald-800">${oneTimeAmount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={100}
            max={50000}
            step={100}
            value={oneTimeAmount}
            onChange={(e) => setOneTimeAmount(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #A8E6CF 0%, #A8E6CF ${(oneTimeAmount / 50000) * 100}%, rgba(255,255,255,0.3) ${(oneTimeAmount / 50000) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-emerald-800/30">$100</span>
            <span className="text-xs text-emerald-800/30">$50,000</span>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#DDA0DD]" />
              <span className="font-medium text-emerald-800">Monthly Investment</span>
            </div>
            <span className="text-lg font-medium text-emerald-800">${monthlyAmount}</span>
          </div>
          <input
            type="range"
            min={50}
            max={5000}
            step={50}
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #DDA0DD 0%, #DDA0DD ${(monthlyAmount / 5000) * 100}%, rgba(255,255,255,0.3) ${(monthlyAmount / 5000) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-emerald-800/30">$50</span>
            <span className="text-xs text-emerald-800/30">$5,000</span>
          </div>
        </GlassCard>
      </div>

      {/* Projected Returns */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-medium text-emerald-800">Projected Returns (5 Years)</h3>
          <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full">AI Optimized</span>
        </div>
        <div className="space-y-2">
          {[
            { year: '1 Year', value: oneTimeAmount + monthlyAmount * 12 + 450 },
            { year: '3 Years', value: oneTimeAmount + monthlyAmount * 36 + 2800 },
            { year: '5 Years', value: oneTimeAmount + monthlyAmount * 60 + 7200 },
          ].map((proj) => (
            <div key={proj.year} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
              <span className="text-sm text-emerald-800/60">{proj.year}</span>
              <span className="text-sm font-medium text-[#2ECC71]">
                ${proj.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Asset Allocation */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-[#DDA0DD]" />
          <h3 className="font-medium text-emerald-800">Asset Allocation</h3>
          <span className="ml-auto text-xs text-emerald-800/40">AI Balanced</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#F7F9F4" strokeWidth="8" fill="none" />
              {assetAllocation.reduce((acc, item, index) => {
                const circumference = 2 * Math.PI * 40;
                const strokeDasharray = `${(item.value / 100) * circumference} ${circumference}`;
                const offset = acc.offset - (index > 0 ? (assetAllocation[index - 1].value / 100) * circumference : 0);
                acc.elements.push(
                  <motion.circle
                    key={item.name}
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={item.color}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-acc.offset}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 251.2" }}
                    animate={{ strokeDasharray: `${(item.value / 100) * circumference} ${circumference}` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                );
                acc.offset += (item.value / 100) * circumference;
                return acc;
              }, { elements: [] as JSX.Element[], offset: 0 }).elements}
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            {assetAllocation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-emerald-800">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-emerald-800">{item.value}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Action Buttons */}
      <div className="flex gap-3 pb-6">
        <GlassButton variant="gradient" fullWidth size="lg" className="rounded-2xl">
          Deposit
        </GlassButton>
        <GlassButton variant="primary" fullWidth size="lg" className="rounded-2xl">
          Purchase
        </GlassButton>
      </div>
      </>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-4 pb-6">
          <h3 className="font-medium text-emerald-800">Investment Products</h3>
          {investmentProducts.map((product) => (
            <GlassCard key={product.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-emerald-800">{product.name}</h4>
                <GlassBadge variant={product.risk === 'High' ? 'red' : product.risk === 'Medium' ? 'yellow' : 'green'} size="sm">
                  {product.risk} Risk
                </GlassBadge>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-emerald-800/50">Expected Return</span>
                <span className="text-lg font-medium text-[#2ECC71]">{product.return}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-emerald-800/50">Minimum Investment</span>
                <span className="text-sm font-medium text-emerald-800">${product.min}</span>
              </div>
              <GlassButton fullWidth size="sm" className="rounded-xl">
                Invest Now
              </GlassButton>
            </GlassCard>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4 pb-6">
          <h3 className="font-medium text-emerald-800">Investment History</h3>
          {investmentHistory.map((item) => (
            <GlassCard key={item.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-emerald-800">{item.type}</p>
                  <p className="text-xs text-emerald-800/50">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${item.type === 'Withdrawal' ? 'text-[#FF6B6B]' : 'text-[#2ECC71]'}`}>
                    {item.type === 'Withdrawal' ? '-' : '+'}${item.amount}
                  </p>
                  <GlassBadge variant={item.status === 'completed' ? 'green' : 'yellow'} size="sm">
                    {item.status}
                  </GlassBadge>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
